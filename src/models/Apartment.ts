import mongoose, { Schema, Document } from 'mongoose';

interface IApartment extends Document {
  name: string;
  address: string;
  residentIds: mongoose.Types.ObjectId[];
  issueIds: mongoose.Types.ObjectId[];
}

const ApartmentSchema: Schema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  residentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  issueIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Issue' }]
});

export default mongoose.model<IApartment>('Apartment', ApartmentSchema);
