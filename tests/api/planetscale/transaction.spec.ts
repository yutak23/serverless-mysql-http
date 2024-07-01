/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
		database: 'sample_db',
		orgName: 'id',
		columnLength: 10,
		charset: 63
	},
	{
		name: 'name',
		type: 'VARCHAR',
		table: 'hotels',
		orgTable: 'hotels',
		database: 'sample_db',
		orgName: 'name',
		columnLength: 256,
		charset: 224
	},
	{
		name: 'address',
		type: 'VARCHAR',
		table: 'hotels',
		orgTable: 'hotels',
		database: 'sample_db',
		orgName: 'address',
		columnLength: 512,
		charset: 224
	},
	{
		name: 'address_json',
		type: 'JSON',
		table: 'hotels',
		orgTable: 'hotels',
		database: 'sample_db',
		orgName: 'address_json',
		columnLength: 4294967295,
		charset: 63
	},
	{
		name: 'stars',
		type: 'FLOAT32',
		table: 'hotels',
		orgTable: 'hotels',
		database: 'sample_db',
		orgName: 'stars',
		columnLength: 12,
		charset: 63
	},
	{
		name: 'created_at',
		type: 'DATETIME',
		table: 'hotels',
		orgTable: 'hotels',
		database: 'sample_db',
		orgName: 'created_at',
		columnLength: 19,
		charset: 63
	},
	{
		name: 'updated_at',
		type: 'TIMESTAMP',
		table: 'hotels',
		orgTable: 'hotels',
		database: 'sample_db',
		orgName: 'updated_at',
		columnLength: 19,
		charset: 63
	}
];

describe('Planetscale API', () => {
	let connection: Connection;

	beforeAll(() => {
		config.url = HOST;
		connection = connect(config);
	});

	describe('SELECT with transaction and lock', () => {
		describe('SELECT FOR UPDATE', () => {
			it("SELECT * FROM hotels WHERE id = 1 FOR UPDATE; and UPDATE hotels SET address = '北海道札幌市1-1' WHERE id = 1;", async () => {
				const results: ExecutedQuery[] = await connection.transaction(async (tx) => {
					const selectHotels = await tx.execute('SELECT * FROM hotels WHERE id = :id FOR UPDATE;', {
						id: 1
					});
					const updateHotels = await tx.execute(
						`UPDATE hotels SET address = '北海道札幌市1-1' WHERE id = ?;`,
						[1]
					);
					return [selectHotels, updateHotels];
				});

				expect(results[0].headers).toEqual(headers);
				expect(results[0].types).toEqual(types);
				expect(results[0].fields).toEqual(fields);
				expect(results[0].rows).toEqual([
					{
						id: 1,
						name: '日本ホテル',
						address: '東京都千代田区1-1',
						stars: 4.2,
						created_at: expect.any(String),
						updated_at: expect.any(String),
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
				expect(results[0].size).toBe(1);
				expect(results[0].statement).toBe(`SELECT * FROM hotels WHERE id = 1 FOR UPDATE;`);
				expect(results[0].insertId).toBe('0');
				expect(results[0].rowsAffected).toBe(0);
				expect(results[0].time).toEqual(expect.any(Number));

				expect(results[1].headers).toEqual([]);
				expect(results[1].types).toEqual({});
				expect(results[1].fields).toEqual([]);
				expect(results[1].rows).toEqual([]);
				expect(results[1].size).toBe(0);
				expect(results[1].statement).toBe(
					`UPDATE hotels SET address = '北海道札幌市1-1' WHERE id = 1;`
				);
				expect(results[1].insertId).toBe('0');
				expect(results[1].rowsAffected).toBe(1);
				expect(results[1].time).toEqual(expect.any(Number));
			});
		});

		describe('Confirm result', () => {
			it('SELECT * FROM hotels WHERE id = 1;', async () => {
				const results: ExecutedQuery = await connection.execute(
					'SELECT * FROM hotels WHERE id = ?;',
					[1]
				);
				expect(results.rows).toHaveProperty('[0].address', '北海道札幌市1-1');
			});
		});

		describe('Terndown', () => {
			it('UPDATE hotels SET  WHERE id = 1;', async () => {
				const results: ExecutedQuery = await connection.execute(
					`UPDATE hotels SET address = '東京都千代田区1-1' WHERE id = ?;`,
					[1]
				);
				expect(results.rowsAffected).toBe(1);
			});

			it('SELECT * FROM hotels WHERE id = 1;', async () => {
				const results: ExecutedQuery = await connection.execute(
					'SELECT * FROM hotels WHERE id = ?;',
					[1]
				);
				expect(results.rows).toHaveProperty('[0].address', '東京都千代田区1-1');
			});
		});
	});
});
