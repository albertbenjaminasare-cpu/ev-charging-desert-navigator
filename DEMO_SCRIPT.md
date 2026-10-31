# 2-Minute Demo Video Script for Hackathon Submission

**Challenge:** AWS Builder Center Weekend Challenge: Map it  
**Project:** EV Pulse – EV Corridor & Charging Desert Navigator  
**Creator:** Albert Benjamin Asare  
**Target Video Duration:** 2 minutes to 2 minutes 30 seconds

---

### Segment 1: The Hook & Problem (0:00 - 0:30)
* **Screen:** Open with full-screen view of the map centered on the California / Nevada desert.
* **Voiceover:**
  > "Hi everyone, I'm Albert Benjamin Asare, and this is **EV Pulse**—built for the AWS Builder Center 'Map it' challenge.
  > Electric vehicle adoption is at an all-time high, but anyone who has ever taken an EV on a road trip through remote highway passes knows the fear of **Charging Deserts**—remote stretches where chargers are too far apart to reach safely.
  > Using open data from the US Department of Energy on AWS and Amazon Location Service, EV Pulse turns raw coordinates into an interactive intelligence map that pinpoints dead zones and lets anyone simulate closing them."

---

### Segment 2: Exploring the Map & Buffers (0:30 - 1:00)
* **Screen:** Toggle the "Coverage Footprint Buffers" switch and move the radius slider between 15 miles and 45 miles.
* **Voiceover:**
  > "Here, every operational charger is plotted with its power rating and connector standard.
  > By enabling our reachability buffers, we generate dynamic coverage footprints. Any unshaded highway segment is an active charging desert.
  > We can filter by DC Fast chargers—the 350-kilowatt ultra-fast plugs required for highway travel—or by plug standards like NACS and CCS."

---

### Segment 3: Corridor Gap Diagnostic (1:00 - 1:40)
* **Screen:** Click on the "Corridors" tab. Select "I-15: Los Angeles to Las Vegas", then select "US-95: Great Basin Desert". Click "Zoom to Gap".
* **Voiceover:**
  > "Now watch what happens when we analyze an interstate corridor.
  > On Interstate 15 between Los Angeles and Las Vegas, our diagnostic scans points along the highway against Amazon Location Route geometries.
  > If a vehicle is more than 38 miles away from any fast charger, the app flags it with a pulsing red alert line.
  > Look at US-95 through the Nevada Great Basin: a massive 68-mile dead zone between Beatty and Tonopah where drivers risk getting stranded."

---

### Segment 4: The Simulator Tool & AWS Architecture (1:40 - 2:20)
* **Screen:** Click "+ Place Charger", click right in the middle of the red gap on US-95. Watch the green simulated station appear and the red gap clear!
* **Voiceover:**
  > "Now for the best part: the **Station Simulator**.
  > If I am a city planner, energy company, or EV advocate, I can click '+ Place Charger' and drop a simulated 350kW hub right in the heart of this desert gap.
  > Instantly, the coverage buffer recalculates, and the corridor dead zone is eliminated!
  > Under the hood, this is powered by Amazon Location Service Maps and Routes, with static assets and GeoJSON cached on Amazon S3."

---

### Segment 5: Conclusion (2:20 - 2:30)
* **Screen:** Show the GitHub README and live application.
* **Voiceover:**
  > "Data is easiest to understand when you can see it on a map—and even more powerful when you can use it to solve real-world problems.
  > Thank you to AWS Builder Center for this challenge!"
