import { beforeAll, describe, expect, it } from 'vitest';
import { Connection, ExecutedQuery, connect } from '@planetscale/database';

const HOST = 'http://localhost:3000';
const config: {
	url?: string;
	username: string;
	password: string;
	host: string;
} = {
	host: 'localhost:3000',
	username: 'root',
	password: ''
};

describe('Planetscale API', () => {
	describe('SELECT only', () => {
		let connection: Connection;
		const headers = ['id', 'name', 'address', 'address_json', 'stars', 'created_at', 'updated_at'];
		const types = {
			id: 'UINT32',
			name: 'VARCHAR',
			address: 'VARCHAR',
			stars: 'FLOAT32',
			created_at: 'DATETIME',
			updated_at: 'TIMESTAMP',
			address_json: 'JSON'
		};
		const fields = [
			{
				name: 'id',
				type: 'UINT32',
				table: 'hotels',
				orgTable: 'hotels',
				database: 'for_vitest',
				orgName: 'id',
				columnLength: 10,
				charset: 63
			},
			{
				name: 'name',
				type: 'VARCHAR',
				table: 'hotels',
				orgTable: 'hotels',
				database: 'for_vitest',
				orgName: 'name',
				columnLength: 256,
				charset: 224
			},
			{
				name: 'address',
				type: 'VARCHAR',
				table: 'hotels',
				orgTable: 'hotels',
				database: 'for_vitest',
				orgName: 'address',
				columnLength: 512,
				charset: 224
			},
			{
				name: 'address_json',
				type: 'JSON',
				table: 'hotels',
				orgTable: 'hotels',
				database: 'for_vitest',
				orgName: 'address_json',
				columnLength: 4294967295,
				charset: 63
			},
			{
				name: 'stars',
				type: 'FLOAT32',
				table: 'hotels',
				orgTable: 'hotels',
				database: 'for_vitest',
				orgName: 'stars',
				columnLength: 12,
				charset: 63
			},
			{
				name: 'created_at',
				type: 'DATETIME',
				table: 'hotels',
				orgTable: 'hotels',
				database: 'for_vitest',
				orgName: 'created_at',
				columnLength: 19,
				charset: 63
			},
			{
				name: 'updated_at',
				type: 'TIMESTAMP',
				table: 'hotels',
				orgTable: 'hotels',
				database: 'for_vitest',
				orgName: 'updated_at',
				columnLength: 19,
				charset: 63
			}
		];

		beforeAll(() => {
			config.url = HOST;
			connection = connect(config);
		});

		it('SELECT * FROM hotels ORDER BY `id` ASC LIMIT 1;', async () => {
			const results: ExecutedQuery = await connection.execute(
				'SELECT * FROM hotels ORDER BY `id` ASC LIMIT 1;'
			);

			expect(results.headers).toEqual(headers);
			expect(results.types).toEqual(types);
			expect(results.rows).toEqual([
				{
					id: 1,
					name: '日本ホテル',
					address: '東京都千代田区1-1',
					stars: 4.2,
					created_at: '2023-11-20 02:53:56',
					updated_at: '2023-11-20 02:53:56',
					address_json: {
						area: {
							area: { area: '内幸町1-1-1', city: '千代田区', prefecture: '東京都' },
							city: '千代田区',
							prefecture: '東京都'
						},
						city: '千代田区',
						prefecture: '東京都'
					}
				}
			]);
			expect(results.fields).toEqual(fields);
			expect(results.size).toBe(1);
			expect(results.statement).toBe('SELECT * FROM hotels ORDER BY `id` ASC LIMIT 1;');
			expect(results.insertId).toBe('0');
			expect(results.rowsAffected).toBe(0);
			expect(results.time).toEqual(expect.any(Number));
		});

		it('SELECT * FROM hotels ORDER BY `id` ASC LIMIT 2;', async () => {
			const results: ExecutedQuery = await connection.execute(
				'SELECT * FROM hotels ORDER BY `id` ASC LIMIT 2;'
			);

			expect(results.headers).toEqual(headers);
			expect(results.types).toEqual(types);
			expect(results.fields).toEqual(fields);
			expect(results.rows).toEqual([
				{
					id: 1,
					name: '日本ホテル',
					address: '東京都千代田区1-1',
					stars: 4.2,
					created_at: '2023-11-20 02:53:56',
					updated_at: '2023-11-20 02:53:56',
					address_json: {
						area: {
							area: { area: '内幸町1-1-1', city: '千代田区', prefecture: '東京都' },
							city: '千代田区',
							prefecture: '東京都'
						},
						city: '千代田区',
						prefecture: '東京都'
					}
				},
				{
					id: 2,
					name: 'Japan HOTEL',
					address: '1-1, Chiyoda-ku, Tokyo',
					stars: 4.3,
					address_json: null,
					created_at: '2023-11-20 04:06:46',
					updated_at: '2023-11-20 04:06:46'
				}
			]);
			expect(results.size).toBe(2);
			expect(results.statement).toBe('SELECT * FROM hotels ORDER BY `id` ASC LIMIT 2;');
			expect(results.insertId).toBe('0');
			expect(results.rowsAffected).toBe(0);
			expect(results.time).toEqual(expect.any(Number));
		});
	});
});
