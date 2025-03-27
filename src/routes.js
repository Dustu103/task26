const express = require("express");
const db = require("./db");
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Add School with Validation
router.post("/addSchool", 
  body('name').trim().escape().notEmpty().withMessage('Name is required'),
  body('address').trim().escape().notEmpty().withMessage('Address is required'),
  body('latitude').isFloat().withMessage('Latitude must be a number').toFloat(),
  body('longitude').isFloat().withMessage('Longitude must be a number').toFloat(),
  async (req, res) => {
    const errors = validationResult(req);

    // If validation fails, return error response
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, address, latitude, longitude } = req.body;

    try {
      const [result] = await db.execute(
        "INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)",
        [name, address, latitude, longitude]
      );
      res.status(201).json({ message: "School added", id: result.insertId });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

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
  const R = 6371; // Earth radius in km
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
