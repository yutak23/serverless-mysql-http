import type { Application, Request, Response, NextFunction } from 'express';
import { strict as assert } from 'assert';
import type { ExpressHandlerError } from '../../types/express-error-handler.js';

import planetscale from './v1/planetscale.js';

const BASE_V1_API_PATH = `/api/v1/planetscale`;

export default (options: { app?: Application } = {}) => {
	assert.ok(options.app, 'app must be required');
	const { app } = options;

	app.use(`${BASE_V1_API_PATH}`, planetscale);

	// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
	app.use((err: ExpressHandlerError, _req: Request, res: Response, _next: NextFunction) => {
		res.status(err?.status || 500).error(err);
	});
};
