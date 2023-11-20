import type { FieldPacket } from 'mysql2/promise';

export interface ExpressHandlerError extends Error {
	status?: number;
	seed?: string;
	errors?: Array<CustomError>;
}

export interface CustomError extends Error {
	path?: string;
}

export interface PlanetscaleBody {
	query: string;
	session: string | null;
}

// Extended because the type definition is wrong
// https://github.com/sidorares/node-mysql2/issues/1276
export interface ExtendedFieldPacket extends FieldPacket {
	columnLength: number | null;
	characterSet: number | null;
}

export interface QueryResultFieldExcerpt {
	name: string;
	table: string;
	orgTable: string;
	database: string;
	columnLength: number | null;
	charset: number | null;
	flags: number | null;
}
