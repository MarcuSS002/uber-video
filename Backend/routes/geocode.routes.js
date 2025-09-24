// Backend route: /api/geocode
const express = require('express');
const axios = require('axios');
const router = express.Router();

// GET /api/geocode?q=searchtext
router.get('/geocode', async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 3) {
    return res.status(400).json({ error: 'Query too short' });
  }
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q,
        format: 'json',
        addressdetails: 1,
        limit: 5,
      },
      headers: {
        'User-Agent': 'uber-clone-app/1.0 (contact@example.com)'
      }
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Geocoding failed', details: err.message });
  }
});

module.exports = router;
