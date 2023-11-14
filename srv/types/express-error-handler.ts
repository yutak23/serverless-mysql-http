export interface ExpressHandlerError extends Error {
	status?: number;
	seed?: string;
	errors?: Array<CustomError>;
}

export interface CustomError extends Error {
	path?: string;
}
