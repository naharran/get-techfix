import express, { Request, Response } from 'express'
import asyncHandler from 'express-async-handler'
import authenticate from '../middlewares/authenticate'
import Apartment from '../models/Apartment'
import { geocodeAddress } from '../utils/geocoding'
import User from '../models/User'
import { apartmentSummaryPipeline } from '../aggregations/apartmentSummary'
import { createApartmentValidations, validatePotentialFixers } from '../validators/apartmentValidator'
import { findPotentialFixers } from '../services/apartment.service'
import { handleValidationErrors } from '../middlewares/handleValidationErrors'

const router = express.Router()

router.post(
  '/create',
  authenticate,
  createApartmentValidations,
  handleValidationErrors,
  asyncHandler(async (req: Request, res: Response) => {
    const { name, address } = req.body
    const userId = req.user._id
    const coordinates = await geocodeAddress(address)
    console.log({userId})
    const newApartment = new Apartment({
      name,
      address,
      residents: [userId],
      coordinates
    })

    await newApartment.save()
    await User.findByIdAndUpdate(
      userId, 
      { 'residentData.apartmentId': newApartment._id }
    );

    res
      .status(201)
      .json({ message: 'Apartment created successfully', newApartment })
  })
)

router.get(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { residentName, residentEmail, address, apartmentName } = req.query
    let query = {}

    if (residentName || residentEmail) {
      let userMatch = {}
      if (residentName)
        userMatch['name'] = new RegExp(residentName as string, 'i')
      if (residentEmail)
        userMatch['email'] = new RegExp(residentEmail as string, 'i')

      const users = await User.find(userMatch)
      const userIds = users.map(user => user._id)
      query['residents'] = { $in: userIds }
    }

    if (address) query['address'] = new RegExp(address as string, 'i')
    if (apartmentName) query['name'] = new RegExp(apartmentName as string, 'i')

    const apartments = await Apartment.find(query)
    res.status(200).json(apartments)
  })
)

router.get(
  '/:apartmentId',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { apartmentId } = req.params
    const resident = await Apartment.find({ _id: apartmentId })
    res.status(200).json(resident)
  })
)

router.get(
  '/:apartmentId/potential-fixers',
  validatePotentialFixers,
  handleValidationErrors,
  asyncHandler(async (req: Request, res: Response) => {
    const { apartmentId } = req.params
    const { issueType } = req.query

    // Retrieve the apartment to get its coordinates
    const apartment = await Apartment.findById(apartmentId)
    if (!apartment) {
      res.status(404).json({ message: 'Apartment not found' })
    }

    const potentialFixers = await findPotentialFixers(
      apartment.coordinates,
      issueType
    )
      console.log({potentialFixers})
    res.status(200).json({ potentialFixers })
  })
)

// The `findPotentialFixers` function needs to be implemented in a suitable module.

export default router


