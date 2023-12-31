import mongoose, { Document, Schema } from 'mongoose'
import { UserType } from '../types'

export interface FixerData {
  services?: mongoose.Types.ObjectId[]
  locations?: mongoose.Types.ObjectId[]
}

export interface ResidentData {
  apartmentId?: mongoose.Types.ObjectId
}

export interface IUser extends Document {
  email: string
  firstName: string
  lastName: string
  auth0Id: string // The Auth0 user identifier
  userType?: UserType
  residentData?: ResidentData
  fixerData?: FixerData
}

export type ProfileData = Pick<IUser, 'residentData' | 'fixerData' | 'userType'>

const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    userType: { type: String, enum: Object.values(UserType), required: false },
    auth0Id: { type: String, required: true },
    residentData: {
      apartmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Apartment',
        required: function () {
          return this.userType === UserType.Resident
        }
      }
    },
    fixerData: {
      services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
      locations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Location' }]
    }
  },
  { collection: 'User' }
)

export default mongoose.model<IUser>('User', UserSchema)
