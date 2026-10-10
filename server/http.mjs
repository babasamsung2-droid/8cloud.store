import { createServer } from 'node:http';
import { createRequestHandler } from './request-handler.mjs';
export function createApi(options) { return createServer(createRequestHandler(options)); }
