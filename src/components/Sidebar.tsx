import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Sidebar = ({ sendLocation , updateLocation }) => {
    const [searchInput, setSearchInput] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [selectedLocations, setSelectedLocations] = useState([]);

    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                const response = await axios.get(`https://api.mapbox.com/search/geocode/v6/forward?q=${searchInput}&access_token=pk.eyJ1IjoibWFzaGJ1cm4iLCJhIjoiY2x3MnVlcWZmMGtpeTJxbzA5ZXNmb3V0MCJ9.E-W6jVgrBjtiZL-mUJhUAw`);
                setSuggestions(response.data.features);
            } catch (error) {
                console.error('Error fetching suggestions:', error);
            }
        };

        // Fetch suggestions only if there is a search input
        if (searchInput) {
            fetchSuggestions();
        } else {
            // Clear suggestions when search input is empty
            setSuggestions([]);
        }
    }, [searchInput]);

    const handleInputChange = (event) => {
        setSearchInput(event.target.value);
    };

    const handleSuggestionClick = (suggestion) => {
        if (suggestion.geometry && suggestion.properties && suggestion.properties.name) {
            const locationDetails = {
                name: suggestion.properties.name,
                coordinates: suggestion.geometry.coordinates
            };
            setSelectedLocations([...selectedLocations, suggestion]);
            sendLocation(locationDetails);
            setSearchInput('');
            setSuggestions([]);
        } else {
            console.error('Error: Unexpected response data');
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleSuggestionClick(suggestions[0]);
        }
    };

    const handleRemoveLocation = (indexToRemove) => {
        setSelectedLocations(prevLocations => prevLocations.filter((location, index) => index !== indexToRemove));
    };

    return (
        <div className="absolute">
            <input
                type="text"
                className="p-2 pl-8 rounded-3xl border border-gray-200 bg-gray-200 focus:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent "
                placeholder="search..."
                value={searchInput}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
            />
            <svg className="w-4 h-4 absolute left-2.5 top-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path />
            </svg>

            

            {suggestions.length > 0 && searchInput && (
                <ul className="bg-white border border-gray-100 w-full mt-2 rounded-2xl">
                    {suggestions.map((suggestion, index) => (
                        <li key={index} className="mt-2 mb-2 py-1 border-b-0 relative cursor-pointer hover:bg-gray-50 hover:text-gray-900 hover:rounded-xl" onClick={() => handleSuggestionClick(suggestion)}>
                            <p className="text-left pl-4 pt-2 pb-1 text-sm text-gray-900 font-medium">{suggestion.properties.name}</p>
                            <p className="text-left pl-4 pb-2 text-sm text-gray-500">{suggestion.properties.place_formatted}</p>
                        </li>
                    ))}
                </ul>
            )}
            {selectedLocations.length > 0 && (
                <ul className="bg-white border border-gray-100 w-full mt-2 rounded-2xl">
                    {selectedLocations.map((location, index) => (
                        <li key={index} className="mt-2 mb-2 py-1 border-b-0 relative cursor-pointer hover:bg-gray-50 hover:text-gray-900 hover:rounded-xl">
                            <p className="text-left pl-4 pt-2 pb-1 text-sm text-gray-900 font-medium">{location.properties.name}</p>
                            {/* Adjust this line according to your data structure */}
                            <p className="text-left pl-4 pb-2 text-sm text-gray-500">{location.properties.place_formatted}</p>
                            <button onClick={() => handleRemoveLocation(index)} className="absolute top-0 right-0 mr-4 mt-2 text-gray-500 hover:text-red-600 focus:outline-none">
                                x
                            </button>
                        </li>
                    ))}
                </ul>
            )}

        </div>
    );
};

export default Sidebar;
