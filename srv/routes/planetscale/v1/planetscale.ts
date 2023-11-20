import type { Request, RequestHandler, Response } from 'express';
import express from 'express';
import mysql from 'mysql2/promise';
import { DateTime } from 'luxon';
import type {
	PlanetscaleBody,
	ExtendedFieldPacket,
	QueryResultFieldExcerpt,
	ResultSetHeader,
	ExpressHandlerError
} from '../../../types/express-handler.js';
import fieldsConverter, { SqlDefinition } from '../../../lib/fields-converter.js';
import encodeRow from '../../../lib/encode-row.js';
import { generateCountQuery } from '../../../lib/utils.js';

const router = express.Router();

router.post('/Execute', (async (req: Request<object, object, PlanetscaleBody>, res: Response) => {
	const config = {
		host: process.env['MYSQL_HOST'] || '127.0.0.1',
		port: Number(process.env['MYSQL_PORT']) || 3306,
		user: process.env['MYSQL_USER'] || 'root',
		password: process.env['MYSQL_PASSWORD'] || '',
		database: process.env['MYSQL_DATABASE'] || 'for_vitest',
		timezone: 'UTC' // Planetscale timezone is UTC
	};
	const { query } = req.body;
	const regex = /delete\s+from/i;

	try {
		const connection = await mysql.createConnection(config);
		const isDeleteQuery = regex.test(query);

		let deletedAffectedRows;
		if (isDeleteQuery) {
			const countQuery = generateCountQuery(query);
			const countResult = await connection.query(countQuery);
			const rows = countResult[0] as Record<string, unknown>[];
			deletedAffectedRows = rows[0]?.['count'];
		}

		const start = DateTime.now();

		const queryResult = await connection.query(query);
		const rows = queryResult[0] as Record<string, unknown>[];
		const originalFields = queryResult[1] as ExtendedFieldPacket[];

		const timing = DateTime.now().diff(start, 'milliseconds').milliseconds;

		if (!originalFields) {
			const result = queryResult[0] as ResultSetHeader;
			return res.status(200).json({
				result: {
					rowsAffected: isDeleteQuery
						? deletedAffectedRows // Planetscale returns for DELETE
						: result.affectedRows.toString(),
					insertId: result.insertId.toString()
				}
				// session,
				// error
			});
		}

		const tableName = originalFields[0]?.table as string;

		let sqlDefinitions: SqlDefinition[] = [];
		if (tableName) {
			const describeResults = await connection.query(`DESCRIBE ${tableName}`);
			sqlDefinitions = describeResults[0] as SqlDefinition[];
		}

		const fields: QueryResultFieldExcerpt[] = originalFields.map((field) => ({
			name: field.name,
			table: field.table,
			orgTable: field.orgTable,
			database: config.database,
			columnLength: field.columnLength,
			charset: field.characterSet,
			flags: field.flags,
			type: field.type
		}));

		const fieldsConverted = fieldsConverter(sqlDefinitions, fields, config.database, tableName);

		return res.status(200).json({
			result: {
				rows: rows.map((row) => encodeRow(row, fieldsConverted)),
				fields: fieldsConverted,
				rowsAffected: null,
				insertId: null
			},
			// session,
			// error
			timing
		});
	} catch (error) {
		console.error(error);

		if ((error as ExpressHandlerError).sqlState)
			return res.status(200).error(error as Error, config.database);
		return res.status(500).error(error as Error, config.database);
	}
}) as RequestHandler);

export default router;
