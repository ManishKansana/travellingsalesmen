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
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [routeGeometry, setRouteGeometry] = useState(null);
  const [Locations, setLocations] = useState([]);

  useEffect(() => {
    if (Locations.length >= 2) {
      const originCoordinates = Locations[0]['coordinates'].join(',');
      const destinationCoordinates = Locations[Locations.length - 1]['coordinates'].join(',');
      setOrigin(originCoordinates);
      setDestination(destinationCoordinates);
    }
  }, [Locations]);

  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1IjoibWFzaGJ1cm4iLCJhIjoiY2x3MnVlcWZmMGtpeTJxbzA5ZXNmb3V0MCJ9.E-W6jVgrBjtiZL-mUJhUAw';
  }, []);
  
  useEffect(() => {
      const calcRouteDirection = async () => {
        try {
          const response = await axios.get(
            `https://api.mapbox.com/directions/v5/mapbox/driving/${origin};${destination}?alternatives=true&geometries=geojson&language=en&overview=full&steps=true&access_token=pk.eyJ1IjoibWFzaGJ1cm4iLCJhIjoiY2x3MnVlcWZmMGtpeTJxbzA5ZXNmb3V0MCJ9.E-W6jVgrBjtiZL-mUJhUAw`
          );
  
          const { data } = response;
          console.log(data);
          // Handle route geometry data
          const routeGeometry = data.routes[0].geometry;
          setRouteGeometry(routeGeometry);
        } catch (error) {
          console.error('Error calculating directions:', error);
        }
      };
  
      if (origin && destination) {
        calcRouteDirection();
      }
  }, [origin, destination]);


  const handlelocationData = (locationDetails: any) => {
    setLocations([...Locations, locationDetails])
    const lang = locationDetails['coordinates'][0]
    const lat = locationDetails['coordinates'][1]
    map.current!.setCenter([lang, lat])
    new mapboxgl.Marker().setLngLat([lang, lat]).addTo(map.current!)
   };
   
   useEffect(() => {
    if (map.current && routeGeometry) {
      // Remove existing source and layer if they exist
      if (map.current.getSource('route')) {
        map.current.removeLayer('route');
        map.current.removeSource('route');
      }
  
      // Add new source and layer
      map.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: routeGeometry,
        },
      });
  
      map.current.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
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
    }
  }, [routeGeometry]);



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
      <Sidebar sendLocation={handlelocationData}/>
      <div ref={mapContainer} className="map-container  absolute top-0 left-0 right-0 bottom-0" />
    </>
  );
}

export default Map;
