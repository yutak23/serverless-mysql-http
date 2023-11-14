import type { ExpressHandlerError } from './express-error-handler.js';

declare module 'express-serve-static-core' {
	interface Response {
		error: (err: ExpressHandlerError) => void;
	}
}
