const generateCountQuery = (deleteQuery: string): string => {
	const whereClauseMatch = deleteQuery.match(/where\s+.+/i);
	const tableNameMatch = deleteQuery.match(/from\s+(\S+)/i);

	if (!tableNameMatch) throw new Error('table name not found');

	const tableName = tableNameMatch[1];

	if (!whereClauseMatch) return `SELECT COUNT(*) AS count FROM ${tableName}`;
	const whereClause = whereClauseMatch[0];

	return `SELECT COUNT(*) AS count FROM ${tableName} ${whereClause}`;
};

// eslint-disable-next-line import/prefer-default-export
export { generateCountQuery };
