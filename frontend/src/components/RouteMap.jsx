import React from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";
import PropTypes from "prop-types";

const Routing = ({ pickup, drop }) => {
  const map = useMap();

  React.useEffect(() => {
    if (!map) return;

    // Remove old routing controls if they exist
    if (map._controlContainer) {
      map.eachLayer((layer) => {
        // Only remove routing controls
        if (layer instanceof L.Routing.Control) {
          map.removeControl(layer);
        }
      });
    }

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(pickup[0], pickup[1]),
        L.latLng(drop[0], drop[1]),
      ],
      lineOptions: {
        styles: [{ color: "black", weight: 5 }],
      },
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      show: false,
    }).addTo(map);

    return () => map.removeControl(routingControl);
  }, [map, pickup, drop]);

  return null;
};

const RouteMap = ({ pickup, drop }) => {
  return (
  <MapContainer center={pickup} zoom={13} style={{ height: "65%", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <Routing pickup={pickup} drop={drop} />
    </MapContainer>
  );
};
Routing.propTypes = {
  pickup: PropTypes.arrayOf(PropTypes.number).isRequired,
  drop: PropTypes.arrayOf(PropTypes.number).isRequired,
};

RouteMap.propTypes = {
  pickup: PropTypes.arrayOf(PropTypes.number).isRequired,
  drop: PropTypes.arrayOf(PropTypes.number).isRequired,
};

export default RouteMap;
