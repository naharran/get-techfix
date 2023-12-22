
import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs'; 

dotenv.config();

fs.readFile("./X509-cert-5441899587717669141.pem",(err,data) =>{
  console.log({fileData:data})
})
const app = express();
app.use(express.json());

// Basic route for testing
app.get('/', (req: Request, res: Response) => {
  res.send('Hello World with TypeScript!');
});

// MongoDB Connection Options
const mongoUri = process.env.MONGODB_URI as string;
const mongoOptions: mongoose.ConnectOptions = {
};

// Environment-specific certificate handling
if (process.env.NODE_ENV === 'production') {
  // In production, use certificate from Base64-encoded environment variable
  const cert = Buffer.from(process.env.MONGO_CERT_BASE64 as string, 'base64').toString('utf-8');
  mongoOptions.tlsCertificateKeyFile = cert;
} else {
  // In development, use certificate file directly
  console.log("else block",process.env.MONGODB_URI)
}
mongoose.connect(mongoUri, mongoOptions)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('Error connecting to MongoDB', err));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
