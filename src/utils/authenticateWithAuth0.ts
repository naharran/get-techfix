// src/utils/authenticateWithAuth0.ts

import axios from 'axios';

async function authenticateWithAuth0(email: string, password: string) {
    try {
        const response = await axios.post(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
            grant_type: 'password',
            client_id: process.env.AUTH0_CLIENT_ID,
            client_secret: process.env.AUTH0_SECRET,
            username: email,
            password,
            scope: 'openid profile email',
            audience: process.env.AUTH0_AUDIENCE,

        });

        return response.data;
    } catch (error) {
        console.log(error.message, error.response.data)
        throw new Error(error.response?.data || error.message);
    }
}

export default authenticateWithAuth0;
