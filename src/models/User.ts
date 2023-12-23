// src/models/User.ts

import mongoose, { Document, Schema } from 'mongoose'
import { UserType } from '../types'

interface IUser extends Document {
  email: string
  password: string // Will be used only for Auth0, not stored in the DB
  firstName: string
  lastName: string
  userType: UserType
  auth0Id: string // The Auth0 user identifier
  // Additional fields for 'Resident' or 'Fixer'
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  userType: { type: String, enum: Object.values(UserType) },
  auth0Id: { type: String, required: true },
},{ collection: 'User' })


export default mongoose.model<IUser>('User', UserSchema)
