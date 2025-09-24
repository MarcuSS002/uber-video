import { useState, useRef } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";
import BookRideForm from "../components/BookRideForm";
import RidePopUp from "../components/RidePopUp";
import WaitingForDriver from "../components/WaitingForDriver";
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const Home = () => {
  const [route, setRoute] = useState(null);
  const [showRidePopup, setShowRidePopup] = useState(false);
  const [showWaiting, setShowWaiting] = useState(false);

  const ridePopupRef = useRef(null);

  useGSAP(() => {
    gsap.to(ridePopupRef.current, {
      transform: showRidePopup ? 'translateY(0)' : 'translateY(100%)',
      duration: 0.3
    });
  }, [showRidePopup]);

  return (
    <div className="w-full h-screen relative">
      <BookRideForm
        setRoute={setRoute}
        setShowRidePopup={setShowRidePopup}
      />

      <MapContainer
        center={[28.6139, 77.209]}
        zoom={13}
        style={{ height: showRidePopup ? "70%" : "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />

        {route && route.coordinates && (
          <>
            <Marker
              position={[route.pickup.lat, route.pickup.lng]}
              key="pickup"
            >
              <Popup>Pickup</Popup>
            </Marker>
            <Marker
              position={[route.destination.lat, route.destination.lng]}
              key="destination"
            >
              <Popup>Destination</Popup>
            </Marker>
            <Polyline
              positions={route.coordinates.map(([lng, lat]) => [lat, lng])}
              color="blue"
            />
          </>
        )}
      </MapContainer>

      {route && !showRidePopup && (
        <div className="absolute bottom-4 left-4 bg-white p-3 rounded-xl shadow-md z-[1000]">
          <p>Distance: {route.distance_km} km</p>
          <p>ETA: {route.duration_min} min</p>
        </div>
      )}

      {showWaiting && <WaitingForDriver />}

      <div
        ref={ridePopupRef}
        className="fixed w-full z-20 bottom-0 translate-y-full bg-white px-3 py-10 pt-12"
      >
        {showRidePopup && route && (
          <RidePopUp
            ride={route}
            setRidePopupPanel={setShowRidePopup}
          />
        )}
      </div>
    </div>
  );
};

export default Home;