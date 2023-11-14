/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import fs from 'fs';
import appRoot from 'app-root-path';
import lodash from 'lodash';
import type { Application } from 'express';

const { camelCase } = lodash;

export default async () => {
	const routes: Record<string, (options: { app: Application }) => void> = {};

	const directoryDirents = fs
		.readdirSync(appRoot.resolve('srv/routes'), { withFileTypes: true })
		.filter((dirent: fs.Dirent) => !dirent.isFile());

	await Promise.all(
		directoryDirents.map(async (dirent: fs.Dirent) => {
			const module = await import(`./${dirent.name}/index.js`);
			routes[camelCase(dirent.name)] = module.default;
		})
	);

	return routes;
};
