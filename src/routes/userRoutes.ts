// src/routes/userRoutes.ts

import express, { Request, Response } from 'express'
import axios from 'axios'
import User from '../models/User'
import authenticateWithAuth0 from '../utils/authenticateWithAuth0'
import Profile from '../models/Profile'
import authenticate from '../middlewares/authenticate'
import Apartment from '../models/Apartment'
import { Types } from 'mongoose'
import { ErrorCodes } from '../consts'

const router = express.Router()

// Shared function to authenticate with Auth0 and obtain tokens
async function handleAuthentication (
  email: string,
  password: string,
  res: Response
) {
  try {
    const authData = await authenticateWithAuth0(email, password)

    // Set a cookie with the token
    res.cookie('authToken', authData.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict'
    })

    return { message: 'Authentication successful', user: authData }
  } catch (error) {
    console.error('Authentication error:', error)
    throw error
  }
}

// Signup Route
router.post('/signup', async (req: Request, res: Response) => {
  const { email, password, firstName, lastName } = req.body

  try {
    // Create user in Auth0
    const auth0Response = await axios.post(
      `https://${process.env.AUTH0_DOMAIN}/dbconnections/signup`,
      {
        client_id: process.env.AUTH0_CLIENT_ID,
        email,
        password,
        connection: 'Username-Password-Authentication'
      }
    )

    // Create user in your database
    const newUser = new User({
      email,
      firstName,
      lastName,
      auth0Id: auth0Response.data._id
    })
    await newUser.save()

    // Authenticate with Auth0 and get tokens
    const tokens = await handleAuthentication(email, password, res)
    res.status(201).json({ message: 'User registered successfully', tokens })
  } catch (error) {
    res.status(500).json({ error: ErrorCodes[error.data.code] })
  }
})

router.patch(
  '/complete-profile',
  authenticate,
  async (req: Request, res: Response) => {
    const { userType, apartmentId, services, locations } = req.body
    const { auth0Id } = req.user
    const userObjectId  = new Types.ObjectId(auth0Id)
    // Create a Profile instance for validation
    const profileData = new Profile({
      userType,
      apartmentId,
      services,
      locations
    })

    // Validate the profile data
    const validationError = profileData.validateSync()
    if (validationError) {
      return res.status(400).json({ error: validationError.message })
    }

    try {
      // Update the user's profile in the database
      const updatedUser = await User.findOneAndUpdate(
        { auth0Id },
        { userType, apartmentId, services, locations },
        { new: true }
      )
      if (apartmentId) {
        const apartment = await Apartment.findById(apartmentId)
        if (apartment && !apartment.residents.includes(userObjectId)) {
          apartment.residents.push(userObjectId)
          await apartment.save()
        }
      }

      res
        .status(200)
        .json({ message: 'Profile updated successfully', updatedUser })
    } catch (error) {
      res.status(500).json({ error: error.data.message })
    }
  }
)

// Login Route
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body

  try {
    // Authenticate with Auth0 and get tokens
    const tokens = await handleAuthentication(email, password, res)
    res.status(200).json({ message: 'Login successful', tokens })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Additional routes can be added here

export default router
