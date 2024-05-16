const [distanceMatrix, setDistanceMatrix] = useState<number[][]>([]);

const handleFindDistances = async () => {
    const distances = Array.from({ length: locationsCount }, () => Array(locationsCount).fill(0));

    for (let i = 0; i < locationsCount - 1; i++) {
        for (let j = i + 1; j < locationsCount; j++) {
            const origin = Locations[i].geometry.coordinates.join(',');
            const destination = Locations[j].geometry.coordinates.join(',');

            try {
                const response = await axios.get(
                    `https://api.mapbox.com/directions/v5/mapbox/driving/${origin};${destination}?geometries=geojson&access_token=pk.eyJ1IjoibWFzaGJ1cm4iLCJhIjoiY2x3MnVlcWZmMGtpeTJxbzA5ZXNmb3V0MCJ9.E-W6jVgrBjtiZL-mUJhUAw`
                );

                const distance = response.data.routes[0].distance;
                distances[i][j] = distance / 1000; // Convert to kilometers
                distances[j][i] = distance / 1000; 
            } catch (error) {
                console.error('Error calculating distance:', error);
            }
        }
    }

    setDistanceMatrix(distances);
    console.log(distances); // For testing
};