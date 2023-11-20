import { beforeAll, describe, expect, it } from 'vitest';
import { Connection, connect } from '@planetscale/database';

interface ErrorResponse extends Error {
	status: number;
	body: {
		code: string;
		message: string;
	};
}

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

	it('NotFound tavle', async () => {
		let res;
		try {
			res = await connection.execute(`SELECT * FROM hoge;`);
		} catch (error) {
			res = error as ErrorResponse;
		}

		expect(res).toHaveProperty('status', 400);
		expect(res).toHaveProperty('body.code', 'UNKNOWN');
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		expect(res.body.message).toMatch(/Table 'for_vitest\.hoge' doesn't exist/);
	});
});
