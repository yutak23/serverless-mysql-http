/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { beforeAll, describe, expect, it } from 'vitest';
import { Connection, FullResult, connect } from '@tidbcloud/serverless';
import { Agent, setGlobalDispatcher } from 'undici';

const agent: Agent = new Agent({
	connect: {
		rejectUnauthorized: false
	}
});

setGlobalDispatcher(agent);

describe('Planetscale API', () => {
	describe('INSERT and UPDATE and DELETE', () => {
		let connection: Connection;
		const data = {
			insertId: {
				first: 0,
				second: 0
			}
		};

		beforeAll(() => {
			connection = connect({
				username: 'root',
				password: 'password',
				host: 'localhost:3443',
				database: 'sample_db'
			});
		});

		it('INSERT INTO hotels (name, stars) VALUES ("INSERT HOTEL", 3.5);', async () => {
			const results: FullResult = (await connection.execute(
				`INSERT INTO hotels (name, stars) VALUES ("INSERT HOTEL", 3.5);`,
				[],
				{ fullResult: true }
			)) as FullResult;

			expect(results.types).toEqual({});
			expect(results.rows).toEqual([]);
			expect(results.statement).toEqual(expect.any(String));
			expect(results.rowsAffected).toBe(1);
			expect(results.lastInsertId).toEqual(expect.any(Number));
			expect(results.rowCount).toBe(0);

			data.insertId.first = results.lastInsertId as number;
		});

		it('INSERT INTO hotels (name, address) VALUES ("INSERT HOTEL", "1-1, Chiyoda-ku, Tokyo");', async () => {
			const results: FullResult = (await connection.execute(
				`INSERT INTO hotels (name, address) VALUES ("INSERT HOTEL", "1-1, Chiyoda-ku, Tokyo");`,
				[],
				{ fullResult: true }
			)) as FullResult;

			expect(results.types).toEqual({});
			expect(results.rows).toEqual([]);
			expect(results.statement).toEqual(expect.any(String));
			expect(results.rowsAffected).toBe(1);
			expect(results.lastInsertId).toEqual(expect.any(Number));
			expect(results.rowCount).toBe(0);

			data.insertId.second = results.lastInsertId as number;
		});

		it('UPDATE hotels SET ... WHERE id = \\d+;', async () => {
			const results: FullResult = (await connection.execute(
				`UPDATE hotels
				SET address = '1-1, Chiyoda-ku, Tokyo',
					address_json = '{
						"area": {
							"area": { "area": "内幸町1-1-1", "city": "千代田区", "prefecture": "東京都" },
							"city": "千代田区",
							"prefecture": "東京都"
							},
							"city": "千代田区",
							"prefecture": "東京都"
					}'
				WHERE id = ?;`,
				[data.insertId.first],
				{ fullResult: true }
			)) as FullResult;

			expect(results.types).toEqual({});
			expect(results.rows).toEqual([]);
			expect(results.statement).toEqual(expect.any(String));
			expect(results.rowsAffected).toBe(1);
			expect(results.lastInsertId).toBe(0);
			expect(results.rowCount).toBe(0);
		});

		it('DELETE FROM hotels WHERE id >= \\d+;', async () => {
			const results: FullResult = (await connection.execute(
				`DELETE FROM hotels WHERE id IN (:id1, :id2);`,
				{ id1: data.insertId.first, id2: data.insertId.second },
				{ fullResult: true }
			)) as FullResult;

			expect(results.types).toEqual({});
			expect(results.rows).toEqual([]);
			expect(results.statement).toEqual(expect.any(String));
			expect(results.rowsAffected).toBe(2);
			expect(results.lastInsertId).toBe(0);
			expect(results.rowCount).toBe(0);
		});
	});
});
