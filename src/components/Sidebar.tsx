import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Sidebar = ({ sendLocation , updateLocation, results,path,time}) => {
    const [searchInput, setSearchInput] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [selectedLocations, setSelectedLocations] = useState([]);

    const addLocation = (newLocation: never) => {
        setSelectedLocations((prevLocations) => {
          // Check if the newLocation ID already exists in the current array
          if (prevLocations.some(location => location.id === newLocation.id)) 
          {
            return prevLocations; // Return the existing array if ID is already present
          }
          return [...prevLocations, newLocation]; // Add newLocation if ID is unique
        });
      };

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
            // Clear suggestions when search input is empty twice
            setSuggestions([]);

            
        }
    }, [searchInput]);
    
    useEffect(() => {
        // Call handlelocationData whenever selectLocData changes
        if (path) {
            setSelectedLocations(path);
        }
    }, [path]); 
    
    const handleInputChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
        setSearchInput(event.target.value);
    };

    const handleSuggestionClick = (suggestion: never) => {
        if (suggestion.geometry && suggestion.properties && suggestion.properties.name) {
            //setSelectedLocations([...selectedLocations, suggestion]);
            addLocation(suggestion);
            sendLocation(suggestion);
            setSearchInput('');
            setSuggestions([]);
        } else {
            console.error('Error: Unexpected response data');
        }
    };

    const handleKeyDown = (event: { key: string; }) => {
        if (event.key === 'Enter') {
            handleSuggestionClick(suggestions[0]);
        }
    };

    const handleRemoveLocation = (locationToRemove: never) => {
        setSelectedLocations(prevLocations => prevLocations.filter(location => location !== locationToRemove));
        // Remove the location from the path
        
        updateLocation(locationToRemove);
    };

    return (
        <div className='absolute top-5 left-5 rounded-xl z-10 min-w-[360px] flex flex-col'>
        <div className="absolute top-5 left-5 rounded-xl z-10 min-w-[360px] bg-gray-300 shadow-sm flex flex-col">
            <input
                type="text"
                className="rounded-t-xl pt-2 pl-12 border bg-gray-300 focus:bg-gray-300 focus:outline-none border-transparent"
                placeholder="search..."
                value={searchInput}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
            />
            <svg className="pl-4 w-10 h-8 absolute left-0 top-1.5 right-1.5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l5 5M10 14a4 4 0 100-8 4 4 0 000 8z" />
</svg>


            <div className='bg-gray-300 border-t-0 rounded-b-3xl h-3'></div>

{/* Suggested code may be subject to a license. Learn more: ~LicenseLog:279112217. */}

            <div className='bg-white mt-0 rounded-xl m-2 flex flex-row justify-between'>
                <div className='bg-gray-200 rounded-xl p-2 m-2 ml-2 flex-1 mx-1'>
                    <p className="text-left p-1 text-sm text-gray-900 font-medium">Distance</p>
                    <p className="text-left pb-2 pl-1 text-sm text-gray-500">{results.distance ? results.distance.toFixed(2) : '0'} km</p>
                </div>
                <div className='bg-gray-200 rounded-xl p-2 m-2 mr-2 flex-1 mx-1'>
                    <p className="text-left p-1 text-sm text-gray-900 font-medium">Duration</p>
                    <p className="text-left pb-2 pl-1 text-sm text-gray-500">
                    {time >= 3600 
                        ? `${Math.floor(time / 3600)} hr ${Math.floor((time % 3600) / 60)} min`
                        : `${Math.floor(time / 60)} min`}
                    </p>


                </div>
            </div>

                
                  


            
            {suggestions.length > 0 && searchInput && (
                <>
                <ul className=" space-y-0.5 bg-white border border-gray-300 rounded-2xl pr-2 pb-2">
                    {suggestions.map((suggestion) => (
                        <li key={suggestion.id} className="mt-2 mb-2 pl-0 ml-2 py-1 border-b-0 relative cursor-pointer hover:bg-gray-200 hover:text-gray-900 hover:rounded-xl" onClick={() => handleSuggestionClick(suggestion)}>
                            <p className="text-left pl-2 pt-2 pb-1 text-md text-gray-900 font-medium">{suggestion.properties.name}</p>
                            <p className="text-left pl-2 pb-2 text-sm text-gray-500">{suggestion.properties.place_formatted}</p>
                        </li>
                    ))}
                </ul>{selectedLocations.length > 0 &&(
                    <p className="text-left pl-4 pt-2 pb-1 text-sm text-gray-900 font-medium roundedt-t-xl">selected</p>
                )}
                </>
                
            )}

            

            {path.length > 0 && (
                
                <ul className="bg-white mt-0 rounded-xl">
                    {path.map((location) => (
                        <li key={location.id} className=" py-1 relative cursor-pointer hover:bg-gray-100 hover:text-gray-900 rounded-xl">
                            <p className="text-left pl-5 pt-2 pb-1 text-md text-gray-900 font-medium roundedt-t-xl">{location.properties.name}</p>
                            {/* Adjust this line according to your data structure */}
                            <p className="text-left pl-5 pb-2 text-md text-gray-500">{location.properties.place_formatted}</p>
                            <button onClick={() => handleRemoveLocation(location)} className="absolute top-0 right-0 mr-2 mt-2 w-6 h-6 flex justify-center items-center text-sm text-gray-500 hover:text-red-600 focus:outline-none border-0 bg-gray-200 rounded-md pt-0 pb-1 pr-2 pl-2">
                            <svg className="w-4 h-4 absolute top-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
  
        
        
        
        </div>
            
    
    );
};

export default Sidebar;
