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
const petTypes = {
	name: 'VARCHAR',
	birth: 'DATE',
	'curdate()': 'DATE',
	age: 'INT64'
};
const petFields = [
	{
		name: 'name',
		type: 'VARCHAR',
		table: 'pet',
		orgTable: 'pet',
		database: 'sample_db',
		orgName: 'name',
		columnLength: 80,
		charset: 224
	},
	{
		name: 'birth',
		type: 'DATE',
		table: 'pet',
		orgTable: 'pet',
		database: 'sample_db',
		orgName: 'birth',
		columnLength: 10,
		charset: 63
	},
	{
		name: 'curdate()',
		type: 'DATE',
		table: 'pet',
		orgTable: 'pet',
		database: 'sample_db',
		orgName: 'curdate()',
		columnLength: 10,
		charset: 63
	},
	{
		name: 'age',
		type: 'INT64',
		table: 'pet',
		orgTable: 'pet',
		database: 'sample_db',
		orgName: 'age',
		columnLength: 21,
		charset: 63
	}
];

describe('Planetscale API', () => {
	let connection: Connection;

	beforeAll(() => {
		config.url = HOST;
		connection = connect(config);
	});

	describe('basic SELECT', () => {
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
				},
				{
					id: 2,
					name: 'Japan HOTEL',
					address: '1-1, Chiyoda-ku, Tokyo',
					stars: 4.3,
					address_json: null,
					created_at: '2023-11-20 04:06:46',
					updated_at: expect.any(String)
				}
			]);
			expect(results.size).toBe(2);
			expect(results.statement).toBe('SELECT * FROM hotels ORDER BY `id` ASC LIMIT 2;');
			expect(results.insertId).toBe('0');
			expect(results.rowsAffected).toBe(0);
			expect(results.time).toEqual(expect.any(Number));
		});

		it('result rows is 0 : SELECT * FROM hotels WHERE id = 1000;', async () => {
			const results: ExecutedQuery = await connection.execute(
				'SELECT * FROM hotels WHERE id = ?;',
				[42]
			);

			expect(results.headers).toEqual(headers);
			expect(results.types).toEqual(types);
			expect(results.fields).toEqual(fields);
			expect(results.rows).toEqual([]);
			expect(results.size).toBe(0);
			expect(results.statement).toEqual(expect.any(String));
			expect(results.insertId).toBe('0');
			expect(results.rowsAffected).toBe(0);
			expect(results.time).toEqual(expect.any(Number));
		});
	});

	describe('SELECT with MySQL function', () => {
		it('SELECT COUNT(`id`) FROM hotels;', async () => {
			const results: ExecutedQuery = await connection.execute('SELECT COUNT(`id`) FROM hotels;');
			const count = Number(results.rows[0]['count(id)']);

			expect(results.headers).toEqual(['count(id)']);
			expect(results.types).toEqual({ 'count(id)': 'INT64' });
			expect(results.fields).toHaveProperty('[0].name', 'count(id)');
			expect(results.fields).toHaveProperty('[0].type', 'INT64');
			expect(results.fields).toHaveProperty('[0].columnLength', 21);
			expect(results.fields).toHaveProperty('[0].charset', 63);
			expect(results.rows).toEqual([{ 'count(id)': `${count}` }]);
			expect(results.size).toBe(1);
			expect(results.statement).toBe('SELECT COUNT(`id`) FROM hotels;');
			expect(results.insertId).toBe('0');
			expect(results.rowsAffected).toBe(0);
			expect(results.time).toEqual(expect.any(Number));
		});

		// https://dev.mysql.com/doc/refman/8.0/en/date-calculations.html
		it('SELECT name, birth, CURDATE(), TIMESTAMPDIFF(YEAR,birth,CURDATE()) AS age FROM pet;', async () => {
			const results: ExecutedQuery = await connection.execute(
				'SELECT name, birth, CURDATE(), TIMESTAMPDIFF(YEAR,birth,CURDATE()) AS age FROM pet;'
			);

			expect(results.headers).toEqual(['name', 'birth', 'curdate()', 'age']);
			expect(results.types).toEqual(petTypes);
			expect(results.fields).toEqual(petFields);
			expect(results.rows).toEqual([
				{
					name: 'Fluffy',
					birth: '1993-02-04',
					'curdate()': expect.any(String),
					age: '30'
				},
				{
					name: 'Claws',
					birth: '1994-03-17',
					'curdate()': expect.any(String),
					age: '29'
				},
				{
					name: 'Buffy',
					birth: '1989-05-13',
					'curdate()': expect.any(String),
					age: '34'
				},
				{
					name: 'Fang',
					birth: '1990-08-27',
					'curdate()': expect.any(String),
					age: '33'
				},
				{
					name: 'Bowser',
					birth: '1979-08-31',
					'curdate()': expect.any(String),
					age: '44'
				},
				{
					name: 'Chirpy',
					birth: '1998-09-11',
					'curdate()': expect.any(String),
					age: '25'
				},
				{
					name: 'Whistler',
					birth: '1997-12-09',
					'curdate()': expect.any(String),
					age: '25'
				},
				{
					name: 'Slim',
					birth: '1996-04-29',
					'curdate()': expect.any(String),
					age: '27'
				},
				{
					name: 'Puffball',
					birth: '1999-03-30',
					'curdate()': expect.any(String),
					age: '24'
				}
			]);
			expect(results.size).toBe(9);
			expect(results.statement).toEqual(expect.any(String));
			expect(results.insertId).toBe('0');
			expect(results.rowsAffected).toBe(0);
			expect(results.time).toEqual(expect.any(Number));
		});
	});
});
