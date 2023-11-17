import { describe, expect, it } from 'vitest';
import fieldsConverter, { Field } from '../../srv/lib/fields-converter.js';

describe('Fields converter', () => {
	const sqlDefinitions = [
		{
			Field: 'id',
			Type: 'int unsigned',
			Null: 'NO',
			Key: 'PRI',
			Default: null,
			Extra: 'auto_increment'
		},
		{
			Field: 'name',
			Type: 'varchar(64)',
			Null: 'NO',
			Key: '',
			Default: null,
			Extra: ''
		},
		{
			Field: 'address',
			Type: 'varchar(128)',
			Null: 'YES',
			Key: '',
			Default: null,
			Extra: ''
		},
		{
			Field: 'stars',
			Type: 'float',
			Null: 'YES',
			Key: '',
			Default: null,
			Extra: ''
		}
	];
	const queryResultFieldExcerpts = [
		{
			name: 'id',
			table: 'hotels',
			orgTable: 'hotels',
			database: 'for_vitest',
			columnLength: 10,
			charset: 63,
			flags: 16931
		},
		{
			name: 'name',
			table: 'hotels',
			orgTable: 'hotels',
			database: 'for_vitest',
			columnLength: 256,
			charset: 224,
			flags: 4097
		},
		{
			name: 'address',
			table: 'hotels',
			orgTable: 'hotels',
			database: 'for_vitest',
			columnLength: 512,
			charset: 224,
			flags: 0
		},
		{
			name: 'stars',
			table: 'hotels',
			orgTable: 'hotels',
			database: 'for_vitest',
			columnLength: 12,
			charset: 63,
			flags: 0
		}
	];

	it('should convert fields', () => {
		const fields = fieldsConverter(
			sqlDefinitions,
			queryResultFieldExcerpts,
			'dumyDtabaseName',
			'dumyTableName'
		);

		fields.forEach((field: Field) => {
			expect(field).toHaveProperty('name', expect.any(String));
		});

		expect(fields).toHaveProperty('[0].type', 'UINT32'); // id
		expect(fields).toHaveProperty('[1].type', 'VARCHAR'); // name
		expect(fields).toHaveProperty('[2].type', 'VARCHAR'); // address
		expect(fields).toHaveProperty('[3].type', 'FLOAT32'); // stars
	});
});
