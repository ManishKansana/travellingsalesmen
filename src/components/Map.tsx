import { useRef, useEffect, useState, SetStateAction } from 'react';
import mapboxgl from 'mapbox-gl';
import '../../globals.css'
import Sidebar from './Sidebar';
import axios from 'axios';
import { tsp } from '../utils/tsp'


const Map = () => {

  mapboxgl.accessToken = 'pk.eyJ1IjoibWFzaGJ1cm4iLCJhIjoiY2x3MnVlcWZmMGtpeTJxbzA5ZXNmb3V0MCJ9.E-W6jVgrBjtiZL-mUJhUAw';

  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [lng, setLng] = useState<number>(-71.06);
  const [lat, setLat] = useState<number>(42.35);
  const [zoom, setZoom] = useState<number>(13);
  const [Locations, setLocations] = useState([]);
  const [Routes, setRoutes] = useState([])
  const markers = useRef({});
  const [Markers, setMarkers] = useState([])
  const [result, setResult] = useState([]);
  const [path, setPath] = useState([]);
  const [Duration, setDuration] = useState(0);

  const [distanceMatrix, setDistanceMatrix] = useState<number[][]>([]);
  

    useEffect(() => {
      if(distanceMatrix.length > 0){
        const tspresult = tsp(distanceMatrix);
        setResult(tspresult);
        console.log(result);
      }
    }, [distanceMatrix]);

    

  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1IjoibWFzaGJ1cm4iLCJhIjoiY2x3MnVlcWZmMGtpeTJxbzA5ZXNmb3V0MCJ9.E-W6jVgrBjtiZL-mUJhUAw';
  }, []);

  const addLocation = (newLocation) => {
    setLocations((prevLocations) => {
      // Check if the newLocation ID already exists in the current array
      if (prevLocations.some(location => location.id === newLocation.id)) 
      {
        return prevLocations; // Return the existing array if ID is already present
      }
      return [...prevLocations, newLocation]; // Add newLocation if ID is unique
    });
  };

  const removeLocation = (removedLocation) => {
    setLocations((prevLocations) => {
      return prevLocations.filter((location) => location.id !== removedLocation.id);
    });
  };

  

  const handleFindDistances = async () => {
    const distances = Array.from({ length: Locations.length }, () =>
      Array.from({ length: Locations.length }, () => Infinity)
    );
    for (let i = 0; i < Locations.length; i++) {
      for (let j = 0; j < Locations.length; j++) {
        const origin = Locations[i]['geometry']['coordinates'].join(',');
        const destination = Locations[j]['geometry']['coordinates'].join(',');

        const routeData = await calcRouteDirection(origin, destination);
        const distance = routeData.routes[0].distance;
        distances[i][j] = distance/1000;
        distances[j][i] = distance/1000;
      }
    }
    setDistanceMatrix(distances);
  }

  const calcRouteDirection = async ( origin: number, destination: number) => {
    try {
      const response = await axios.get(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${origin};${destination}?alternatives=true&geometries=geojson&language=en&overview=full&steps=true&access_token=pk.eyJ1IjoibWFzaGJ1cm4iLCJhIjoiY2x3MnVlcWZmMGtpeTJxbzA5ZXNmb3V0MCJ9.E-W6jVgrBjtiZL-mUJhUAw`
      );

      const { data } = response;
      // Handle route geometry data
      const routeGeometry = data.routes[0].geometry;
      //console.log(data);
      return data;
    } catch (error) {
      console.error('Error calculating directions:', error);
      throw error;
    }
  };     


  // Markers

  const addMarker = (Location: any) => {
    // Add location to Locations state
    addLocation(Location);
  
    // Update Locations using state updater function
    // Now, Locations has been updated and you can safely access it
    const id = Location['id'];
    const long = Location.geometry.coordinates[0];
    const lat = Location.geometry.coordinates[1];
    
    map.current!.flyTo({ center: [long, lat], zoom: 13 });
  
    const marker = new mapboxgl.Marker({color: '#E0E0E0'})
      .setLngLat([long, lat])
      .addTo(map.current!);
    markers.current[id] = marker;
  
    // Update markers state if needed
    setMarkers(Object.values(markers.current));
  };
  
  
  const deleteMarker = (Location: any) => {
    const id = Location.id;
    const marker = markers.current[id];
    marker.remove();
    delete markers.current[id];
    setMarkers(Object.values(markers.current));
  };

  //  CALLBACK FUNCTIONS
  const handleremovelocation = (locationDetails: any) => {
    removeLocation(locationDetails);
    deleteMarker(locationDetails);
    if(Locations.length < 2){
      setPath[null];
    }
   };

  const handlelocationData = async (locationDetails: any) => {
    addMarker(locationDetails);
   };

   const removeRoutes = (map: mapboxgl.Map | null, routes: any[]) => {
    if (map && routes && routes.length > 0) {
      routes.forEach((route: any, index: string) => {
        const routeId = 'route' + index;
        // Remove existing source and layer if they exist
        if (map.getSource(routeId)) {
          map.removeLayer(routeId);
          map.removeSource(routeId);
        }
      });
    }
  };

  // Routes
  
  useEffect(() => {

    removeRoutes(map.current, Routes); // Remove existing routes  
    if (Locations.length > 1) {
      const updateRoutesAsync = async () => {
        let updatedRoutes = []; // Initialize an array to hold the updated routes
        let upadatedPath: SetStateAction<never[]> = [];
        let time = 0;
        /*
        for (let i = 0; i < Locations.length - 1; i++) {
          // Loop until the second-to-last element
          const origin = Locations[i]['geometry']['coordinates'].join(',');
          const destination = Locations[i + 1]['geometry']['coordinates'].join(',');
  
          // Make sure origin and destination are in GeoJSON format
          try {
            const routeGeo = await calcRouteDirection(origin, destination);
            const updatedRoute = routeGeo.routes[0].geometry
            updatedRoutes.push(updatedRoute); // Push route to array if it's valid
          } catch (error) {
            console.error("Error calculating route direction:", error);
          }
        }
        */
       for (let i = 0; i < Locations.length-1; i++) {
            // Loop until the second-to-last element
            if(result['path']){
              const origin = Locations[result['path'][i]]['geometry']['coordinates'].join(',');
              const destination = Locations[result['path'][i + 1]]['geometry']['coordinates'].join(',');  

              upadatedPath.push(Locations[result['path'][i]])
              // Make sure origin and destination are in GeoJSON format
            try {
              const routeGeo = await calcRouteDirection(origin, destination);
              const updatedRoute = routeGeo.routes[0].geometry;
              updatedRoutes.push(updatedRoute); // Push route to array if it's valid
              console.log('routegeo',routeGeo)
              time += routeGeo.routes[0].duration;
            } catch (error) {
              console.error("Error calculating route direction:", error);
            }
          }
          
          
          
          

       }
       if(result['path'])
          {
            upadatedPath.push(Locations[result['path'][Locations.length - 1]])
          }

       

        // Set the new routes array after all routes are calculated
        setDuration(time);
        setRoutes(updatedRoutes);
        setPath(upadatedPath);
      };
  
      updateRoutesAsync();
    }
  }, [Locations, result]);
  
  useEffect(() => {
    console.log('Selected Location: ', Locations.length);
    if(Locations.length > 1){
      handleFindDistances();
    }
    if(Locations.length < 2){
      setPath(Locations);
      setResult({});
      setDuration(0);
    }
    
  }, [Locations]);

  


// MAP ROUTES AND LAYERS

const addRoute = (map: mapboxgl.Map | null, routes: any[]) => {
  if (map && routes && routes.length > 0) {
    routes.forEach((route: any, index: string) => {
      const routeId = 'route' + index;
      const smoothRoute = getSmoothRoute(route.coordinates);
      // Remove existing source and layer if they exist
      if (map.getSource(routeId)) {
        map.removeLayer(routeId);
        map.removeSource(routeId);
      }

      // Add new source and layer
      map.addSource(routeId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: smoothRoute,
        },
      });

      map.addLayer({
        id: routeId,
        type: 'line',
        source: routeId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#ec7a1c',
          'line-width': 5,
          'line-opacity': 1,
        },
      });
    });
  }
};

const getSmoothRoute = (coordinates) => {
  // Simplify the coordinates
  //const simplifiedCoordinates = simplify(coordinates.map(([x, y]) => ({ x, y })), 0.00001, true);
    
  // Convert back to the array format required by Bezier
  //const bezier = new Bezier(simplifiedCoordinates.map(({ x, y }) => ({ x, y })));
  //const points = bezier.getLUT(10).map(p => [p.x, p.y]);

  return {
    type: 'LineString',
    coordinates: coordinates,
  };
};

// MAP LOCATIONS

const fetchLocation = async (lng: any, lat: any) => {
  try {
      const response = await axios.get(`https://api.mapbox.com/search/geocode/v6/reverse?longitude=${lng}&latitude=${lat}&access_token=pk.eyJ1IjoibWFzaGJ1cm4iLCJhIjoiY2x3MnVlcWZmMGtpeTJxbzA5ZXNmb3V0MCJ9.E-W6jVgrBjtiZL-mUJhUAw`);
      addMarker(response.data.features[0]);
  } catch (error) {
      console.error('Error fetching suggestions:', error);
  }
};


// Add the routes to the map

useEffect(() => {
  addRoute(map.current, Routes);
  console.log('Routes:', Routes);
}, [map, Routes]);


  // MAP


  useEffect(() => {
    
    if (!map.current) { // Initialize map only once
      map.current = new mapboxgl.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/dark-v9',
        
        center: [lng, lat],
        zoom: zoom
      });

      map.current.on('move', () => {
        setLng(parseFloat(map.current!.getCenter().lng.toFixed(4)));
        setLat(parseFloat(map.current!.getCenter().lat.toFixed(4)));
        setZoom(parseFloat(map.current!.getZoom().toFixed(2)));
      });
      

      function add_marker (event: { lngLat: any; }) {
        var coordinates = event.lngLat;
        fetchLocation(coordinates.lng, coordinates.lat);
      }

      map.current.on('click', add_marker);

    }
  }, []);

  return (
    <>
      <Sidebar sendLocation={handlelocationData} updateLocation={handleremovelocation} results={result} path={path} time={Duration}/>
      <div ref={mapContainer} className="map-container  absolute top-0 left-0 right-0 bottom-0" />
    </>
  );
}

export default Map;