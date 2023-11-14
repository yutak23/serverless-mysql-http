import type { NextFunction, Request, Response } from 'express';
import { DateTime } from 'luxon';
import crypto from 'crypto';
import snakecaseKeys from 'snakecase-keys';
import type { ExpressHandlerError, CustomError } from '../types/express-error-handler.js';

export default () => (req: Request, res: Response, next: NextFunction) => {
	res.error = (error: ExpressHandlerError, seed?: string) => {
		console.error(
			JSON.stringify(
				{
					time: DateTime.now().toISO(),
					error: {
						message: error.message,
						stack: error.stack,
						status: error.status || null
					}
				},
				null
			)
		);

		if (error.status) res.status(error.status);
		if (!res.statusCode) res.status(500);
		// for Sequelize Errors
		if (error.name === 'SequelizeUniqueConstraintError') res.status(409);

		const code = crypto
			.createHash('md5')
			.update(
				[req.method.toUpperCase(), req.baseUrl, res.statusCode, seed || error?.seed].join(':')
			)
			.digest('hex');

		const errorResBody: {
			statusCode: number;
			code: string;
			path: string;
			message: string;
			errors: Array<{ message: string }>;
		} = {
			statusCode: res.statusCode,
			code,
			path: `${req.method}:${req.originalUrl}`,
			message: error.message,
			errors: []
		};
		if (error.errors && Array.isArray(error.errors))
			error.errors.forEach((e: CustomError) => {
				const messages = [];
				if (e.path) messages.push(e.path);
				messages.push(e.message);
				errorResBody.errors.push({ message: messages.join(' : ') });
			});
		if (!errorResBody.errors.length) errorResBody.errors.push({ message: error.message });

		res.json(snakecaseKeys(errorResBody));
	};
	next();
};
