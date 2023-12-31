// src/routes/locationRoutes.ts

import express, { Request, Response } from 'express';
import Location from '../models/Location';
import asyncHandler from 'express-async-handler';

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const locations = await Location.find({});
    res.status(200).json(locations);
  })
);

export default router;
