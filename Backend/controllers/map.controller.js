const axios = require("axios");
const mapsService = require("../services/maps.service");

// ---------- Utility Functions ----------

// Get coordinates from address using Nominatim
async function getAddressCoordinate(address) {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
    );
    if (response.data.length === 0) throw new Error("Coordinates not found");

    const loc = response.data[0];
    return { lat: loc.lat, lng: loc.lon };
  } catch {
    throw new Error("Failed to fetch coordinates");
  }
}

// Get autocomplete suggestions using Nominatim
async function getAutoCompleteSuggestions(input) {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input)}`
    );
    return response.data.map((p) => ({
      display_name: p.display_name,
      lat: p.lat,
      lng: p.lon,
    }));
  } catch {
    throw new Error("Failed to fetch suggestions");
  }
}

// ---------- Route Handlers ----------

module.exports.getCoordinates = async (req, res) => {
  try {
    const { address } = req.query;
    if (!address) return res.status(400).json({ message: "Address is required" });

    const coords = await getAddressCoordinate(address);
    res.status(200).json(coords);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports.getDistanceTime = async (req, res) => {
  try {
    const { origin, destination } = req.query; // "lng,lat"
    if (!origin || !destination) {
      return res.status(400).json({ message: 'origin and destination query params required (format: "lng,lat" or "lat,lng")' });
    }

    // Pass origin and destination as strings to OSRM-based service
    const result = await mapsService.getDistanceTime(origin, destination);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports.getAutoCompleteSuggestions = async (req, res) => {
  try {
    const { input } = req.query;
    if (!input) return res.status(400).json({ message: "Input is required" });

    const suggestions = await getAutoCompleteSuggestions(input);
    res.status(200).json(suggestions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
