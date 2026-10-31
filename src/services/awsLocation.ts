import { CorridorPreset } from '../types';

export interface AwsLocationConfig {
  apiKey: string;
  region: string;
  mapName: string;
  placeIndexName: string;
  routeCalculatorName: string;
  useCustomAws: boolean;
}

export const DEFAULT_AWS_CONFIG: AwsLocationConfig = {
  apiKey: '',
  region: 'us-east-1',
  mapName: 'explore.map',
  placeIndexName: 'explore.place',
  routeCalculatorName: 'explore.route',
  useCustomAws: false
};

export function getMapStyleUrl(config: AwsLocationConfig): string {
  if (config.useCustomAws && config.apiKey && config.region && config.mapName) {
    return `https://maps.geo.${config.region}.amazonaws.com/maps/v0/maps/${config.mapName}/style-descriptor?key=${config.apiKey}`;
  }
  // High-clarity dark vector map for high contrast with neon electric markers and buffer glows
  return 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
}

export const CORRIDOR_PRESETS: CorridorPreset[] = [
  {
    id: 'i15-la-vegas',
    name: 'I-15: Los Angeles ➔ Las Vegas',
    interstate: 'I-15',
    description: 'The iconic Mojave Desert crossing. Features extreme summer heat and remote desert gaps between Barstow, Baker, and Mountain Pass.',
    distanceMiles: 270,
    origin: { name: 'Los Angeles, CA', coordinates: [-118.2437, 34.0522] },
    destination: { name: 'Las Vegas, NV', coordinates: [-115.1728, 36.0694] },
    waypoints: [
      [-118.2437, 34.0522],
      [-117.2987, 34.1083],
      [-117.3820, 34.4530],
      [-117.0264, 34.8958],
      [-116.5400, 35.0300],
      [-116.0743, 35.2676],
      [-115.5400, 35.4800],
      [-115.3879, 35.6111],
      [-115.3268, 35.7797],
      [-115.1728, 36.0694]
    ]
  },
  {
    id: 'i10-la-phoenix',
    name: 'I-10: Los Angeles ➔ Phoenix',
    interstate: 'I-10',
    description: 'Traverses the Sonoran and Colorado Deserts through Coachella Valley, remote desert borderlands of Blythe, and Quartzsite.',
    distanceMiles: 375,
    origin: { name: 'Los Angeles, CA', coordinates: [-118.2437, 34.0522] },
    destination: { name: 'Phoenix, AZ', coordinates: [-112.0740, 33.4484] },
    waypoints: [
      [-118.2437, 34.0522],
      [-117.3000, 34.0500],
      [-116.7865, 33.9208],
      [-116.2156, 33.7206],
      [-115.4000, 33.6800],
      [-114.6050, 33.6103],
      [-114.2252, 33.6595],
      [-113.3000, 33.5500],
      [-112.5838, 33.4417],
      [-112.0740, 33.4484]
    ]
  },
  {
    id: 'i40-barstow-albuquerque',
    name: 'I-40: Barstow ➔ Flagstaff ➔ Albuquerque',
    interstate: 'I-40',
    description: 'Historic Route 66 corridor. High-elevation plateaus with long desert stretches between Needles, Kingman, and Navajo Nation borders.',
    distanceMiles: 580,
    origin: { name: 'Barstow, CA', coordinates: [-117.0264, 34.8958] },
    destination: { name: 'Albuquerque, NM', coordinates: [-106.5684, 35.1018] },
    waypoints: [
      [-117.0264, 34.8958],
      [-115.6500, 34.8000],
      [-114.6144, 34.8481],
      [-114.0537, 35.1894],
      [-112.8763, 35.3267],
      [-112.1800, 35.2500],
      [-111.6513, 35.1983],
      [-110.7800, 35.0200],
      [-110.1585, 34.9022],
      [-108.7426, 35.5281],
      [-107.8500, 35.1500],
      [-106.5684, 35.1018]
    ]
  },
  {
    id: 'i5-la-sf',
    name: 'I-5: Los Angeles ➔ San Francisco',
    interstate: 'I-5',
    description: 'The backbone of California transit over the steep Tejon Pass (Grapevine) and through the vast Central Valley agricultural corridor.',
    distanceMiles: 382,
    origin: { name: 'Los Angeles, CA', coordinates: [-118.2437, 34.0522] },
    destination: { name: 'San Francisco, CA', coordinates: [-122.3999, 37.7915] },
    waypoints: [
      [-118.2437, 34.0522],
      [-118.5700, 34.4200],
      [-118.8943, 34.9872],
      [-119.0605, 35.3733],
      [-119.6000, 35.7500],
      [-119.9575, 35.9867],
      [-120.5500, 36.6500],
      [-121.0500, 37.4000],
      [-121.3000, 37.7500],
      [-122.0300, 37.6800],
      [-122.3999, 37.7915]
    ]
  },
  {
    id: 'nv95-loneliest-desert',
    name: 'US-95: Las Vegas ➔ Reno (Great Basin Desert)',
    interstate: 'US-95',
    description: 'One of the most extreme charging deserts in North America across Nevada Great Basin. Over 200 miles with sparse infrastructure.',
    distanceMiles: 440,
    origin: { name: 'Las Vegas, NV', coordinates: [-115.1728, 36.0694] },
    destination: { name: 'Reno, NV', coordinates: [-119.8138, 39.5296] },
    waypoints: [
      [-115.1728, 36.0694],
      [-116.7570, 36.9091],
      [-117.2307, 38.0692],
      [-118.0800, 38.5200],
      [-118.7500, 38.9800],
      [-119.1600, 39.1500],
      [-119.8138, 39.5296]
    ]
  }
];
