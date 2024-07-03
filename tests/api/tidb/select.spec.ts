/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { beforeAll, describe, expect, it } from 'vitest';
import { Connection, FullResult, Row, connect } from '@tidbcloud/serverless';
import { Agent, setGlobalDispatcher } from 'undici';

const agent: Agent = new Agent({
	connect: {
		rejectUnauthorized: false
	}
});

setGlobalDispatcher(agent);

const types = {
	id: 'UNSIGNED INT',
	name: 'VARCHAR',
	address: 'VARCHAR',
	address_json: 'JSON',
	stars: 'FLOAT',
	created_at: 'DATETIME',
	updated_at: 'TIMESTAMP'
};
const petTypes = {
	name: 'VARCHAR',
	birth: 'DATE',
	'CURDATE()': 'DATE',
	age: 'BIGINT'
};

describe('TiDB API', () => {
	let connection: Connection;

	beforeAll(() => {
		connection = connect({
			username: 'root',
			password: 'password',
			host: 'localhost:3443',
			database: 'sample_db'
		});
	});

	describe('basic SELECT', () => {
		it('SELECT * FROM hotels ORDER BY `id` ASC LIMIT 1;', async () => {
			const results: Row[] = (await connection.execute(
				'SELECT * FROM hotels ORDER BY `id` ASC LIMIT 1;'
			)) as Row[];

			expect(results).toEqual([
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
		});

		it('SELECT * FROM hotels ORDER BY `id` ASC LIMIT 1; with fullResult', async () => {
			const results: FullResult = (await connection.execute(
				'SELECT * FROM hotels ORDER BY `id` ASC LIMIT 1;',
				[],
				{ fullResult: true }
			)) as FullResult;

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
			expect(results.statement).toBe('SELECT * FROM hotels ORDER BY `id` ASC LIMIT 1;');
			expect(results.rowsAffected).toBe(0);
			expect(results.lastInsertId).toBe(null);
			expect(results.rowCount).toBe(1);
		});

		it('SELECT * FROM hotels ORDER BY `id` ASC LIMIT 2;', async () => {
			const results: FullResult = (await connection.execute(
				'SELECT * FROM hotels ORDER BY `id` ASC LIMIT 2;',
				[],
				{ fullResult: true }
			)) as FullResult;

			const resultRows = results.rows as Row[];

			expect(results.types).toEqual(types);
			expect(resultRows[0]).toHaveProperty('id', 1);
			expect(resultRows[0]).toHaveProperty('name', '日本ホテル');
			expect(resultRows[0]).toHaveProperty('address', '東京都千代田区1-1');
			expect(resultRows[0]).toHaveProperty('stars', 4.2);
			expect(resultRows[0]).toHaveProperty('created_at', '2023-11-20 02:53:56');
			expect(resultRows[0]).toHaveProperty('updated_at', expect.any(String));
			expect(resultRows[0]).toHaveProperty('address_json.area.area.area', '内幸町1-1-1');
			expect(resultRows[0]).toHaveProperty('address_json.area.area.city', '千代田区');
			expect(resultRows[0]).toHaveProperty('address_json.area.area.prefecture', '東京都');
			expect(resultRows[0]).toHaveProperty('address_json.area.city', '千代田区');
			expect(resultRows[0]).toHaveProperty('address_json.area.prefecture', '東京都');
			expect(resultRows[0]).toHaveProperty('address_json.city', '千代田区');
			expect(resultRows[0]).toHaveProperty('address_json.prefecture', '東京都');

			expect(resultRows[1]).toHaveProperty('id', 2);
			expect(resultRows[1]).toHaveProperty('name', 'Japan HOTEL');
			expect(resultRows[1]).toHaveProperty('address', '1-1, Chiyoda-ku, Tokyo');
			expect(resultRows[1]).toHaveProperty('stars', 4.3);
			expect(resultRows[1]).toHaveProperty('address_json', null);
			expect(resultRows[1]).toHaveProperty('created_at', '2023-11-20 04:06:46');
			expect(resultRows[1]).toHaveProperty('updated_at', expect.any(String));

			expect(results.statement).toBe('SELECT * FROM hotels ORDER BY `id` ASC LIMIT 2;');
			expect(results.rowsAffected).toBe(0);
			expect(results.lastInsertId).toBe(null);
			expect(results.rowCount).toBe(2);
		});

		it('result rows is 0 : SELECT * FROM hotels WHERE id = 1000;', async () => {
			const results: FullResult = (await connection.execute(
				'SELECT * FROM hotels WHERE id = ?;',
				[1000],
				{ fullResult: true }
			)) as FullResult;

			expect(results.types).toEqual(types);
			expect(results.rows).toEqual([]);
			expect(results.statement).toEqual(expect.any(String));
			expect(results.rowsAffected).toBe(0);
			expect(results.lastInsertId).toBe(null);
			expect(results.rowCount).toBe(0);
		});
	});

	describe('SELECT with MySQL function', () => {
		it.skip('SELECT COUNT(`id`) FROM hotels;', async () => {
			const results: FullResult = (await connection.execute('SELECT COUNT(`id`) FROM hotels;', [], {
				fullResult: true
			})) as FullResult;

			const resultRows = results.rows as Row[];

			const count = Number(resultRows[0]['COUNT(`id`)']);

			expect(results.types).toEqual({ 'COUNT(`id`)': 'BIGINT' });
			expect(results.rows).toEqual([{ 'COUNT(`id`)': `${count}` }]);
			expect(results.statement).toBe('SELECT COUNT(`id`) FROM hotels;');
			expect(results.rowsAffected).toBe(0);
			expect(results.lastInsertId).toBe(null);
			expect(results.rowCount).toBe(1);
		});

		// https://dev.mysql.com/doc/refman/8.0/en/date-calculations.html
		it('SELECT name, birth, CURDATE(), TIMESTAMPDIFF(YEAR,birth,CURDATE()) AS age FROM pet;', async () => {
			const results: FullResult = (await connection.execute(
				'SELECT name, birth, CURDATE(), TIMESTAMPDIFF(YEAR,birth,CURDATE()) AS age FROM pet;',
				[],
				{
					fullResult: true
				}
			)) as FullResult;

			expect(results.types).toEqual(petTypes);
			expect(results.rows).toEqual([
				{
					name: 'Fluffy',
					birth: '1993-02-04',
					'CURDATE()': expect.any(String),
					age: '31'
				},
				{
					name: 'Claws',
					birth: '1994-03-17',
					'CURDATE()': expect.any(String),
					age: '30'
				},
				{
					name: 'Buffy',
					birth: '1989-05-13',
					'CURDATE()': expect.any(String),
					age: '35'
				},
				{
					name: 'Fang',
					birth: '1990-08-27',
					'CURDATE()': expect.any(String),
					age: '33'
				},
				{
					name: 'Bowser',
					birth: '1979-08-31',
					'CURDATE()': expect.any(String),
					age: '44'
				},
				{
					name: 'Chirpy',
					birth: '1998-09-11',
					'CURDATE()': expect.any(String),
					age: '25'
				},
				{
					name: 'Whistler',
					birth: '1997-12-09',
					'CURDATE()': expect.any(String),
					age: '26'
				},
				{
					name: 'Slim',
					birth: '1996-04-29',
					'CURDATE()': expect.any(String),
					age: '28'
				},
				{
					name: 'Puffball',
					birth: '1999-03-30',
					'CURDATE()': expect.any(String),
					age: '25'
				}
			]);
			expect(results.statement).toEqual(expect.any(String));
			expect(results.rowsAffected).toBe(0);
			expect(results.lastInsertId).toBe(null);
			expect(results.rowCount).toBe(9);
		});
	});
});
