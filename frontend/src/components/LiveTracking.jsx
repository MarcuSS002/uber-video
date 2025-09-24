// src/components/LiveTracking.jsx
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import PropTypes from "prop-types";

function LiveTracking({ pickup, destination, captainLocation }) {
  const [routeCoords, setRouteCoords] = useState([]);

  useEffect(() => {
    if (!pickup || !destination) {
      setRouteCoords([]);
      return;
    }

    const fetchRoute = async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${destination.lng},${destination.lat}?geometries=geojson`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.routes && data.routes[0] && data.routes[0].geometry && data.routes[0].geometry.coordinates) {
         
          const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
          setRouteCoords(coords);
        } else {
          setRouteCoords([]);
        }
      } catch (err) {
        setRouteCoords([]);
        console.error("Error fetching OSRM route:", err);
      }
    };

    fetchRoute();
  }, [pickup, destination]);

  return (
    <MapContainer
      center={pickup ? [pickup.lat, pickup.lng] : [28.6139, 77.209]} // fallback Delhi
      zoom={13}
      style={{ height: "65%", width: "100%" }}
    >
      {/* Base map */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {/* Pickup marker */}
      {pickup && <Marker position={[pickup.lat, pickup.lng]} />}

      {/* Destination marker */}
      {destination && <Marker position={[destination.lat, destination.lng]} />}

      {/* Captain live marker */}
      {captainLocation && (
        <Marker position={[captainLocation.lat, captainLocation.lng]} />
      )}

      {/* Route polyline */}
      {Array.isArray(routeCoords) && routeCoords.length > 1 && (
        <Polyline positions={routeCoords} color="blue" key={routeCoords.map(c => c.join(",")).join("-")} />
      )}
    </MapContainer>
  );
}

LiveTracking.propTypes = {
  pickup: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }),
  destination: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }),
  captainLocation: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }),
};

export default LiveTracking;
