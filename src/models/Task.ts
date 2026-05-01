import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type TaskStatus   = 'backlog' | 'todo' | 'in-progress' | 'in-review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface ITask extends Document {
  title:        string;
  description?: string;
  status:       TaskStatus;
  priority:     TaskPriority;
  tags:         string[];
  project:      Types.ObjectId;
  assignee?:    Types.ObjectId;
  createdBy:    Types.ObjectId;
  dueDate?:     Date;
  order:        number;
  createdAt:    Date;
  updatedAt:    Date;
}

const TaskSchema = new Schema<ITask>(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: {
      type:    String,
      enum:    ['backlog', 'todo', 'in-progress', 'in-review', 'done'],
      default: 'todo',
    },
    priority: {
      type:    String,
      enum:    ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    tags:      [{ type: String, trim: true }],
    project:   { type: Schema.Types.ObjectId, ref: 'Project',  required: true },
    assignee:  { type: Schema.Types.ObjectId, ref: 'user' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'user',     required: true },
    dueDate:   { type: Date },
    order:     { type: Number, default: 0 },
  },
  { timestamps: true },
);

TaskSchema.index({ project: 1, status: 1, order: 1 });

const Task: Model<ITask> =
  mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);

export default Task;
