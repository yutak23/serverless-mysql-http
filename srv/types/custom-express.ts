import type { ExpressHandlerError } from './express-handler.js';

declare module 'express-serve-static-core' {
	interface Response {
		error: (err: ExpressHandlerError, databaseName?: string) => void;
	}
}
