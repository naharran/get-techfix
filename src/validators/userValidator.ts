import { CustomValidator, body, validationResult } from 'express-validator'
import User from '../models/User' 
import { UserType } from '../types'

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
const validateObjectId = (value: string, { req, location, path }) => {
  if (!value.match(/^[0-9a-fA-F]{24}$/)) {
    throw new Error(`${path} contains an invalid ID format`);
  }
  return true;
};

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
    body('services.*')
    .if(body('userType').equals(UserType.Fixer))
    .custom(validateObjectId)
    .withMessage('Each service ID must be a valid MongoDB Object ID'),
  body('locations.*')
    .if(body('userType').equals(UserType.Fixer))
    .custom(validateObjectId)
    .withMessage('Each location ID must be a valid MongoDB Object ID'),
  body('services')
    .if(body('userType').equals(UserType.Fixer))
    .notEmpty()
    .withMessage('Services are required for Fixers')
    .isArray()
    .withMessage('Services should be an array'),
  body('locations')
    .if(body('userType').equals(UserType.Fixer))
    .notEmpty()
    .withMessage('Locations are required for Fixers')
    .isArray()
    .withMessage('Locations should be an array')
]

export const loginValidators = [
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').notEmpty().withMessage('Password is required')
];


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


// Custom validator to check if the email already exists
const emailExists: CustomValidator = async (email) => {
  const user = await User.findOne({ email });
  if (user) {
    return Promise.reject('Email already in use');
  }
};

export const validateSignup = [
  body('email')
    .isEmail().withMessage('Invalid email format')
    .custom(emailExists),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .custom(passwordComplexityValidator),
  body('firstName')
    .isLength({ min: 2 }).withMessage('First Name must be at least 2 characters'),
  body('lastName')
    .isLength({ min: 2 }).withMessage('Last Name must be at least 2 characters')
];
