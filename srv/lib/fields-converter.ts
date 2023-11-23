import type { Field } from '@planetscale/database';
import type { QueryResultFieldExcerpt } from '../types/express-handler.js';

export { Field };
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

// https://github.com/mysqljs/mysql/blob/v2.18.1/lib/protocol/constants/types.js
const mapNumberToMySQLType = (typeNumber: number): string => {
	let type;

	switch (typeNumber) {
		case 0: // DECIMAL
		case 246: // NEWDECIMAL
			type = 'DECIMAL';
			break;
		case 1: // TINY
			type = 'TINY';
			break;
		case 2: // SHORT
			type = 'SHORT';
			break;
		case 3: // LONG
			type = 'LONG';
			break;
		case 4: // FLOAT
			type = 'FLOAT';
			break;
		case 5: // DOUBLE
			type = 'DOUBLE';
			break;
		case 6: // NULL
			return 'NULL_TYPE';
		case 7: // TIMESTAMP
		case 17: // TIMESTAMP2
			type = 'TIMESTAMP';
			break;
		case 8: // LONGLONG
			type = 'LONGLONG';
			break;
		case 9: // INT24
			type = 'INT24';
			break;
		case 10: // DATE
		case 14: // NEWDATE
			type = 'DATE';
			break;
		case 11: // TIME
		case 19: // TIME2
			type = 'TIME';
			break;
		case 12: // DATETIME
		case 18: // DATETIME2
			type = 'DATETIME';
			break;
		case 13: // YEAR
			type = 'YEAR';
			break;
		case 15: // VARCHAR
		case 253: // VAR_STRING
		case 254: // STRING
			type = 'VARCHAR';
			break;
		case 16: // BIT
			type = 'BIT';
			break;
		case 245: // JSON
			type = 'JSON';
			break;
		case 247: // ENUM
			type = 'ENUM';
			break;
		case 248: // SET
			type = 'SET';
			break;
		case 249: // TINY_BLOB
		case 250: // MEDIUM_BLOB
		case 251: // LONG_BLOB
		case 252: // BLOB
			type = 'BLOB';
			break;
		case 255: // GEOMETRY
			type = 'GEOMETRY';
			break;
		default:
			return 'NULL_TYPE';
	}

	return type;
};

// https://vitess.io/files/version-pdfs/Vitess-Docs-6.0-04-29-2020.pdf
// https://github.com/mysqljs/mysql/blob/v2.18.1/lib/protocol/constants/types.js
function mapMySQLToVitessType(mysqlType: string): VitessDataType {
	const upperCasedType = mysqlType.toUpperCase();
	let type = upperCasedType.toUpperCase().split(/\s+/)[0];

	const match = type?.match(/(\w+)\((\d+)\)/);
	type = match ? match[1] : type;

	switch (type) {
		case 'TINYINT':
		case 'TINY':
			return upperCasedType.includes('UNSIGNED') ? 'UINT8' : 'INT8';
		case 'SMALLINT':
		case 'SHORT':
			return upperCasedType.includes('UNSIGNED') ? 'UINT16' : 'INT16';
		case 'MEDIUMINT':
		case 'INT24':
			return upperCasedType.includes('UNSIGNED') ? 'UINT24' : 'INT24';
		case 'INT':
		case 'INTEGER':
		case 'LONG':
			return upperCasedType.includes('UNSIGNED') ? 'UINT32' : 'INT32';
		case 'BIGINT':
		case 'LONGLONG':
			return upperCasedType.includes('UNSIGNED') ? 'UINT64' : 'INT64';
		case 'FLOAT':
			return 'FLOAT32';
		case 'DOUBLE':
		case 'REAL':
			return 'FLOAT64';
		case 'DECIMAL':
		case 'NUMERIC':
		case 'NEWDECIMAL':
			return 'DECIMAL';
		case 'DATE':
		case 'NEWDATE':
			return 'DATE';
		case 'TIMESTAMP':
		case 'TIMESTAMP2':
			return 'TIMESTAMP';
		case 'TIME':
		case 'TIME2':
			return 'TIME';
		case 'DATETIME':
		case 'DATETIME2':
			return 'DATETIME';
		case 'YEAR':
			return 'YEAR';
		case 'CHAR':
			return 'CHAR';
		case 'VARCHAR':
		case 'VAR_STRING':
		case 'STRING':
			return 'VARCHAR';
		case 'BLOB':
		case 'TINY_BLOB':
		case 'MEDIUM_BLOB':
		case 'LONG_BLOB':
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

	fields.forEach(({ name, type, table, orgTable, database, columnLength, charset }) => {
		const sqlDef = sqlDefinitions.find((def) => def.Field === name);

		typeMapping.push({
			name: name.toLowerCase().replaceAll('`', ''),
			type: sqlDef
				? mapMySQLToVitessType(sqlDef.Type)
				: mapMySQLToVitessType(mapNumberToMySQLType(type as number)),
			table: table || tableName,
			orgTable: orgTable || tableName,
			database: database || databaseName,
			orgName: name.toLowerCase().replaceAll('`', ''),
			columnLength: columnLength || 0,
			charset: charset || 0
		});
	});

	return typeMapping;
};
