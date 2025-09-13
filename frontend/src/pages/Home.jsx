import RouteMap from "../components/RouteMap";
import VehiclePanel from "../components/VehiclePanel";
import ConfirmRide from "../components/ConfirmRide";
import LookingForDriver from "../components/LookingForDriver";
import WaitingForDriver from "../components/WaitingForDriver";
import LiveTracking from "../components/LiveTracking";
import { useEffect, useRef, useState, useContext } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import axios from "axios";
import { SocketContext } from "../context/SocketContext";
import { UserDataContext } from "../context/UserDataContext";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [vehicleType, setVehicleType] = useState(null);
  const [pickupCoords, setPickupCoords] = useState([28.6139, 77.2090]);
  const [dropCoords, setDropCoords] = useState([28.5355, 77.3910]);
  const [showVehiclePanel, setVehiclePanel] = useState(false);
  const [showConfirmPanel, setConfirmRidePanel] = useState(false);
  const [showLookingPanel, setVehicleFound] = useState(false);
  const [showWaitingPanel, setWaitingForDriver] = useState(false);
  const [ride, setRide] = useState(null);
  const [fare, setFare] = useState({ car: 0, moto: 0, auto: 0, suv: 0 });
  const [distance, setDistance] = useState(0);

  const confirmRidePanelRef = useRef(null);

  const navigate = useNavigate();
  const { socket } = useContext(SocketContext);
  const { user } = useContext(UserDataContext) || {};

  useEffect(() => {
    if (socket && user?._id) {
      socket.emit("join", { userType: "user", userId: user._id });

      socket.on("ride-confirmed", () => {
        setVehicleFound(false);
        setWaitingForDriver(true);
      });

      socket.on("ride-started", (ride) => {
        setWaitingForDriver(false);
        navigate("/riding", { state: { ride } });
      });

      return () => {
        socket.off("ride-confirmed");
        socket.off("ride-started");
      };
    }
  }, [user, socket, navigate]);

  useGSAP(() => {
    if (confirmRidePanelRef.current) {
      gsap.to(confirmRidePanelRef.current, { transform: "translateY(100%)" });
    }
  }, []);
  // Optionally animate panels if needed

  // Geocode address to coordinates (Google Maps API or backend endpoint)
  const geocodeAddress = async (address, setter) => {
    try {
      const res = await axios.get(`http://localhost:5000/maps/geocode`, { params: { address } });
      if (res.data && res.data.lat && res.data.lng) {
        setter([res.data.lat, res.data.lng]);
      }
    } catch (err) {
      console.error("Geocoding failed", err);
    }
  };

  // Get fare and distance from backend
  const fetchFareAndDistance = async () => {
    try {
      const res = await axios.get("http://localhost:5000/rides/fare-distance", {
        params: { pickup, destination }
      });
      if (res.data) {
        setFare(res.data.fare);
        setDistance(res.data.distance);
      }
    } catch (err) {
      console.error("Failed to fetch fare/distance", err);
    }
  };

  const createRide = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/rides/create",
        { pickup, destination, vehicleType },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      setRide(res.data.ride);
      setVehiclePanel(false);
      setConfirmRidePanel(false);
      setVehicleFound(true);
    } catch (err) {
      console.error("Booking failed", err);
    }
  };

  return (
    <div style={{ position: "relative", height: "100vh" }}>
      <RouteMap pickup={pickupCoords} drop={dropCoords} />
      {/* Booking Panel */}
      {!vehicleType && !showVehiclePanel && (
        <div style={{
          position: "absolute",
          top: 20,
          left: 20,
          background: "rgba(255,255,255,0.95)",
          padding: 20,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          width: 320,
          zIndex: 1000
        }}>
          <h2 style={{ marginBottom: 10 }}>Book your Uber</h2>
          <input
            type="text"
            placeholder="Pickup location"
            value={pickup}
            onChange={e => setPickup(e.target.value)}
            onBlur={e => geocodeAddress(e.target.value, setPickupCoords)}
            style={{ width: "100%", marginBottom: 10, padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
          />
          <input
            type="text"
            placeholder="Destination"
            value={destination}
            onChange={e => setDestination(e.target.value)}
            onBlur={e => geocodeAddress(e.target.value, setDropCoords)}
            style={{ width: "100%", marginBottom: 10, padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
          />
          <button
            onClick={() => {
              fetchFareAndDistance();
              setVehiclePanel(true);
            }}
            style={{
              width: "100%",
              padding: "10px 0",
              background: "#111",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontWeight: "bold"
            }}
          >Book Ride</button>
        </div>
      )}
      {/* Vehicle Selection Panel */}
      {showVehiclePanel && (
        <VehiclePanel
          setVehiclePanel={setVehiclePanel}
          setConfirmRidePanel={setConfirmRidePanel}
          selectVehicle={setVehicleType}
          fare={fare}
          distance={distance}
        />
      )}
      {/* Confirm Ride Panel */}
      {showConfirmPanel && (
        <ConfirmRide
          setConfirmRidePanel={setConfirmRidePanel}
          setVehicleFound={setVehicleFound}
          pickup={pickup}
          destination={destination}
          vehicleType={vehicleType}
          fare={fare}
          createRide={createRide}
        />
      )}
      {/* Looking For Driver Panel */}
      {showLookingPanel && (
        <LookingForDriver
          setVehicleFound={setVehicleFound}
          pickup={pickup}
          destination={destination}
          vehicleType={vehicleType}
          fare={fare}
        />
      )}
      {/* Waiting For Driver Panel */}
      {showWaitingPanel && (
        <WaitingForDriver
          waitingForDriver={setWaitingForDriver}
          ride={ride}
        />
      )}
      {/* Live Tracking Panel (when ride started) */}
      {ride && (
        <LiveTracking />
      )}
    </div>
  );
};

export default Home;
