import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse } from 'axios';

interface Location {
  id: string;
  geometry: any;
  properties: {
    name: string;
  };
}

interface SidebarProps {
  sendLocation: (location: Location) => void;
  updateLocation: (location: Location) => void;
  selectLocData: Location[];
  path?: Location[];
  time?: string;
  results?: any;
}

const Sidebar: React.FC<SidebarProps> = ({ sendLocation, updateLocation, selectLocData, path, time, results }) => {
  const [searchInput, setSearchInput] = useState<string>('');
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<Location[]>([]);

  const addLocation = (newLocation: Location) => {
    setSelectedLocations((prevLocations) => {
      if (prevLocations.some((location) => location.id === newLocation.id)) {
        return prevLocations;
      }
      return [...prevLocations, newLocation];
    });
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response: AxiosResponse<any> = await axios.get(
          `https://api.mapbox.com/search/geocode/v6/forward?q=${searchInput}&access_token=pk.eyJ1IjoibWFzaGJ1cm4iLCJhIjoiY2x3MnVlcWZmMGtpeTJxbzA5ZXNmb3V0MCJ9.E-W6jVgrBjtiZL-mUJhUAw`
        );
        setSuggestions(response.data.features);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    };

    if (searchInput) {
      fetchSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [searchInput]);

  useEffect(() => {
    if (path) {
      setSelectedLocations(path);
    }
  }, [path]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
  };

  const handleSuggestionClick = (suggestion: Location) => {
    if (suggestion.geometry && suggestion.properties && suggestion.properties.name) {
      addLocation(suggestion);
      sendLocation(suggestion);
      setSearchInput('');
      setSuggestions([]);
    } else {
      console.error('Error: Unexpected response data');
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      if (suggestions.length > 0) {
        handleSuggestionClick(suggestions[0]);
      }
    }
  };

  const handleRemoveLocation = (locationToRemove: Location) => {
    setSelectedLocations((prevLocations) => prevLocations.filter((location) => location.id !== locationToRemove.id));
  };

  return (
    <div>
      <input
        type="text"
        value={searchInput}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Search for a location"
      />
      <ul>
        {suggestions.map((suggestion) => (
          <li key={suggestion.id} onClick={() => handleSuggestionClick(suggestion)}>
            {suggestion.properties.name}
          </li>
        ))}
      </ul>
      <ul>
        {selectedLocations.map((location) => (
          <li key={location.id}>
            {location.properties.name}
            <button onClick={() => handleRemoveLocation(location)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
