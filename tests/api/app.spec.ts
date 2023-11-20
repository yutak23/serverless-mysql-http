import { describe, expect, it } from 'vitest';

const HOST = 'http://localhost:3000';

describe('Not exist api path', () => {
	const Version = '1.11.0';
	const auth = btoa(`username:password`);

	it('/psdb.v1alpha1.Database/CreateSession', async () => {
		const response = await fetch(`${HOST}/psdb.v1alpha1.Database/CreateSession`, {
			method: 'POST',
			body: JSON.stringify({}),
			headers: {
				'Content-Type': 'application/json',
				'User-Agent': `database-js/${Version}`,
				Authorization: `Basic ${auth}`
			},
			cache: 'no-store'
		});
		const json = await response.json();

		expect(response.status).toBe(404);
		expect(json).toHaveProperty('message', `only support '/psdb.v1alpha1.Database/Execute' path`);
	});
});
