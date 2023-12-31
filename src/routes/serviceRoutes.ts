// src/routes/serviceRoutes.ts

import express, { Request, Response } from 'express';
import Service from '../models/Service';
import asyncHandler from 'express-async-handler';

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const services = await Service.find({});
    res.status(200).json(services);
  })
);

export default router;
