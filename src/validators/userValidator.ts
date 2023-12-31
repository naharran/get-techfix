// src/validators/userValidator.js
import { body, validationResult } from 'express-validator'
import User from '../models/User' // Import your User model

const checkUserTypeAssigned = async (value, { req }) => {
  const user = await User.findById(req.user._id) // Assuming req.user._id holds the user's ID
  if (!user) {
    throw new Error('User not found')
  }

  if (user.userType === 'Resident' || user.userType === 'Fixer') {
    throw new Error('User already has a profile type assigned')
  }

  return true
}
export const validateProfileUpdate = [
  body('userType')
    .isIn(['Resident', 'Fixer'])
    .withMessage('Invalid user type')
    .custom(checkUserTypeAssigned),
  body('apartmentId')
    .if(body('userType').equals('Resident'))
    .notEmpty()
    .withMessage('Apartment ID is required for Residents')
    .isMongoId()
    .withMessage('Invalid Apartment ID format'),
  body('services')
    .if(body('userType').equals('Fixer'))
    .notEmpty()
    .withMessage('Services are required for Fixers')
    .isArray()
    .withMessage('Services should be an array'),
  body('locations')
    .if(body('userType').equals('Fixer'))
    .notEmpty()
    .withMessage('Locations are required for Fixers')
    .isArray()
    .withMessage('Locations should be an array')
]

const passwordComplexityValidator = value => {
  const types = [
    { regex: /[a-z]/, found: false }, // Lowercase
    { regex: /[A-Z]/, found: false }, // Uppercase
    { regex: /[0-9]/, found: false } // Numbers
  ]

  types.forEach(type => {
    if (type.regex.test(value)) {
      type.found = true
    }
  })

  const foundTypesCount = types.filter(type => type.found).length
  if (foundTypesCount < 3) {
    throw new Error(
      'Password must contain : lower case letters, upper case letters and numbers.'
    )
  }
  return true
}

export const validateSignup = [
  body('email').isEmail().withMessage('Invalid email format'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .custom(passwordComplexityValidator),
  body('firstName')
    .isLength({ min: 2 })
    .withMessage('First Name must be at least 2 characters'),
  body('lastName')
    .isLength({ min: 2 })
    .withMessage('Last Name must be at least 2 characters')
]
