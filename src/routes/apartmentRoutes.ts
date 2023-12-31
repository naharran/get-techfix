import express, { Request, Response } from 'express'
import asyncHandler from 'express-async-handler'
import authenticate from '../middlewares/authenticate'
import Apartment from '../models/Apartment'
import { geocodeAddress } from '../utils/geocoding'
import User from '../models/User'
import {
  createApartmentValidations,
  validatePotentialFixers
} from '../validators/apartmentValidator'
import { handleValidationErrors } from '../middlewares/handleValidationErrors'
import ApartmentService from '../services/apartmentService'

const router = express.Router()

router.post(
  '/create',
  authenticate,
  createApartmentValidations,
  handleValidationErrors,
  asyncHandler(async (req: Request, res: Response) => {
    const { name, address } = req.body
    const userId = req.user._id
    const newApartment = await ApartmentService.createApartment(
      name,
      address,
      userId
    )
    res
      .status(201)
      .json({ message: 'Apartment created successfully', newApartment })
  })
)
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const apartments = await ApartmentService.getApartments(req.query)
    res.status(200).json(apartments)
  })
)

router.get(
  '/:apartmentId',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const apartment = await ApartmentService.getApartmentById(
      req.params.apartmentId
    )
    if (!apartment) {
      res.status(404).json({ message: 'Apartment not found' })
    }
    res.status(200).json(apartment)
  })
)

router.get(
  '/:apartmentId/potential-fixers',
  validatePotentialFixers,
  handleValidationErrors,
  asyncHandler(async (req: Request, res: Response) => {
    const { apartmentId } = req.params
    const { issueType } = req.query

    const potentialFixers = await ApartmentService.findPotentialFixers(
      apartmentId,
      <string>issueType
    )
    res.status(200).json({ potentialFixers })
  })
)


export default router
