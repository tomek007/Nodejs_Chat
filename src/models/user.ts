import * as mongoose from 'mongoose';

export interface User extends mongoose.Document {
  username: string;
  password: string;
  name: string;
  lastActiveRoom: string;
}

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  lastActiveRoom: {
    type: String,
  },
});

const User = mongoose.model<User>('User', userSchema);

export default User;
