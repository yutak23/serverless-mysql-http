export interface ExpressHandlerSqlError extends Error {
	status?: number;
	code?: string;
	errno?: number;
	sql?: string;
	sqlState?: string;
	sqlMessage?: string;
}

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

export interface QueryResultFieldExcerpt {
	name: string;
	table: string;
	orgTable: string;
	database: string;
	columnLength: number | null;
	charset: number | null;
	flags: number | null | string[];
	type: number | null;
	typeName?: string; // not exist in mysql2
}

export interface ResultSetHeader {
	fieldCount: number;
	affectedRows: number;
	insertId: number;
	info: string;
	serverStatus: number;
	warningStatus: number;
	changedRows: number;
}
