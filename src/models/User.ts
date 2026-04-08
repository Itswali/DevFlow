import { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
  name: {type: String, required: true},
  email: {type: String, required: true, unique: true},
  role: {type: String,
    enum: ['admin', 'member'],
    default: 'member'
  },
  createdAt: {type: Date, default: Date.now },
});

export const User = models.User || model("User", UserSchema);
