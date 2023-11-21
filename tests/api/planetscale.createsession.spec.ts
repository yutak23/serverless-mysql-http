/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { beforeAll, describe, expect, it } from 'vitest';
import { Connection, connect, Client } from '@planetscale/database';

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

describe('CreateSession', () => {
	let connection: Connection;
	let client: Client;

	beforeAll(() => {
		config.url = HOST;
		connection = connect(config);
		client = new Client(config);
	});

	it('connection.refresh()', async () => {
		await expect(connection.refresh()).resolves.not.toBe(expect.anything());
	});

	it('client.connection().refresh()', async () => {
		await expect(client.connection().refresh()).resolves.not.toBe(expect.anything());
	});
});
