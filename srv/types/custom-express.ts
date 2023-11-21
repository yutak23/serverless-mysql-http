import type { ExpressHandlerError, ExpressHandlerSqlError } from './express-handler.js';

declare module 'express-serve-static-core' {
	interface Response {
		sqlError: (err: ExpressHandlerSqlError, databaseName?: string) => void;
		error: (err: ExpressHandlerError, databaseName?: string) => void;
	}
}
