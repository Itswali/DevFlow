import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const UserSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true },
    email:    { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['admin', 'manager', 'user'],
      default: 'user'
    },
  },
  { timestamps: true }
)

UserSchema.pre('save', async function () {
  if(this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;
