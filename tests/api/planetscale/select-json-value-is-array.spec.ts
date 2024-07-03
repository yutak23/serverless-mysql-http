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
	describe('INSERT and SELECT', () => {
		let connection: Connection;
		const data = { insertId: '' };

		beforeAll(() => {
			config.url = HOST;
			connection = connect(config);
		});

		it('INSERT INTO hotels (name, stars) VALUES ("json_value_is_array", "{"tags": ["a", "b", "c"]}");', async () => {
			const results: ExecutedQuery = await connection.execute(
				`INSERT INTO hotels (name, address_json) VALUES (?, ?);`,
				['json_value_is_array', JSON.stringify({ tags: ['a', 'b', 'c'] })]
			);

			expect(results.insertId).toEqual(expect.any(String));

			data.insertId = results.insertId;
		});

		it('SELECT * FROM hotels WHERE id = 1;', async () => {
			const results: ExecutedQuery = await connection.execute(
				'SELECT * FROM hotels WHERE id = ?;',
				[data.insertId]
			);

			expect(results.rows[0]).toHaveProperty('address_json', { tags: ['a', 'b', 'c'] });
		});

		it('DELETE FROM hotels WHERE id >= \\d+;', async () => {
			const results: ExecutedQuery = await connection.execute(
				`DELETE FROM hotels WHERE id = ${data.insertId};`
			);

			expect(results.rowsAffected).toBe(1);
		});
	});
});
