import axios from 'axios';

export async function geocodeAddress(address: string) {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
        params: {
            address: address,
            key: process.env.GOOGLE_API_KEY
        }
    });

    const { lat, lng } = response.data.results[0].geometry.location;
    return { lat, lon: lng }; // Return the coordinates
}

