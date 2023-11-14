import { describe, expect, it } from 'vitest';

const HOST = 'http://localhost:3000';

describe('Planetscale API', () => {
	it('should return message', async () => {
		const response = await fetch(`${HOST}/api/v1/planetscale`);
		const json = await response.json();
		expect(response.status).toBe(200);
		expect(json).toHaveProperty('message', 'Hello, World!');
	});
});
