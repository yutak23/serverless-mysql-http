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
			database: 'sample_db',
			columnLength: 10,
			charset: 63,
			flags: 16931,
			type: 3,
			typeName: 'LONG'
		},
		{
			name: 'name',
			table: 'hotels',
			orgTable: 'hotels',
			database: 'sample_db',
			columnLength: 256,
			charset: 224,
			flags: 4097,
			type: 253,
			typeName: 'VAR_STRING'
		},
		{
			name: 'address',
			table: 'hotels',
			orgTable: 'hotels',
			database: 'sample_db',
			columnLength: 512,
			charset: 224,
			flags: 0,
			type: 253,
			typeName: 'VAR_STRING'
		},
		{
			name: 'stars',
			table: 'hotels',
			orgTable: 'hotels',
			database: 'sample_db',
			columnLength: 12,
			charset: 63,
			type: 245,
			flags: 0,
			typeName: 'JSON'
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

	describe('sqlDefinitions is empty array', () => {
		it('type: 8(LONGLONG)', () => {
			const fields = fieldsConverter(
				[],
				[
					{
						name: 'COUNT(`id`)',
						table: '',
						orgTable: '',
						database: 'sample_db',
						columnLength: 21,
						charset: 63,
						flags: 129,
						type: 8
					}
				],
				'dumyDtabaseName',
				'dumyTableName'
			);

			fields.forEach((field: Field) => {
				expect(field).toHaveProperty('name', expect.any(String));
			});

			expect(fields).toHaveProperty('[0].type', 'INT64'); // COUNT(`id`)
		});
	});
});
