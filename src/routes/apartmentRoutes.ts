// src/routes/apartmentRoutes.ts

import express, { Request, Response } from 'express';
import authenticate from '../middlewares/authenticate';
import Apartment from '../models/Apartment';
import { geocodeAddress } from '../utils/geocoding'; // Assuming this is your geolocation utility
import User from '../models/User';

const router = express.Router();

router.post('/create', authenticate, async (req: Request, res: Response) => {
    try {
        const { name, address } = req.body;
        const userId = req.user._id
        // Use geolocation utility to convert address to coordinates
        const coordinates = await geocodeAddress(address);

        // Create and save the new apartment
        const newApartment = new Apartment({
            name,
            address,
            residents: [userId],
            coordinates
        });

        await newApartment.save();
        await User.findByIdAndUpdate(userId, { apartmentId: newApartment._id });

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
            if (residentName) userMatch['name'] = new RegExp(residentName as string, 'i');
            if (residentEmail) userMatch['email'] = new RegExp(residentEmail as string, 'i');

            const users = await User.find(userMatch);
            const userIds = users.map(user => user._id);
            query['residents'] = { $in: userIds };
        }

        if (address) query['address'] = new RegExp(address as string, 'i');
        if (apartmentName) query['name'] = new RegExp(apartmentName as string, 'i');

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
        res.status(500).json({ error: error.message });
    }
});
router.get('/apartments-summary', authenticate, async (req: Request, res: Response) => {
    try {
        const apartmentsSummary = await Apartment.aggregate([
            {
                $lookup: {
                    from: 'issues',
                    localField: '_id',
                    foreignField: 'apartment',
                    as: 'issues'
                }
            },
            {
                $unwind: {
                    path: '$issues',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: '$_id',
                    name: { $first: '$name' },
                    address: { $first: '$address' },
                    issuesCount: { $sum: { $cond: [{ $eq: ['$issues.status', 'open'] }, 1, 0] } },
                    residents: { $first: '$residents' }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'residents',
                    foreignField: '_id',
                    as: 'residentDetails'
                }
            },
            {
                $project: {
                    name: 1,
                    address: 1,
                    issuesCount: 1,
                    residents: '$residentDetails.name'
                }
            }
        ]);

        res.status(200).json(apartmentsSummary);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


export default router;
