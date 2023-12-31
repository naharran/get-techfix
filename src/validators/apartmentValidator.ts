
import { param, query,body } from 'express-validator';
import User from '../models/User';
import mongoose from 'mongoose';
const ObjectId = mongoose.Types.ObjectId;

export const createApartmentValidations = [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required.')
      .isLength({ max: 100 })
      .withMessage('Name must not be longer than 100 characters.'),
    
    body('address')
      .trim()
      .notEmpty()
      .withMessage('Address is required.'),
  
    // Custom validator to check if user is already listed in an apartment
    body().custom(async (value, { req }) => {
      const userId = req.user._id; // Adjust this based on how you store the user's ID in the request
      const existingUser = await User.findOne({ _id: new ObjectId(userId), 'residentData': { $ne: null } });
        console.log({existingUser,userId})
      if (existingUser) {
        throw new Error('User is already listed in an apartment');
      }
  
      return true;
    })
  ];
  
export const validatePotentialFixers = [
    param('apartmentId')
        .isMongoId()
        .withMessage('Invalid apartment ID format'),

    query('issueType')
        .optional()
        .isMongoId()
        .withMessage('Invalid issue type ID format')
];

