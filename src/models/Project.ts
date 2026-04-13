import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IProject extends Document {
  name: string;
  description?: string;
  owner: Types.ObjectId;        // ref: User (the admin who created it)
  members: Types.ObjectId[];    // ref: User[]
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    name:        { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    owner:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members:     [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);

export default Project;
