import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import '../../globals.css'
import Sidebar from './Sidebar';
import axios from 'axios';


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


  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1IjoibWFzaGJ1cm4iLCJhIjoiY2x3MnVlcWZmMGtpeTJxbzA5ZXNmb3V0MCJ9.E-W6jVgrBjtiZL-mUJhUAw';
  }, []);
  

  const calcRouteDirection = async ( origin: number, destination: number) => {
    try {
      const response = await axios.get(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${origin};${destination}?alternatives=true&geometries=geojson&language=en&overview=full&steps=true&access_token=pk.eyJ1IjoibWFzaGJ1cm4iLCJhIjoiY2x3MnVlcWZmMGtpeTJxbzA5ZXNmb3V0MCJ9.E-W6jVgrBjtiZL-mUJhUAw`
      );

      const { data } = response;
      console.log(data);
      // Handle route geometry data
      const routeGeometry = data.routes[0].geometry;
      return routeGeometry;
    } catch (error) {
      console.error('Error calculating directions:', error);
      throw error;
    }
  };     


  // Markers

  const addMarker = (Location: any) => {
    const id = Location.id;
    const long = Location.geometry.coordinates[0]
    const lat = Location.geometry.coordinates[1]
    map.current!.setCenter([long, lat])
    const marker = new mapboxgl.Marker()
        .setLngLat([long, lat])
        .addTo(map.current!);
    markers.current[id] = marker;
    };
  
  const deleteMarker = (Location: any) => {
    const id = Location.id;
    const marker = markers.current[id];
    marker.remove();
    delete markers.current[id];
  };

  //  CALLBACK FUNCTIONS
  const handleremovelocation = (locationDetails: any) => {
    setLocations([...Locations, locationDetails])
    console.log('locationDetails from Child: ',locationDetails);
    setLocations(Locations.filter(location => location.id !== locationDetails.id));
    deleteMarker(locationDetails);
    console.log('marker removed')
   };

  const handlelocationData = async (locationDetails: any) => {
    if(Locations.length >= 1){
      const origin = Locations[Locations.length - 1]['geometry']['coordinates'].join(',');
      const destination = locationDetails['geometry']['coordinates'].join(',');
      const routeGeo = await calcRouteDirection(origin, destination);
      // Pushing route to array
      setRoutes([...Routes, routeGeo]);

    }
    setLocations([...Locations, locationDetails])
    addMarker(locationDetails);
   };

// MAP ROUTES AND LAYERS

const addRoute = (map, routes) => {
  if (map && routes && routes.length > 0) {
    routes.forEach((route, index) => {
      const routeId = 'route' + index;
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
          geometry: route,
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
          'line-color': '#3887be',
          'line-width': 5,
          'line-opacity': 0.75,
        },
      });
    });
  }
};


useEffect(() => {
  addRoute(map.current, Routes);
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

    }
  }, []);

  return (
    <>
      <Sidebar sendLocation={handlelocationData} updateLocation={handleremovelocation}/>
      <div ref={mapContainer} className="map-container  absolute top-0 left-0 right-0 bottom-0" />
    </>
  );
}

export default Map;