// src/models/Profile.ts

import mongoose from 'mongoose';
import { UserType } from '../types';

interface IProfile extends Document{
    userType:UserType,
    apartmentId?:mongoose.Types.ObjectId,
    services?: mongoose.Types.ObjectId[],
    locations?:mongoose.Types.ObjectId[]
}
const ProfileSchema = new mongoose.Schema({
    userType: { 
        type: String, 
        enum: Object.values(UserType), 
        required: true 
    },
    apartmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Apartment',
        required: function() { return this.userType === UserType.Resident; },
        message: 'Apartment ID is required for residents'
    },
    services: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
        required: function() { return this.userType === UserType.Fixer; },
        message: 'Services are required for fixers'
    },
    locations: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Location' }],
        required: function() { return this.userType === UserType.Fixer; },
        message: 'Locations are required for fixers'
    }
},{ collection: 'User' });

export default mongoose.model<IProfile>('Profile', ProfileSchema);
