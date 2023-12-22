import mongoose, { Schema, Document } from 'mongoose';

interface ILocation extends Document {
  city: string;
  region: string;
  coordinates: {
    lat: number;
    lon: number;
  };
}

const LocationSchema: Schema = new Schema({
  city: { type: String, required: true },
  region: { type: String, required: true },
  coordinates: {
    lat: { type: Number, required: true },
    lon: { type: Number, required: true }
  }
});

export default mongoose.model<ILocation>('Location', LocationSchema);
