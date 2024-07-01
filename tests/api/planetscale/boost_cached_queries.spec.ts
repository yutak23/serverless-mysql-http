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

describe('Planetscale API', () => {
	let connection: Connection;

	beforeAll(() => {
		config.url = HOST;
		connection = connect(config);
	});

	// https://planetscale.com/docs/tutorials/serverless-driver-boost-guide
	describe('boost_cached_queries', () => {
		it('SET @@boost_cached_queries = true;', async () => {
			const results: ExecutedQuery = await connection.execute('SET @@boost_cached_queries = true;');

			expect(results.headers).toEqual([]);
			expect(results.types).toEqual({});
			expect(results.fields).toEqual([]);
			expect(results.rows).toEqual([]);
			expect(results.size).toBe(0);
			expect(results.statement).toBe(`SET @@boost_cached_queries = true;`);
			expect(results.insertId).toBe('0');
			expect(results.rowsAffected).toBe(0);
			expect(results.time).toEqual(expect.any(Number));
		});

		it('SET @@boost_cached_queries = false;', async () => {
			const results: ExecutedQuery = await connection.execute(
				'SET @@boost_cached_queries = false;'
			);

			expect(results.headers).toEqual([]);
			expect(results.types).toEqual({});
			expect(results.fields).toEqual([]);
			expect(results.rows).toEqual([]);
			expect(results.size).toBe(0);
			expect(results.statement).toBe(`SET @@boost_cached_queries = false;`);
			expect(results.insertId).toBe('0');
			expect(results.rowsAffected).toBe(0);
			expect(results.time).toEqual(expect.any(Number));
		});
	});
});
