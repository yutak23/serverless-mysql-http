import { describe, expect, it } from 'vitest';
import { generateCountQuery } from '../../srv/lib/utils.js';

describe('generateCountQuery', () => {
	it('should generate count query without where clause', () => {
		const deleteQuery = 'DELETE FROM hotels;';
		const expectedQuery = 'SELECT COUNT(*) AS count FROM hotels;';
		const result = generateCountQuery(deleteQuery);
		expect(result).toBe(expectedQuery);
	});

	it('should generate count query with where clause', () => {
		const deleteQuery = 'DELETE FROM hotels WHERE id > 3;';
		const expectedQuery = 'SELECT COUNT(*) AS count FROM hotels WHERE id > 3;';
		const result = generateCountQuery(deleteQuery);
		expect(result).toBe(expectedQuery);
	});

	it('should throw an error if table name not found', () => {
		const deleteQuery = 'DELETE;';
		expect(() => generateCountQuery(deleteQuery)).toThrowError('table name not found');
	});
});
