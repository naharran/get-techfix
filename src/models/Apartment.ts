// src/models/Apartment.ts

import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IApartment extends Document<Types.ObjectId>  {
    name: string;
    address: string;
    coordinates: {
        lat: number;
        lon: number;
    };
    residents: mongoose.Types.ObjectId[];
    issues: mongoose.Types.ObjectId[];
}

const ApartmentSchema: Schema = new Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    coordinates: {
        lat: { type: Number, required: true },
        lon: { type: Number, required: true }
    },
    residents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    issues: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Issue' }]
});

export default mongoose.model<IApartment>('Apartment', ApartmentSchema);
