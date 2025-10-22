import dotenv from 'dotenv';
import app from './app';
import { connectDb } from './config/db';

dotenv.config();

const PORT = process.env.PORT || 5000;

connectDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port :: ${PORT}`);
    });
  })
  .catch(error => {
    console.error('Error connecting to DB :: ', error);
  });
