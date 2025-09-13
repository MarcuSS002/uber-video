import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function TestMap() {
  return (
    <MapContainer center={[28.6139, 77.2090]} zoom={13} style={{ height: "100vh", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
    </MapContainer>
  );
}

export default TestMap;
