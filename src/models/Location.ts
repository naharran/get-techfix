import mongoose, { Schema, Document } from 'mongoose';

interface ILocation extends Document {
  city: string;
  region: string;
  coordinates: number[] | { lat: number; lon: number };
}

const LocationSchema = new Schema({
  city: { type: String, required: true },
  region: { type: String, required: true },
  coordinates: {
    type: Schema.Types.Mixed, // To support both array and object formats
    required: true
  }
}, { collection: 'Locations' });

// Index for the new coordinates format (if using an array)
LocationSchema.index({ "coordinates": '2dsphere' });

export default mongoose.model<ILocation>('Location', LocationSchema);
