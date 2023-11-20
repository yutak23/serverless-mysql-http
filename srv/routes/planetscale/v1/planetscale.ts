import type { Request, RequestHandler, Response } from 'express';
import express from 'express';
import mysql from 'mysql2/promise';
import { DateTime } from 'luxon';
import type {
	PlanetscaleBody,
	ExtendedFieldPacket,
	QueryResultFieldExcerpt
} from '../../../types/express-handler.js';
import fieldsCconverter, { SqlDefinition } from '../../../lib/fields-converter.js';
import encodeRow from '../../../lib/encode-row.js';

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

	try {
		const connection = await mysql.createConnection(config);

		const start = DateTime.now();

		const queryResult = await connection.query(query);
		const rows = queryResult[0] as Record<string, unknown>[];
		const originalFields = queryResult[1] as ExtendedFieldPacket[];

		const tableName = originalFields[0]?.table as string;
		const [tableDescribe] = await connection.query(`DESCRIBE ${tableName}`);

		const timing = DateTime.now().diff(start, 'milliseconds').milliseconds;
		const fields: QueryResultFieldExcerpt[] = originalFields.map((field) => ({
			name: field.name,
			table: field.table,
			orgTable: field.orgTable,
			database: config.database,
			columnLength: field.columnLength,
			charset: field.characterSet,
			flags: field.flags
		}));

		const fieldsConverted = fieldsCconverter(
			tableDescribe as SqlDefinition[],
			fields,
			config.database,
			tableName
		);

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
		return res.status(500).error(error as Error);
	}
}) as RequestHandler);

export default router;
