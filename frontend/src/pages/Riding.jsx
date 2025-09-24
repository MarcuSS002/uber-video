import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { SocketContext } from "../context/SocketContext";
import LiveTracking from "../components/LiveTracking";

const Riding = () => {
  const location = useLocation();
  const { ride } = location.state || {}; // ✅ ride object from navigation
  const { socket } = useContext(SocketContext);
  const navigate = useNavigate();

  const [captainLocation, setCaptainLocation] = useState(null);

  useEffect(() => {
    if (!ride || !socket) return;

    // ✅ Join ride room
    socket.emit("joinRide", ride._id);

    // ✅ Listen for captain live updates
    socket.on("locationUpdate", ({ lat, lng }) => {
      setCaptainLocation({ lat, lng });
    });

    // ✅ Ride ended
    socket.on("rideEnded", () => {
      navigate("/home");
    });

    return () => {
      socket.off("locationUpdate");
      socket.off("rideEnded");
    };
  }, [ride, socket, navigate]);

  return (
    <div className="h-screen flex flex-col">
      {/* Home button */}
      <Link
        to="/home"
        className="fixed right-2 top-2 h-10 w-10 bg-white flex items-center justify-center rounded-full z-10"
      >
        <i className="text-lg font-medium ri-home-5-line"></i>
      </Link>

      {/* Map Section */}
      <div className="h-[70vh]">
        <LiveTracking
          pickup={ride?.pickupCoordinates} // { lat, lng }
          destination={ride?.destinationCoordinates} // { lat, lng }
          captainLocation={captainLocation} // live updates from socket
        />
      </div>

      {/* Ride Info Section */}
      <div className="h-[30vh] p-4 bg-gray-100">
        <div className="flex items-center justify-between">
          <img
            className="h-12"
            src="https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg"
            alt="car"
          />
          <div className="text-right">
            <h2 className="text-lg font-medium capitalize">
              {ride?.captain.fullname.firstname}
            </h2>
            <h4 className="text-xl font-semibold -mt-1 -mb-1">
              {ride?.captain.vehicle.plate}
            </h4>
            <p className="text-sm text-gray-600">
              {ride?.captain.vehicle.vehicleType}
            </p>
          </div>
        </div>

        <div className="flex gap-2 justify-between flex-col items-center">
          <div className="w-full mt-5">
            <div className="flex items-center gap-5 p-3 border-b-2">
              <i className="text-lg ri-map-pin-2-fill"></i>
              <div>
                <h3 className="text-lg font-medium">{ride?.pickup}</h3>
                <p className="text-sm -mt-1 text-gray-600">
                  {ride?.destination}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-5 p-3">
              <i className="ri-currency-line"></i>
              <div>
                <h3 className="text-lg font-medium">₹{ride?.fare}</h3>
                <p className="text-sm -mt-1 text-gray-600">Cash Payment</p>
              </div>
            </div>
          </div>
        </div>

        <button className="w-full mt-5 bg-green-600 text-white font-semibold p-2 rounded-lg">
          Make a Payment
        </button>
      </div>
    </div>
  );
};

export default Riding;