import { useState, useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";

const BookRideForm = ({ setRoute, setShowRidePopup }) => {
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(false);
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);

  useEffect(() => {
    if (pickup.length > 2) {
      axios
        .get(`https://nominatim.openstreetmap.org/search?format=json&q=${pickup}`)
        .then((response) => setPickupSuggestions(response.data));
    } else {
      setPickupSuggestions([]);
    }
  }, [pickup]);

  useEffect(() => {
    if (destination.length > 2) {
      axios
        .get(`https://nominatim.openstreetmap.org/search?format=json&q=${destination}`)
        .then((response) => setDestinationSuggestions(response.data));
    } else {
      setDestinationSuggestions([]);
    }
  }, [destination]);

  const handleBookRide = async (e) => {
    e.preventDefault();
    if (!pickup || !destination) {
      alert("Please enter both pickup and destination!");
      return;
    }

    try {
      setLoading(true);

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

      const osrmRes = await axios.get(
        `http://router.project-osrm.org/route/v1/driving/${pickupCoords[1]},${pickupCoords[0]};${destCoords[1]},${destCoords[0]}?overview=full&geometries=geojson`
      );

      const route = osrmRes.data.routes[0];
      setRoute({
        pickup: { lat: parseFloat(pickupCoords[0]), lng: parseFloat(pickupCoords[1]) },
        destination: { lat: parseFloat(destCoords[0]), lng: parseFloat(destCoords[1]) },
        coordinates: route.geometry.coordinates,
        distance_km: (route.distance / 1000).toFixed(2),
        duration_min: (route.duration / 60).toFixed(1),
      });

      setShowRidePopup(true);
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

      <div className="relative">
        <input
          type="text"
          placeholder="Enter pickup location"
          value={pickup}
          onChange={(e) => setPickup(e.target.value)}
          className="w-full p-2 mb-2 border rounded-lg"
        />
        {pickupSuggestions.length > 0 && (
          <ul className="absolute bg-white border rounded-lg w-full mt-1">
            {pickupSuggestions.map((suggestion) => (
              <li
                key={suggestion.place_id}
                onClick={() => {
                  setPickup(suggestion.display_name);
                  setPickupSuggestions([]);
                }}
                className="p-2 cursor-pointer hover:bg-gray-200"
              >
                {suggestion.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Enter destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="w-full p-2 mb-3 border rounded-lg"
        />
        {destinationSuggestions.length > 0 && (
          <ul className="absolute bg-white border rounded-lg w-full mt-1">
            {destinationSuggestions.map((suggestion) => (
              <li
                key={suggestion.place_id}
                onClick={() => {
                  setDestination(suggestion.display_name);
                  setDestinationSuggestions([]);
                }}
                className="p-2 cursor-pointer hover:bg-gray-200"
              >
                {suggestion.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>

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
  setShowRidePopup: PropTypes.func.isRequired,
};

export default BookRideForm;