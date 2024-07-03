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
	describe('INSERT and UPDATE and DELETE', () => {
		let connection: Connection;
		const data = {
			insertId: {
				first: '',
				second: ''
			}
		};

		beforeAll(() => {
			config.url = HOST;
			connection = connect(config);
		});

		it('INSERT INTO hotels (name, stars) VALUES ("INSERT HOTEL", 3.5);', async () => {
			const results: ExecutedQuery = await connection.execute(
				`INSERT INTO hotels (name, stars) VALUES ("INSERT HOTEL", 3.5);`
			);

			expect(results.headers).toEqual([]);
			expect(results.types).toEqual({});
			expect(results.fields).toEqual([]);
			expect(results.rows).toEqual([]);
			expect(results.size).toBe(0);
			expect(results.statement).toEqual(expect.any(String));
			expect(results.insertId).toEqual(expect.any(String));
			expect(results.rowsAffected).toBe(1);
			expect(results.time).toEqual(expect.any(Number));

			data.insertId.first = results.insertId;
		});

		it('INSERT INTO hotels (name, address) VALUES ("INSERT HOTEL", "1-1, Chiyoda-ku, Tokyo");', async () => {
			const results: ExecutedQuery = await connection.execute(
				`INSERT INTO hotels (name, address) VALUES ("INSERT HOTEL", "1-1, Chiyoda-ku, Tokyo");`
			);

			expect(results.headers).toEqual([]);
			expect(results.types).toEqual({});
			expect(results.fields).toEqual([]);
			expect(results.rows).toEqual([]);
			expect(results.size).toBe(0);
			expect(results.statement).toEqual(expect.any(String));
			expect(results.insertId).toEqual(expect.any(String));
			expect(results.rowsAffected).toBe(1);
			expect(results.time).toEqual(expect.any(Number));

			data.insertId.second = results.insertId;
		});

		it('UPDATE hotels SET ... WHERE id = \\d+;', async () => {
			const results: ExecutedQuery = await connection.execute(
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
				WHERE id = ${data.insertId.first};`
			);

			expect(results.headers).toEqual([]);
			expect(results.types).toEqual({});
			expect(results.fields).toEqual([]);
			expect(results.rows).toEqual([]);
			expect(results.size).toBe(0);
			expect(results.statement).toEqual(expect.any(String));
			expect(results.insertId).toBe('0');
			expect(results.rowsAffected).toBe(1);
			expect(results.time).toEqual(expect.any(Number));
		});

		it('DELETE FROM hotels WHERE id >= \\d+;', async () => {
			const results: ExecutedQuery = await connection.execute(
				`DELETE FROM hotels WHERE id IN (${data.insertId.first}, ${data.insertId.second});`
			);

			expect(results.headers).toEqual([]);
			expect(results.types).toEqual({});
			expect(results.fields).toEqual([]);
			expect(results.rows).toEqual([]);
			expect(results.size).toBe(0);
			expect(results.statement).toEqual(expect.any(String));
			expect(results.insertId).toBe('0');
			expect(results.rowsAffected).toBe(2);
			expect(results.time).toEqual(expect.any(Number));
		});
	});
});
