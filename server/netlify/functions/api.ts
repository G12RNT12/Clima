import serverless from 'serverless-http';
import { createApp } from '../../src/app.js';

// Requests use the same origin as the published frontend.
process.env.ALLOWED_ORIGIN ??= process.env.URL;

export const handler = serverless(createApp());
