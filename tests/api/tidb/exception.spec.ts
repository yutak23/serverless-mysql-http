import { beforeAll, describe, expect, it } from 'vitest';
import { Connection, connect } from '@tidbcloud/serverless';
import { Agent, setGlobalDispatcher } from 'undici';

interface ErrorResponse extends Error {
	status: number;
	details: {
		message: string;
		error: {
			code: string;
			message: string;
		};
	};
}

const agent: Agent = new Agent({
	connect: {
		rejectUnauthorized: false
	}
});
setGlobalDispatcher(agent);

describe('Planetscale API', () => {
	let connection: Connection;

	beforeAll(() => {
		connection = connect({
			username: 'root',
			password: 'password',
			host: 'localhost:3443',
			database: 'sample_db'
		});
	});

	it('NotFound table', async () => {
		let res;
		try {
			res = await connection.execute(`SELECT * FROM hoge;`);
		} catch (error) {
			res = error as ErrorResponse;
		}

		expect(res).toHaveProperty('status', 500);
		expect(res).toHaveProperty('details.error.code', 'UNKNOWN');
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		expect(res.details.message).toMatch(/Table 'sample_db\.hoge' doesn't exist/);
	});

	it('NotFound column', async () => {
		let res;
		try {
			res = await connection.execute(`SELECT hoge FROM hotels;`);
		} catch (error) {
			res = error as ErrorResponse;
		}

		expect(res).toHaveProperty('status', 500);
		expect(res).toHaveProperty('details.error.code', 'UNKNOWN');
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		expect(res.details.message).toMatch(/Unknown column 'hoge' in 'field list'/);
	});
});
