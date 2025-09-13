const express = require("express");
const axios = require("axios");
const router = express.Router();

// GET /maps/geocode?address=New+Delhi
router.get("/geocode", async (req, res) => {
  try {
    const { address } = req.query;
    if (!address) {
      return res.status(400).json({ error: "Address is required" });
    }

    const response = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: {
        q: address,
        format: "json",
        limit: 1,
      },
    });

    if (response.data.length === 0) {
      return res.status(404).json({ error: "Address not found" });
    }

    const { lat, lon } = response.data[0];
    res.json({ lat: parseFloat(lat), lng: parseFloat(lon) });
  } catch (err) {
    console.error("Geocode error:", err.message);
    res.status(500).json({ error: "Geocoding failed" });
  }
});

module.exports = router;
