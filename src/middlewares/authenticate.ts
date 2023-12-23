import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

// Initialize JWKS client


const getKey = async(header) => {
    try {
        const client = jwksClient({
            jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
        });
        const key = await client.getSigningKey(header.kid);
        const signingKey = key.getPublicKey();
        return signingKey;
    } catch (err) {
        console.error('Error getting signing key:', err);
        throw new Error('Error getting signing key');
    }
}

const verifyToken = async (token) => {
    const decodedToken = jwt.decode(token, { complete: true });
    if (!decodedToken || !decodedToken.header.kid) {
        throw new Error('Invalid token');
    }
    console.log({decodedToken})
    const publicKey = await getKey(decodedToken.header);
    return jwt.verify(token, publicKey);
};
export default async function authenticate (req, res, next) {
    try {
        const token = req.cookies.authToken;
        if (!token) {
            return res.status(401).send('Access denied. No token provided.');
        }

        const decoded = await verifyToken(token);
        req.params.auth0Id = (decoded.sub as string).split('|')[1];
        next();
    } catch (error) {
        res.status(400).send('Invalid token.');
    }
};
