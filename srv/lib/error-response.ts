import type { NextFunction, Request, Response } from 'express';
import { DateTime } from 'luxon';
import snakecaseKeys from 'snakecase-keys';
import type { ExpressHandlerError } from '../types/express-handler.js';

export default () => (_req: Request, res: Response, next: NextFunction) => {
	res.error = (error: ExpressHandlerError, databaseName?: string) => {
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
			error: { code: string; message: string };
		} = {
			error: {
				code: 'UNKNOWN',
				message: `target: ${databaseName}: vttablet: rpc error: code = ${error.code} desc = ${error.sqlMessage} (errno ${error.errno}) (sqlstate '${error.sqlState}') (CallerID: serverless-mysql-http): Sql: "${error.sql}", BindVars: {REDACTED}`
			}
		};

		res.json(snakecaseKeys(errorResBody));
	};
	next();
};
