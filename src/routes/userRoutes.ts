import express, { Request, Response } from 'express'
import asyncHandler from 'express-async-handler'
import UserService from '../services/userService'
import authenticate from '../middlewares/authenticate'
import {
  loginValidators,
  validateProfileUpdate,
  validateSignup
} from '../validators/userValidator'
import { handleValidationErrors } from '../middlewares/handleValidationErrors'
import { UserType } from '../types'
import { checkUserLoggedIn } from '../middlewares/checkUserLoggedIn'
import Apartment from '../models/Apartment'
import { ProfileData } from '../models/User'

const router = express.Router()

router.post(
  '/signup',
  validateSignup,
  handleValidationErrors,
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password, firstName, lastName } = req.body
    const newUser = await UserService.signup(
      email,
      password,
      firstName,
      lastName
    )
    const authData = await UserService.authenticate(email, password)

    res.cookie('authToken', authData.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict'
    })
    res
      .status(201)
      .json({
        message: 'User registered successfully',
        newUser,
        tokens: authData
      })
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

    const updatedUser = await UserService.completeProfile(auth0Id, updateData)

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
    const users = await UserService.getUsersByType(userType)
    res.status(200).json(users)
  })
)

router.post(
  '/login',
  loginValidators,
  checkUserLoggedIn,
  handleValidationErrors,
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body
    const authData = await UserService.authenticate(email, password)
    res.cookie('authToken', authData.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict'
    })
    res.status(200).json({ message: 'Login successful', tokens: authData })
  })
)

router.get('/logout', (req: Request, res: Response) => {
  res.clearCookie('authToken')
  res.status(200).json({ message: 'Successfully logged out' })
})

export default router
