import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IComment extends Document {
  content: string;
  codeSnippet?: string;
  language?: string;
  task: Types.ObjectId;
  author: Types.ObjectId; // Updated from string to Types.ObjectId
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    content:     { type: String, required: true, trim: true },
    codeSnippet: { type: String },
    language:    { type: String, default: 'typescript' },
    task:        { type: Schema.Types.ObjectId, ref: 'Task', required: true },
    // Cast to any here to prevent the generic type mismatch in strict mode
    author:      { type: Schema.Types.ObjectId as any, ref: 'User', required: true },
  },
  { timestamps: true }
);

CommentSchema.index({ task: 1, createdAt: 1 });

const Comment: Model<IComment> =
  mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);

export default Comment;
