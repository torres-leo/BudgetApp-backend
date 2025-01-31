import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';

dotenv.config();

export const db = new Sequelize(process.env.DATABASE_URL, {
	models: [__dirname + '/../models/**/*'],
	dialect: 'postgres',
	logging: false,
});

// db.sync({ alter: true });
// db.sync({ force: true });
