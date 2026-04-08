import mongoose, { Schema, model, models } from 'mongoose';

const TaskSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'review', 'done'],
    default: 'todo'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },

  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  assignee: { type: Schema.Types.ObjectId, ref: 'User' },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

TaskSchema.index({ projectId: 1 })

export const Task = models.Task || model('Task', TaskSchema);
