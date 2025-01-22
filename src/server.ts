import express from 'express';
import colors from 'colors';
import morgan from 'morgan';

import { db } from './config/db';
import budgetRoute from './routes/budgetRoute';

async function connectDB() {
	try {
		await db.authenticate();
		db.sync();
		console.log(colors.blue('Database connected'));
	} catch (error) {
		console.log(colors.red.bold(`Connection Failed: ${error}`));
	}
}

connectDB();

const app = express();

app.use(morgan('dev'));

app.use(express.json());

app.use('/api/budgets', budgetRoute);

export default app;
