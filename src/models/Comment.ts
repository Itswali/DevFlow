import mongoose, { Schema, model, models } from 'mongoose';

const CommentSchema = new Schema({
  taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  codeSnippet: { type: String }, // Optional field for the "Code Review" feature
  language: { type: String, default: 'typescript' },
}, { timestamps: true });

export const Comment = models.Comment || model('Comment', CommentSchema);
