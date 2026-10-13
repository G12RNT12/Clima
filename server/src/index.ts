import dotenv from 'dotenv';
import { createApp } from './app.js';

dotenv.config();

const port = Number(process.env.PORT) || 3001;
const app = createApp();

app.listen(port, () => {
  console.info(`🚀 Servidor meteorológico activo en http://localhost:${port}/api/health`);
});
