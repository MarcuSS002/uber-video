import { useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";

export default function LocationAutocomplete({ placeholder, onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const handleChange = async (e) => {
    const val = e.target.value;
    setQuery(val);

    if (val.length < 3) {
      setResults([]);
      return;
    }

    try {
      const res = await axios.get(
        "/api/geocode",
        {
          params: {
            q: val
          },
        }
      );
      if (Array.isArray(res.data)) {
        setResults(res.data);
      } else {
        setResults([]);
      }
    } catch (err) {
      setResults([]);
      console.error(err);
    }
  };

  const handleSelect = (place) => {
    setQuery(place.display_name);
    setResults([]);
    onSelect({
      name: place.display_name,
      lat: parseFloat(place.lat),
      lon: parseFloat(place.lon),
    });
  };

  return (
    <div className="relative">
      <input
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className="border p-2 w-full rounded"
      />
      {results.length > 0 && (
        <ul className="absolute bg-white border w-full max-h-40 overflow-y-auto z-10">
          {results.map((r) => (
            <li
              key={r.place_id}
              onClick={() => handleSelect(r)}
              className="p-2 hover:bg-gray-100 cursor-pointer"
            >
              {r.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
LocationAutocomplete.propTypes = {
  placeholder: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
};
