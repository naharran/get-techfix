import mongoose, { Schema, Document } from 'mongoose';

interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  userType: 'Resident' | 'Fixer';
  apartmentId?: mongoose.Types.ObjectId;
  services?: string[];
  locations?: mongoose.Types.ObjectId[];
}

const UserSchema: Schema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: String,
  userType: { type: String, required: true, enum: ['Resident', 'Fixer'] },
  apartmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Apartment' },
  services: [String],
  locations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Location' }]
});

export default mongoose.model<IUser>('User', UserSchema);
