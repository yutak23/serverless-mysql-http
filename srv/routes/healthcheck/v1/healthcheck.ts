import type { Request, RequestHandler, Response } from 'express';
import express from 'express';
import mysql from 'mysql2/promise';

const router = express.Router();

router.get('', (async (_req: Request, res: Response) => {
	const config = {
		host: process.env['MYSQL_HOST'] || '127.0.0.1',
		port: Number(process.env['MYSQL_PORT']) || 3306,
		user: process.env['MYSQL_USER'] || 'root',
		password: process.env['MYSQL_PASSWORD'] || '',
		database: process.env['MYSQL_DATABASE'] || 'sample_db',
		timezone: 'UTC' // Planetscale timezone is UTC
	};

	try {
		const connection = await mysql.createConnection(config);
		await connection.ping();
		return res.status(200).json({ message: 'OK' });
	} catch (error) {
		return res.status(500).error(error as Error);
	}
}) as RequestHandler);

export default router;
