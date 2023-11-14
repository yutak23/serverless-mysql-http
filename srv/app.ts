import express from 'express';
import consoleExpressRoutes from 'console-express-routes';
import errorResponse from './lib/error-response.js';
import createRoutes from './routes/index.js';

const PORT = process.env['PORT'] || 3000;
const app = express();

app.use(errorResponse());
app.use(express.json());

const routes = await createRoutes();
Object.keys(routes).forEach((route) => {
	const routeResister = routes[route];
	if (routeResister && typeof routeResister === 'function') routeResister({ app });
});

app.listen(PORT, () => {
	console.log(`Server started at http://localhost:${PORT}`);
	consoleExpressRoutes(app);
});

export default app;
