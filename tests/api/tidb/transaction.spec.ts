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

	describe('SELECT with transaction and lock', () => {
		describe('SELECT FOR UPDATE', () => {
			it("SELECT * FROM hotels WHERE id = 1 FOR UPDATE; and UPDATE hotels SET address = '北海道札幌市1-1' WHERE id = 1;", async () => {
				const tx = await connection.begin();

				try {
					const result: FullResult = (await tx.execute(
						'SELECT * FROM hotels WHERE id = :id FOR UPDATE;',
						{ id: 1 },
						{ fullResult: true }
					)) as FullResult;

					expect(result.rows).toEqual([
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
					expect(result.statement).toBe(`SELECT * FROM hotels WHERE id = 1 FOR UPDATE;`);
					expect(result.rowsAffected).toBe(0);
					expect(result.lastInsertId).toBe(null);
					expect(result.rowCount).toBe(1);

					const updateResult: FullResult = (await tx.execute(
						`UPDATE hotels SET address = '北海道札幌市1-1' WHERE id = ?;`,
						[1],
						{ fullResult: true }
					)) as FullResult;
					expect(updateResult.types).toEqual({});
					expect(updateResult.rows).toEqual([]);
					expect(updateResult.statement).toEqual(expect.any(String));
					expect(updateResult.rowsAffected).toBe(1);
					expect(updateResult.lastInsertId).toBe(0);
					expect(updateResult.rowCount).toBe(0);
				} catch (error) {
					await tx.rollback();
					throw error;
				}
			});
		});

		describe('Confirm result', () => {
			it('SELECT * FROM hotels WHERE id = 1;', async () => {
				const results: FullResult = (await connection.execute(
					'SELECT * FROM hotels WHERE id = ?;',
					[1],
					{ fullResult: true }
				)) as FullResult;
				expect(results.rows).toHaveProperty('[0].address', '北海道札幌市1-1');
			});
		});

		describe('Terndown', () => {
			it('UPDATE hotels SET  WHERE id = 1;', async () => {
				const results: FullResult = (await connection.execute(
					`UPDATE hotels SET address = '東京都千代田区1-1' WHERE id = ?;`,
					[1],
					{ fullResult: true }
				)) as FullResult;
				expect(results.rowsAffected).toBe(1);
			});

			it('SELECT * FROM hotels WHERE id = 1;', async () => {
				const results: FullResult = (await connection.execute(
					'SELECT * FROM hotels WHERE id = ?;',
					[1],
					{ fullResult: true }
				)) as FullResult;
				expect(results.rows).toHaveProperty('[0].address', '東京都千代田区1-1');
			});
		});
	});
});
