// src/routes/apartmentRoutes.ts

import express, { Request, Response } from 'express';
import authenticate from '../middlewares/authenticate';
import Apartment from '../models/Apartment';
import { geocodeAddress } from '../utils/geocoding'; // Assuming this is your geolocation utility

const router = express.Router();

router.post('/create', authenticate, async (req: Request, res: Response) => {
    try {
        const { name, address } = req.body;

        // Use geolocation utility to convert address to coordinates
        const coordinates = await geocodeAddress(address);

        // Create and save the new apartment
        const newApartment = new Apartment({
            name,
            address,
            coordinates
        });

        await newApartment.save();
        res.status(201).json({ message: 'Apartment created successfully', newApartment });
    } catch (error) {
        console.error('Error creating apartment:', error);
        res.status(500).json({ error: error.message });
    }
});
router.get('/', authenticate, async (req: Request, res: Response) => {
    try {
        const { residentName, residentEmail, address, apartmentName } = req.query;
        let query = {};

        if (residentName || residentEmail) {
            let userMatch = {};
            if (residentName) userMatch['name'] = new RegExp(residentName, 'i');
            if (residentEmail) userMatch['email'] = new RegExp(residentEmail, 'i');

            const users = await User.find(userMatch);
            const userIds = users.map(user => user._id);
            query['residents'] = { $in: userIds };
        }

        if (address) query['address'] = new RegExp(address, 'i');
        if (apartmentName) query['name'] = new RegExp(apartmentName, 'i');

        const apartments = await Apartment.find(query).populate('residents');
        res.status(200).json(apartments);
    } catch (error) {
        console.error('Error fetching apartments:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/resident/:residentId', authenticate, async (req: Request, res: Response) => {
    try {
        const { residentId } = req.params;
        const apartments = await Apartment.find({ residents: residentId }).populate('residents');
        res.status(200).json(apartments);
    } catch (error) {
        console.error('Error finding apartments by resident ID:', error);
        res.status(500).json({ error: error.message });
    }
});


export default router;
