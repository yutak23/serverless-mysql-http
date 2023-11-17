import type { Field } from '@planetscale/database';
import type { QueryResultFieldExcerpt } from '../types/express-handler.js';

export { Field };
// https://vitess.io/files/version-pdfs/Vitess-Docs-6.0-04-29-2020.pdf
export type VitessDataType =
	| 'NULL_TYPE'
	| 'INT8'
	| 'UINT8'
	| 'INT16'
	| 'UINT16'
	| 'INT24'
	| 'UINT24'
	| 'INT32'
	| 'UINT32'
	| 'INT64'
	| 'UINT64'
	| 'FLOAT32'
	| 'FLOAT64'
	| 'TIMESTAMP'
	| 'DATE'
	| 'TIME'
	| 'DATETIME'
	| 'YEAR'
	| 'DECIMAL'
	| 'TEXT'
	| 'BLOB'
	| 'VARCHAR'
	| 'VARBINARY'
	| 'CHAR'
	| 'BINARY'
	| 'BIT'
	| 'ENUM'
	| 'SET'
	| 'TUPLE'
	| 'GEOMETRY'
	| 'JSON';

export interface SqlDefinition {
	Field: string;
	Type: string;
	Null: string;
	Key: string;
	Default: null;
	Extra: string;
}

function mapMySQLToVitessType(mysqlType: string): VitessDataType {
	const upperCasedType = mysqlType.toUpperCase();
	let type = upperCasedType.toUpperCase().split(/\s+/)[0];

	const match = type?.match(/(\w+)\((\d+)\)/);
	type = match ? match[1] : type;

	switch (type) {
		case 'TINYINT':
			return upperCasedType.includes('UNSIGNED') ? 'UINT8' : 'INT8';
		case 'SMALLINT':
			return upperCasedType.includes('UNSIGNED') ? 'UINT16' : 'INT16';
		case 'MEDIUMINT':
			return upperCasedType.includes('UNSIGNED') ? 'UINT24' : 'INT24';
		case 'INT':
		case 'INTEGER':
			return upperCasedType.includes('UNSIGNED') ? 'UINT32' : 'INT32';
		case 'BIGINT':
			return upperCasedType.includes('UNSIGNED') ? 'UINT64' : 'INT64';
		case 'FLOAT':
			return 'FLOAT32';
		case 'DOUBLE':
		case 'REAL':
			return 'FLOAT64';
		case 'DECIMAL':
		case 'NUMERIC':
			return 'DECIMAL';
		case 'DATE':
			return 'DATE';
		case 'TIMESTAMP':
			return 'TIMESTAMP';
		case 'TIME':
			return 'TIME';
		case 'DATETIME':
			return 'DATETIME';
		case 'YEAR':
			return 'YEAR';
		case 'CHAR':
			return 'CHAR';
		case 'VARCHAR':
			return 'VARCHAR';
		case 'BLOB':
			return 'BLOB';
		case 'TEXT':
			return 'TEXT';
		case 'BIT':
			return 'BIT';
		case 'BINARY':
			return 'BINARY';
		case 'VARBINARY':
			return 'VARBINARY';
		case 'ENUM':
			return 'ENUM';
		case 'SET':
			return 'SET';
		case 'JSON':
			return 'JSON';
		case 'GEOMETRY':
			return 'GEOMETRY';
		default:
			return 'NULL_TYPE';
	}
}

export default (
	sqlDefinitions: SqlDefinition[],
	fields: QueryResultFieldExcerpt[],
	databaseName: string,
	tableName: string
): Field[] => {
	const typeMapping: Field[] = [];

	sqlDefinitions.forEach(({ Field, Type }) => {
		const field = fields.find((f) => f.name === Field);
		typeMapping.push({
			name: Field,
			type: mapMySQLToVitessType(Type),
			table: field ? field.table : tableName,
			orgTable: field ? field.orgTable : tableName,
			database: field ? field.database : databaseName,
			orgName: Field,
			columnLength: field ? field.columnLength : 0,
			charset: field ? field.charset : 0
		});
	});

	return typeMapping;
};
