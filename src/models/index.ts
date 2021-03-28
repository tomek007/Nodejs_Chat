import mongoose from 'mongoose';

import { DB_ADDRESS, DB_NAME, DB_PORT } from '../config/db';

const connectToMongoose = async (): Promise<void> => {
  const url = `mongodb://${DB_ADDRESS}:${DB_PORT}/${DB_NAME}`;

  await mongoose.connect(url, { useNewUrlParser: true });
};

export { connectToMongoose };

export default {
  connectToMongoose,
};
