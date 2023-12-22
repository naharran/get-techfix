import mongoose, { Schema, Document } from 'mongoose';

interface IIssue extends Document {
  type: mongoose.Types.ObjectId;
  apartment: mongoose.Types.ObjectId;
  description: string;
  status: string;
}

const IssueSchema: Schema = new Schema({
  type: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  apartment: { type: mongoose.Schema.Types.ObjectId, ref: 'Apartment', required: true },
  description: { type: String, required: true },
  status: { type: String, required: true }
});

export default mongoose.model<IIssue>('Issue', IssueSchema);
