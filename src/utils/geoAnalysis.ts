import * as turf from '@turf/turf';
import { Station, CorridorPreset, CorridorAnalysisResult, GapSegment } from '../types';

export function calculateCoverageGeoJSON(stations: Station[], radiusMiles: number): any {
  const features = stations.map(station => {
    return turf.circle(station.coordinates, radiusMiles, {
      units: 'miles',
      steps: 32,
      properties: {
        stationId: station.id,
        name: station.name,
        network: station.network,
        powerType: station.power_type,
        kw: station.kw_output,
        isSimulated: !!station.is_simulated
      }
    });
  });

  return turf.featureCollection(features);
}

export function analyzeCorridor(
  corridor: CorridorPreset,
  stations: Station[],
  criticalThresholdMiles: number = 38
): CorridorAnalysisResult {
  const line = turf.lineString(corridor.waypoints);
  const totalLength = turf.length(line, { units: 'miles' });

  // Sample points every 4 miles along the corridor for high precision
  const stepMiles = 4;
  const numSteps = Math.max(12, Math.floor(totalLength / stepMiles));
  
  interface SamplePoint {
    point: [number, number];
    distanceAlongMiles: number;
    nearestStationDist: number;
    nearestStation: Station | null;
  }

  const samplePoints: SamplePoint[] = [];

  for (let i = 0; i <= numSteps; i++) {
    const distAlong = Math.min(totalLength, i * stepMiles);
    const pointOnLine = turf.along(line, distAlong, { units: 'miles' });
    const coords = pointOnLine.geometry.coordinates as [number, number];

    let minDistance = Infinity;
    let nearestSt: Station | null = null;

    for (const st of stations) {
      if (st.power_type === 'dc_fast' || st.is_simulated) {
        const d = turf.distance(coords, st.coordinates, { units: 'miles' });
        if (d < minDistance) {
          minDistance = d;
          nearestSt = st;
        }
      }
    }

    samplePoints.push({
      point: coords,
      distanceAlongMiles: distAlong,
      nearestStationDist: minDistance,
      nearestStation: nearestSt
    });
  }

  const gapSegments: GapSegment[] = [];
  let currentGapStart: SamplePoint | null = null;
  let maxGapDistInSegment = 0;
  let longestGap = 0;

  for (let i = 0; i < samplePoints.length; i++) {
    const sample = samplePoints[i];
    const isGap = sample.nearestStationDist > criticalThresholdMiles;

    if (isGap) {
      if (!currentGapStart) {
        currentGapStart = sample;
        maxGapDistInSegment = sample.nearestStationDist;
      } else {
        if (sample.nearestStationDist > maxGapDistInSegment) {
          maxGapDistInSegment = sample.nearestStationDist;
        }
      }
    } else {
      if (currentGapStart) {
        const prevSample = samplePoints[i - 1];
        const gapLength = prevSample.distanceAlongMiles - currentGapStart.distanceAlongMiles;
        if (gapLength >= 4) {
          gapSegments.push({
            id: `gap-${currentGapStart.distanceAlongMiles.toFixed(0)}`,
            startPoint: currentGapStart.point,
            endPoint: prevSample.point,
            lengthMiles: Math.round(gapLength),
            nearestStationDistanceMiles: Math.round(maxGapDistInSegment),
            severity: maxGapDistInSegment > 60 ? 'critical' : maxGapDistInSegment > 45 ? 'warning' : 'moderate',
            warningMessage: `${Math.round(gapLength)} mi corridor stretch is ${Math.round(maxGapDistInSegment)} mi away from any Fast Charger!`
          });
          if (gapLength > longestGap) longestGap = gapLength;
        }
        currentGapStart = null;
      }
    }
  }

  if (currentGapStart) {
    const lastSample = samplePoints[samplePoints.length - 1];
    const gapLength = lastSample.distanceAlongMiles - currentGapStart.distanceAlongMiles;
    if (gapLength >= 4) {
      gapSegments.push({
        id: `gap-${currentGapStart.distanceAlongMiles.toFixed(0)}`,
        startPoint: currentGapStart.point,
        endPoint: lastSample.point,
        lengthMiles: Math.round(gapLength),
        nearestStationDistanceMiles: Math.round(maxGapDistInSegment),
        severity: maxGapDistInSegment > 60 ? 'critical' : 'warning',
        warningMessage: `${Math.round(gapLength)} mi stretch is ${Math.round(maxGapDistInSegment)} mi from nearest charger.`
      });
      if (gapLength > longestGap) longestGap = gapLength;
    }
  }

  const corridorBuffer = turf.buffer(line, 20, { units: 'miles' });
  let stationsAlongRoute = 0;
  let dcFastCount = 0;

  stations.forEach(st => {
    const pt = turf.point(st.coordinates);
    if (corridorBuffer && turf.booleanPointInPolygon(pt, corridorBuffer)) {
      stationsAlongRoute++;
      if (st.power_type === 'dc_fast' || st.is_simulated) dcFastCount++;
    }
  });

  return {
    corridorName: corridor.name,
    totalDistanceMiles: Math.round(totalLength),
    stationsAlongRoute,
    dcFastCount,
    criticalGapsCount: gapSegments.filter(g => g.severity === 'critical').length,
    longestGapMiles: Math.round(longestGap),
    gapSegments,
    routeGeoJSON: line
  };
}

export function buildGapLinesGeoJSON(gapSegments: GapSegment[], corridor: CorridorPreset): any {
  const line = turf.lineString(corridor.waypoints);

  const features = gapSegments.map(gap => {
    const startPt = turf.point(gap.startPoint);
    const endPt = turf.point(gap.endPoint);
    const sliced = turf.lineSlice(startPt, endPt, line);

    sliced.properties = {
      gapId: gap.id,
      severity: gap.severity,
      lengthMiles: gap.lengthMiles,
      nearestDistance: gap.nearestStationDistanceMiles,
      warning: gap.warningMessage
    };
    return sliced;
  });

  return turf.featureCollection(features);
}
