const express = require("express");
const db = require("./db");
const router = express.Router();

// Add School
router.get('/',(req,res)=>{
   res.send("running")
})
router.post("/addSchool", async (req, res) => {
  const { name, address, latitude, longitude } = req.body;
  if (!name || !address || !latitude || !longitude) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const [result] = await db.execute(
      "INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)",
      [name, address, latitude, longitude]
    );
    res.status(201).json({ message: "School added", id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List Schools by Proximity
router.get("/listSchools", async (req, res) => {
  const { latitude, longitude } = req.query;
  if (!latitude || !longitude) {
    return res.status(400).json({ error: "Latitude and Longitude required" });
  }

  try {
    const [schools] = await db.execute("SELECT * FROM schools");
    schools.sort((a, b) => {
      const distA = getDistance(latitude, longitude, a.latitude, a.longitude);
      const distB = getDistance(latitude, longitude, b.latitude, b.longitude);
      return distA - distB;
    });

    res.json(schools);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Haversine Formula for Distance Calculation
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

module.exports = router;
