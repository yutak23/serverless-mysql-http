import type { Request, RequestHandler, Response } from 'express';
import express from 'express';
import mysql, { FieldPacket } from 'mysql2/promise';
import { DateTime } from 'luxon';
import type {
	PlanetscaleBody,
	ResultSetHeader,
	ExpressHandlerError,
	ExpressHandlerSqlError
} from '../../../types/express-handler.js';
import { SqlDefinition, converterForTidb } from '../../../lib/fields-converter.js';
import { generateCountQuery } from '../../../lib/utils.js';

const router = express.Router();

router.post('/', (async (req: Request<object, object, PlanetscaleBody>, res: Response) => {
	const config = {
		host: process.env['MYSQL_HOST'] || '127.0.0.1',
		port: Number(process.env['MYSQL_PORT']) || 3306,
		user: process.env['MYSQL_USER'] || 'root',
		password: process.env['MYSQL_PASSWORD'] || '',
		database: process.env['MYSQL_DATABASE'] || 'sample_db',
		timezone: 'Z' // TiDB default timezone is UTC https://github.com/sidorares/node-mysql2/blob/v3.6.5/lib/connection_config.js#L133
	};
	const { query } = req.body;
	const deleteRegex = /delete\s+from/i;

	let connection;
	try {
		connection = await mysql.createConnection(config);
		const isDeleteQuery = deleteRegex.test(query);

		let deletedAffectedRows;
		if (isDeleteQuery) {
			const countQuery = generateCountQuery(query);
			const countResult = await connection.query(countQuery);
			const rows = countResult[0] as Record<string, unknown>[];
			deletedAffectedRows = rows[0]?.['count'];
		}

		const queryResult = await connection.query(query);
		const rows = queryResult[0] as Record<string, unknown>[];
		const originalFields: FieldPacket[] = queryResult[1];

		if (!originalFields) {
			const result = queryResult[0] as ResultSetHeader;
			return res.status(200).json({
				result: {
					rowsAffected: isDeleteQuery
						? deletedAffectedRows // Planetscale returns for DELETE
						: result.affectedRows.toString(),
					insertId: result.insertId.toString()
				}
			});
		}

		const tableName = originalFields[0]?.table as string;

		let sqlDefinitions: SqlDefinition[] = [];
		if (tableName) {
			const describeResults = await connection.query(`DESCRIBE ${tableName}`);
			sqlDefinitions = describeResults[0] as SqlDefinition[];
		}

		const types = converterForTidb(sqlDefinitions, originalFields);

		const convertedRows = rows.map((row) => {
			const converted = { ...row };

			Object.keys(row).forEach((key) => {
				if (typeof converted[key] === 'number' && Number.isFinite(converted[key]))
					converted[key] = (converted[key] as number).toString();

				const columnType = types.find((type) => type.name === key);
				if (!columnType) return;

				if (columnType.type === 'JSON') converted[key] = JSON.stringify(row[key]);
				if (columnType.type === 'DATE')
					converted[key] = DateTime.fromJSDate(new Date(row[key] as string))
						.setZone('utc') // Database timezon is UTC
						.toFormat('yyyy-MM-dd');
				if (columnType.type === 'DATETIME' || columnType.type === 'TIMESTAMP')
					converted[key] = DateTime.fromJSDate(new Date(row[key] as string))
						.setZone('utc') // Database timezon is UTC
						.toFormat('yyyy-MM-dd hh:mm:ss');
			});

			return converted;
		});

		return res
			.status(200)
			.header({ 'TiDB-Session': 'TiDB-Session' })
			.json({
				types,
				rows: convertedRows.map((row) => Object.values(row))
			});
	} catch (error) {
		console.error(error);

		if ((error as ExpressHandlerSqlError).sqlState)
			return res.status(200).sqlError(error as ExpressHandlerSqlError, config.database);
		return res.status(500).error(error as ExpressHandlerError, config.database);
	} finally {
		if (connection) await connection.end();
	}
}) as RequestHandler);

export default router;
