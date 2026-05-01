import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IComment extends Document {
  content: string;
  codeSnippet?: string;
  language?: string;
  task: Types.ObjectId;
  author:      string;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    content:     { type: String, required: true, trim: true },
    codeSnippet: { type: String },
    language:    { type: String, default: 'typescript' },
    task:        { type: Schema.Types.ObjectId, ref: 'Task',  required: true },
    author:      { type: Schema.Types.ObjectId, ref: 'user', required: true },
  },
  { timestamps: true }
);

CommentSchema.index({ task: 1, createdAt: 1 });

const Comment: Model<IComment> =
  mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);

export default Comment;
