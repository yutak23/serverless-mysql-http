import { beforeAll, describe, expect, it } from 'vitest';
import { Connection, FullResult, Row, connect } from '@tidbcloud/serverless';
import { Agent, setGlobalDispatcher } from 'undici';

const agent: Agent = new Agent({
	connect: {
		rejectUnauthorized: false
	}
});
setGlobalDispatcher(agent);

describe('TiDB API', () => {
	describe('INSERT and SELECT', () => {
		let connection: Connection;
		const data = { insertId: 0 };

		beforeAll(() => {
			connection = connect({
				username: 'root',
				password: 'password',
				host: 'localhost:3443',
				database: 'sample_db'
			});
		});

		it('INSERT INTO hotels (name, stars) VALUES ("json_value_is_array", "{"tags": ["a", "b", "c"]}");', async () => {
			const results: FullResult = (await connection.execute(
				`INSERT INTO hotels (name, address_json) VALUES (?, ?);`,
				['json_value_is_array', JSON.stringify({ tags: ['a', 'b', 'c'] })],
				{ fullResult: true }
			)) as FullResult;

			expect(results.lastInsertId).toEqual(expect.any(Number));

			data.insertId = results.lastInsertId as number;
		});

		it('SELECT * FROM hotels WHERE id = 1;', async () => {
			const results: FullResult = (await connection.execute(
				'SELECT * FROM hotels WHERE id = ?;',
				[data.insertId],
				{ fullResult: true }
			)) as FullResult;

			const row = (results.rows as Row[])[0];
			expect(row).toHaveProperty('address_json', { tags: ['a', 'b', 'c'] });
		});

		it('DELETE FROM hotels WHERE id >= \\d+;', async () => {
			const results: FullResult = (await connection.execute(
				`DELETE FROM hotels WHERE id = ${data.insertId};`,
				[],
				{ fullResult: true }
			)) as FullResult;

			expect(results.rowsAffected).toBe(1);
		});
	});
});
