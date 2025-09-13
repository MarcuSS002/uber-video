// src/components/LiveTracking.jsx
import { GoogleMap, LoadScript } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "500px", // give map height
};

const center = {
  lat: 28.6139, // Delhi
  lng: 77.2090,
};

function LiveTracking() {
  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={12}
      >
        {/* You can add markers, directions, etc. here */}
      </GoogleMap>
    </LoadScript>
  );
}

export default LiveTracking;
