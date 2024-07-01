import type { NextFunction, Request, Response } from 'express';
import { DateTime } from 'luxon';
import snakecaseKeys from 'snakecase-keys';
import crypto from 'crypto';
import type {
	CustomError,
	ExpressHandlerError,
	ExpressHandlerSqlError
} from '../types/express-handler.js';

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

		res.header({ 'TiDB-Session': 'TiDB-Session' }).json(snakecaseKeys(errorResBody));
	};

	res.sqlError = (error: ExpressHandlerSqlError, databaseName?: string) => {
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

		// https://github.com/planetscale/database-js/blob/v1.11.0/src/index.ts#L9-L12
		const errorResBody: {
			message: string;
			error: { code: string; message: string };
		} = {
			message: `target: ${databaseName}: vttablet: rpc error: code = ${error.code} desc = ${error.sqlMessage} (errno ${error.errno}) (sqlstate '${error.sqlState}') (CallerID: serverless-mysql-http): Sql: "${error.sql}", BindVars: {REDACTED}`,
			error: {
				code: 'UNKNOWN',
				message: `target: ${databaseName}: vttablet: rpc error: code = ${error.code} desc = ${error.sqlMessage} (errno ${error.errno}) (sqlstate '${error.sqlState}') (CallerID: serverless-mysql-http): Sql: "${error.sql}", BindVars: {REDACTED}`
			}
		};

		res.header({ 'TiDB-Session': 'TiDB-Session' }).json(snakecaseKeys(errorResBody));
	};
	next();
};
