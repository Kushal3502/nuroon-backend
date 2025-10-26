import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';

const app = express();

// middlewares
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => res.send('💤API is running...'));

// routes
import authRouter from './modules/auth/auth.route';
import chatbotRouter from './modules/chatbot/chatbot.route';

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/chatbot', chatbotRouter);

// app.use(errorMiddleware);

export default app;
