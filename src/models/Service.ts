import mongoose, { Schema, Document } from 'mongoose'

interface IService extends Document {
  name: string
}

const ServiceSchema: Schema = new Schema(
  {
    name: { type: String, required: true }
  },
  { collection: 'Services' }
)

export default mongoose.model<IService>('Service', ServiceSchema)
