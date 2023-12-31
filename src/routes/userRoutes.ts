import express, { Request, Response } from 'express'
import axios from 'axios'
import User, { ProfileData } from '../models/User'
import authenticateWithAuth0 from '../utils/authenticateWithAuth0'
import authenticate from '../middlewares/authenticate'
import Apartment from '../models/Apartment'
import { UserType } from '../types'
import {
  validateProfileUpdate,
  validateSignup
} from '../validators/userValidator'
import { handleValidationErrors } from '../middlewares/handleValidationErrors'
import asyncHandler from 'express-async-handler'

const router = express.Router()

// Shared function to authenticate with Auth0 and obtain tokens
async function handleAuthentication (
  email: string,
  password: string,
  res: Response
) {
  const authData = await authenticateWithAuth0(email, password)
  res.cookie('authToken', authData.access_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict'
  })
  return { message: 'Authentication successful', user: authData }
}

// Signup Route
router.post(
  '/signup',
  validateSignup,
  handleValidationErrors,
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password, firstName, lastName } = req.body
    const auth0Response = await axios.post(
      `https://${process.env.AUTH0_DOMAIN}/dbconnections/signup`,
      {
        client_id: process.env.AUTH0_CLIENT_ID,
        email,
        password,
        connection: 'Username-Password-Authentication'
      }
    )

    const newUser = new User({
      email,
      firstName,
      lastName,
      auth0Id: auth0Response.data._id
    })
    await newUser.save()

    const tokens = await handleAuthentication(email, password, res)
    res.status(201).json({ message: 'User registered successfully', tokens })
  })
)

router.patch(
  '/complete-profile',
  authenticate,
  validateProfileUpdate,
  handleValidationErrors,
  asyncHandler(async (req: Request, res: Response) => {
    const { userType, apartmentId, services, locations } = req.body
    const { auth0Id } = req.user

    let updateData: ProfileData = { userType }

    if (userType === UserType.Resident) {
      updateData.residentData = { apartmentId }
    } else if (userType === UserType.Fixer) {
      updateData.fixerData = { services, locations }
    }

    const updatedUser = await User.findOneAndUpdate({ auth0Id }, updateData, {
      new: true
    })

    if (userType === UserType.Resident && apartmentId) {
      const apartment = await Apartment.findById(apartmentId)
      if (apartment && !apartment.residents.includes(updatedUser._id)) {
        apartment.residents.push(updatedUser._id)
        await apartment.save()
      }
    }

    res
      .status(200)
      .json({ message: 'Profile updated successfully', updatedUser })
  })
)

router.get(
  '/users-by-type',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userType = req.query.userType as UserType

    if (!Object.values(UserType).includes(userType)) {
      res
        .status(400)
        .json({ message: 'Invalid or missing userType query parameter' })
    }

    const users = await User.find({ userType })
    res.status(200).json(users)
  })
)

// Login Route
router.post(
  '/login',
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body
    const tokens = await handleAuthentication(email, password, res)
    res.status(200).json({ message: 'Login successful', tokens })
  })
)

router.get('/logout', (req: Request, res: Response) => {
  res.clearCookie('authToken')
  res.status(200).json({ message: 'Successfully logged out' })
})

export default router
