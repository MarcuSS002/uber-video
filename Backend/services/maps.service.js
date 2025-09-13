
const axios = require('axios');
const captainModel = require("../models/captain.model");

function flipCoords(coordStr) {
    const [a, b] = coordStr.split(',').map(s => s.trim());
    return `${b},${a}`;
}

async function osrmRequest(origin, destination) {
    const url = `https://router.project-osrm.org/route/v1/driving/${origin};${destination}?overview=false`;
    return axios.get(url);
}

/**
 * Get distance (km) and time (min) between two points using OSRM Directions
 * origin and destination expected as "lng,lat" or "lat,lng" (we try both)
 */
async function getDistanceTime(origin, destination) {
    const oRaw = origin.replace(/\s+/g, '');
    const dRaw = destination.replace(/\s+/g, '');

    try {
        console.log('OSRM try with:', oRaw, dRaw);
        // First try with given order
        let res = await osrmRequest(oRaw, dRaw);

        // If no route, try flipping each coord pair (handles lat,lng input)
        if (!res.data || !res.data.routes || res.data.routes.length === 0) {
            console.log('No route found with given order — trying flipped coords');
            const oFlip = flipCoords(oRaw);
            const dFlip = flipCoords(dRaw);
            res = await osrmRequest(oFlip, dFlip);
        }

        if (!res.data || !res.data.routes || res.data.routes.length === 0) {
            throw new Error('No route found');
        }

        const route = res.data.routes[0];
        return {
            distance_km: (route.distance / 1000).toFixed(2),
            duration_min: Math.round(route.duration / 60)
        };
    } catch (err) {
        console.error('OSRM error:', err.response?.data || err.message);
        throw new Error('Failed to fetch distance/time: ' + (err.response?.data?.message || err.message));
    }
}

module.exports = {
    // ... other exports if any
        /**
         * Geocode an address using Nominatim (OpenStreetMap)
         * Returns { lat, lng } or throws if not found
         */
        getAddressCoordinate: async (address) => {
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
            try {
                const response = await axios.get(url, { headers: { 'User-Agent': 'uber-clone-app' } });
                if (response.data && response.data.length > 0) {
                    const place = response.data[0];
                    return { lat: parseFloat(place.lat), lng: parseFloat(place.lon) };
                } else {
                    throw new Error('No results found for the given address');
                }
            } catch (error) {
                console.error('getAddressCoordinate error:', error.message || error);
                throw new Error('Failed to fetch coordinates: ' + (error.message || error));
            }
        },

        /**
         * Get distance (km) and time (min) between two points using OSRM Directions
         * Accepts either coordinates ("lng,lat") or place names (address strings)
         */
        getDistanceTime: async (origin, destination) => {
            // Helper to check if string is in "lng,lat" format
            function isCoord(str) {
                return /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(str.trim());
            }

            let oCoord = origin;
            let dCoord = destination;

            // Geocode if not coordinates
            if (!isCoord(origin)) {
                const o = await module.exports.getAddressCoordinate(origin);
                oCoord = `${o.lng},${o.lat}`;
            }
            if (!isCoord(destination)) {
                const d = await module.exports.getAddressCoordinate(destination);
                dCoord = `${d.lng},${d.lat}`;
            }

            // Now use OSRM
            const oRaw = oCoord.replace(/\s+/g, '');
            const dRaw = dCoord.replace(/\s+/g, '');

            try {
                console.log('OSRM try with:', oRaw, dRaw);
                let res = await osrmRequest(oRaw, dRaw);
                if (!res.data || !res.data.routes || res.data.routes.length === 0) {
                    console.log('No route found with given order — trying flipped coords');
                    const oFlip = flipCoords(oRaw);
                    const dFlip = flipCoords(dRaw);
                    res = await osrmRequest(oFlip, dFlip);
                }
                if (!res.data || !res.data.routes || res.data.routes.length === 0) {
                    throw new Error('No route found');
                }
                const route = res.data.routes[0];
                return {
                    distance_km: (route.distance / 1000).toFixed(2),
                    duration_min: Math.round(route.duration / 60)
                };
            } catch (err) {
                console.error('OSRM error:', err.response?.data || err.message);
                throw new Error('Failed to fetch distance/time: ' + (err.response?.data?.message || err.message));
            }
        },

        getCaptainsInTheRadius: async (lat, lng, radius) => {
            const captains = await captainModel.find({
                location: {
                    $geoWithin: {
                        $centerSphere: [[lng, lat], radius / 6371], // earth radius in km
                    },
                },
            });
            return captains;
        }
};
