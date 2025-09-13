const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/fare-distance", async (req, res) => {
  const { pickup, destination } = req.query;
  try {
    // For now, expect pickup and destination as "lat,lng"
    const [pickupLat, pickupLng] = pickup.split(",");
    const [destLat, destLng] = destination.split(",");

    const url = `http://router.project-osrm.org/route/v1/driving/${pickupLng},${pickupLat};${destLng},${destLat}?overview=false`;
    const response = await axios.get(url);
    const route = response.data.routes[0];

    const distanceKm = route.distance / 1000;
    const durationMin = route.duration / 60;
    const fare = 50 + distanceKm * 10;

    res.json({ distanceKm, durationMin, fare });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to calculate fare" });
  }
});

module.exports = router;
