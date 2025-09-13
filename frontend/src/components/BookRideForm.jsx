import { useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";

const BookRideForm = ({ setRoute }) => {
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(false);

  const handleBookRide = async (e) => {
    e.preventDefault();
    if (!pickup || !destination) {
      alert("Please enter both pickup and destination!");
      return;
    }

    try {
      setLoading(true);

      // Convert pickup & destination text into lat/lng (using Nominatim free geocoding)
      const pickupRes = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${pickup}`
      );
      const destRes = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${destination}`
      );

      if (!pickupRes.data[0] || !destRes.data[0]) {
        alert("Could not find one of the locations. Try again.");
        setLoading(false);
        return;
      }

      const pickupCoords = [
        pickupRes.data[0].lat,
        pickupRes.data[0].lon,
      ];
      const destCoords = [
        destRes.data[0].lat,
        destRes.data[0].lon,
      ];

      // Call OSRM route API (server.js should handle this too, but directly hitting public OSRM here)
      const osrmRes = await axios.get(
        `http://router.project-osrm.org/route/v1/driving/${pickupCoords[1]},${pickupCoords[0]};${destCoords[1]},${destCoords[0]}?overview=full&geometries=geojson`
      );

      const route = osrmRes.data.routes[0];
      setRoute({
        pickup: pickupCoords,
        destination: destCoords,
        geometry: route.geometry,
        distance: (route.distance / 1000).toFixed(2), // km
        duration: (route.duration / 60).toFixed(1), // minutes
      });

      alert("Ride booked! Route displayed on map 🚗");
    } catch (err) {
      console.error(err);
      alert("Error booking ride. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleBookRide}
      className="absolute top-4 left-4 bg-white p-4 rounded-2xl shadow-lg w-72 z-[1000]"
    >
      <h2 className="text-lg font-semibold mb-3">Book a Ride</h2>

      <input
        type="text"
        placeholder="Enter pickup location"
        value={pickup}
        onChange={(e) => setPickup(e.target.value)}
        className="w-full p-2 mb-2 border rounded-lg"
      />

      <input
        type="text"
        placeholder="Enter destination"
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
        className="w-full p-2 mb-3 border rounded-lg"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? "Booking..." : "Book Ride"}
      </button>
    </form>
  );
};
BookRideForm.propTypes = {
  setRoute: PropTypes.func.isRequired,
};

export default BookRideForm;
