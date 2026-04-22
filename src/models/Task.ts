import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type TaskStatus = "todo" | "in-progress" | "in-review" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface ITask extends Document {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  project: Types.ObjectId;
  assignee?: Types.ObjectId;
  createdBy: Types.ObjectId;
  dueDate?: Date;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: {
      type: String,
      enum: ["todo", "in-progress", "in-review", "done"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    assignee: { type: Schema.Types.ObjectId, ref: "user" }, // 👈 lowercase
    createdBy: { type: Schema.Types.ObjectId, ref: "user", required: true }, // 👈 lowercase
    dueDate: { type: Date },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// Fast Kanban queries
TaskSchema.index({ project: 1, status: 1, order: 1 });

const Task: Model<ITask> =
  mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);

export default Task;
