import express, { NextFunction, Request, Response } from 'express';
import consoleExpressRoutes from 'console-express-routes';
import errorResponse from './lib/error-response.js';
import createRoutes from './routes/index.js';

const PORT = process.env['PORT'] || 3000;
const app = express();

app.use(errorResponse());
app.use(express.json());

const routes = await createRoutes();
Object.keys(routes).forEach((route: string) => {
	const routeResister = routes[route];
	if (routeResister && typeof routeResister === 'function') routeResister({ app });
});

// If it does not match any existing path
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use('*', (_req: Request, res: Response, _next: NextFunction) => {
	res
		.status(404)
		.error(
			new Error(
				`only support '/psdb.v1alpha1.Database/Execute' and '/psdb.v1alpha1.Database/CreateSession' path`
			)
		);
});

const server = app.listen(PORT, () => {
	console.log(`Server started at http://localhost:${PORT}`);
	consoleExpressRoutes(app);
});

const gracefulShutdown = () => {
	server.close(() => {
		process.exit(0);
	});

	// Forced termination if not completed within 5 seconds
	setTimeout(() => {
		process.exit(1);
	}, 5000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export default app;
