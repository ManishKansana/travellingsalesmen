//import { useState } from 'react'
import './App.css'
import Map from './components/Map';


const N = 19;

const pi = 3.14159265358979323846;
const earth_radius_km = 6371.0;

function deg2rad(deg: number) {
  return deg * (pi / 180.0);
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = earth_radius_km * c;
  return distance;
}

const Cities_Europe = {
  "Paris": 0,      "London": 1,
  "Berlin": 2,     "Madrid": 3,
  "Rome": 4,       "Moscow": 5,
  "Istanbul": 6,   "Vienna": 7,
  "Budapest": 8,   "Warsaw": 9,
  "Barcelona": 10, "Prague": 11,
  "Milan": 12,     "Saint Petersburg": 13,
  "Munich": 14,    "Lisbon": 15,
  "Amsterdam": 16, "Athens": 17,
  "Helsinki": 18,  "Stockholm": 19
};

// Vector of latitude and longitude pairs for the cities
// Each pair is in the form (latitude, longitude)
const Cities_LatLong = [
  [48.8566, 2.3522],    // Paris
  [51.5074, -0.1278],   // London
  [52.5200, 13.4050],   // Berlin
  [40.4168, -3.7038],   // Madrid
  [41.9028, 12.4964],   // Rome
  [55.7558, 37.6173],   // Moscow
  [41.0082, 28.9784],   // Istanbul
  [48.2082, 16.3738],   // Vienna
  [47.4979, 19.0402],   // Budapest
  [52.2297, 21.0122],   // Warsaw
  [41.3851, 2.1734],    // Barcelona
  [50.0755, 14.4378],   // Prague
  [45.4642, 9.1900],    // Milan
  [59.9343, 30.3351],   // Saint Petersburg
  [48.1351, 11.5820],   // Munich
  [38.7223, -9.1393],   // Lisbon
  [52.3676, 4.9041],    // Amsterdam
  [37.9838, 23.7275],   // Athens
  [60.1699, 24.9384],   // Helsinki
  [59.3293, 18.0686]    // Stockholm
];

function printDistance(graph: any[][], Cities_Europe: { [x: string]: any; Paris?: number; London?: number; Berlin?: number; Madrid?: number; Rome?: number; Moscow?: number; Istanbul?: number; Vienna?: number; Budapest?: number; Warsaw?: number; Barcelona?: number; Prague?: number; Milan?: number; "Saint Petersburg"?: number; Munich?: number; Lisbon?: number; Amsterdam?: number; Athens?: number; Helsinki?: number; Stockholm?: number; }, city1: string, city2: string) {
  // Use .at() for direct access since it throws an exception if the key doesn't exist, providing a clear error message.
  const loc1 = Cities_Europe[city1]; 
  const loc2 = Cities_Europe[city2];

  console.log("");
  console.log("Distance between " + city1 + " and " + city2 + ": " + graph[loc1][loc2] + " km");
  return graph[loc1][loc2];
};

function constructGraph(graph: any[][], locations: any[][]) {
  for (let i = 0; i < N; ++i) {
      for (let j = 0; j < N; ++j) {
          // Use the Haversine formula to calculate distance between locations[i] and locations[j]
          graph[i][j] = haversine(locations[i][0], locations[i][1], locations[j][0], locations[j][1]);
      }
  }
}


const graph = Array.from({length: N}, () => Array(N).fill(0)); // adjacency matrix
constructGraph(graph, Cities_LatLong);

let distance:number = printDistance(graph, Cities_Europe, "London", "Milan" );

console.log("");



function App() {

  return (
    <>
    <Map/>
    </>

  )
}

export default App
