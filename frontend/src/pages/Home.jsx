import { useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";
import BookRideForm from "../components/BookRideForm";

const Home = () => {
  const [route, setRoute] = useState(null);

  return (
    <div className="w-full h-screen relative">
      {/* Booking Form */}
      <BookRideForm setRoute={setRoute} />

      {/* Map */}
      <MapContainer
        center={[28.6139, 77.209]} // default Delhi
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />

        {route && (
          <>
            <Marker position={route.pickup}>
              <Popup>Pickup</Popup>
            </Marker>
            <Marker position={route.destination}>
              <Popup>Destination</Popup>
            </Marker>
            <Polyline positions={route.geometry.coordinates.map(([lng, lat]) => [lat, lng])} color="blue" />
          </>
        )}
      </MapContainer>

      {route && (
        <div className="absolute bottom-4 left-4 bg-white p-3 rounded-xl shadow-md">
          <p>Distance: {route.distance} km</p>
          <p>ETA: {route.duration} min</p>
        </div>
      )}
    </div>
  );
};

export default Home;
