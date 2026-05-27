import express from 'express';
import cors from 'cors';
import songsRouter from './routes/songs.route';
import { getDb } from './db/database';

const app = express();

app.use(cors());
app.use(express.json());

// DB 초기화
getDb();

app.use('/songs', songsRouter);

export default app;
