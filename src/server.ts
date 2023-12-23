
import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import userRoutes from './routes/userRoutes';
import dotenv from 'dotenv';
import * as swaggerDocument from '../swagger.json';
import swaggerUi from 'swagger-ui-express';
import apartmentRoutes from './routes/apartmentRoutes';
import authenticate from './middlewares/authenticate';
import cookieParser from 'cookie-parser';
import cors from "cors"


dotenv.config();

const app = express();
app.use(cors())
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(cookieParser());
app.use(express.json());
// Basic route for testing
app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to Tech-fix API!');
});

// MongoDB Connection Options
const mongoUri = process.env.MONGODB_URI as string;
const mongoOptions: mongoose.ConnectOptions = {
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api/users', userRoutes);
app.use('/api/apartments',authenticate, apartmentRoutes);


mongoose.connect(mongoUri, mongoOptions)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('Error connecting to MongoDB', err));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
