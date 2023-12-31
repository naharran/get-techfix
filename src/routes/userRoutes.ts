import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import UserService from '../services/userService';
import authenticate from '../middlewares/authenticate';
import { validateProfileUpdate, validateSignup } from '../validators/userValidator';
import { handleValidationErrors } from '../middlewares/handleValidationErrors';
import { UserType } from '../types';

const router = express.Router();

router.post(
  '/signup',
  validateSignup,
  handleValidationErrors,
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password, firstName, lastName } = req.body;
    const newUser = await UserService.signup(email, password, firstName, lastName);
    const authData = await UserService.authenticate(email, password);

    res.cookie('authToken', authData.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict'
    });
    res.status(201).json({ message: 'User registered successfully', newUser, tokens: authData });
  })
);

router.patch(
  '/complete-profile',
  authenticate,
  validateProfileUpdate,
  handleValidationErrors,
  asyncHandler(async (req: Request, res: Response) => {
    const { auth0Id } = req.user;
    const updatedUser = await UserService.completeProfile(auth0Id, req.body);
    res.status(200).json({ message: 'Profile updated successfully', updatedUser });
  })
);

router.get(
  '/users-by-type',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userType = req.query.userType as UserType;
    const users = await UserService.getUsersByType(userType);
    res.status(200).json(users);
  })
);

router.post(
  '/login',
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const authData = await UserService.authenticate(email, password);
    res.cookie('authToken', authData.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict'
    });
    res.status(200).json({ message: 'Login successful', tokens: authData });
  })
);

router.get('/logout', (req: Request, res: Response) => {
  res.clearCookie('authToken');
  res.status(200).json({ message: 'Successfully logged out' });
});

export default router;