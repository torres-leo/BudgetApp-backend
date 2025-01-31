import request from 'supertest';
import server from '../../server';
import { AuthController } from '../../contollers/AuthController';
import User from '../../models/User';
import * as authUtils from '../../helpers/auth';
import * as jwtUtils from '../../helpers/jwt';

describe('Authentication - create account', () => {
	it('Should display validation errors when form is empty', async () => {
		const response = await request(server).post('/api/auth/create-account').send({});

		const createAccountMock = jest.spyOn(AuthController, 'createAccount');

		expect(response.statusCode).toBe(400);
		expect(response.statusCode).not.toBe(201);
		expect(response.body).toHaveProperty('errors');
		expect(response.body.errors).toHaveLength(4);
		expect(createAccountMock).not.toHaveBeenCalled();
	});

	it('Should return 400 when email is invalid', async () => {
		const response = await request(server)
			.post('/api/auth/create-account')
			.send({ name: 'Belen', password: '12345678', email: 'not_valid_email' });

		const createAccountMock = jest.spyOn(AuthController, 'createAccount');

		expect(response.statusCode).toBe(400);
		expect(response.statusCode).not.toBe(201);
		expect(response.body).toHaveProperty('errors');
		expect(response.body.errors).toHaveLength(1);
		expect(createAccountMock).not.toHaveBeenCalled();
	});

	it('Should return 400 when password is invalid', async () => {
		const response = await request(server)
			.post('/api/auth/create-account')
			.send({ name: 'Belen', password: '1234567', email: 'test@test.com' });

		const createAccountMock = jest.spyOn(AuthController, 'createAccount');

		expect(response.statusCode).toBe(400);
		expect(response.statusCode).not.toBe(201);
		expect(response.body).toHaveProperty('errors');
		expect(response.body.errors).toHaveLength(1);
		expect(response.body.errors[0].msg).toBe('Password must be at least 8 characters long');
		expect(createAccountMock).not.toHaveBeenCalled();
	});

	it('Should register a new user successfully', async () => {
		const userData = { name: 'Belen', password: '12345678', email: 'test@test.com' };

		const response = await request(server).post('/api/auth/create-account').send(userData);

		expect(response.statusCode).toBe(201);

		expect(response.body).not.toHaveProperty('errors');
	});

	it('Should return 409 when email is already registered', async () => {
		const response = await request(server)
			.post('/api/auth/create-account')
			.send({ name: 'Belen', password: '12345678', email: 'test@test.com' });

		console.log(response.body);

		expect(response.statusCode).toBe(409);
		expect(response.statusCode).not.toBe(400);
		expect(response.statusCode).not.toBe(200);
		expect(response.body).toHaveProperty('message');
		expect(response.body).toEqual({ message: 'Email is already use' });
	});
});

describe('Authentication - Account confirmation with token', () => {
	it('Should display error if token is empty or is invalid', async () => {
		const response = await request(server).post('/api/auth/confirm-account').send({
			token: 'not_valid',
		});

		expect(response.statusCode).toBe(400);
		expect(response.body).toHaveProperty('errors');
		expect(response.body.errors).toHaveLength(1);
		expect(response.body.errors[0].msg).toBe('Invalid token');
	});

	it("Should display error if token doesn't exist", async () => {
		const response = await request(server).post('/api/auth/confirm-account').send({
			token: '123456',
		});

		expect(response.statusCode).toBe(401);
		expect(response.body).toHaveProperty('message');
		expect(response.body).toEqual({ message: 'Invalid token' });
	});

	it('Should confirm account with a valid token', async () => {
		const token = globalThis.BudgeAppConfirmationToken;

		const response = await request(server).post('/api/auth/confirm-account').send({
			token,
		});

		expect(response.statusCode).toBe(200);
		expect(response.statusCode).not.toBe(400);
		expect(response.body).toBe('Account confirmed');
	});
});

describe('Authentication - Login', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('Should display validation errors when the form is empty', async () => {
		const response = await request(server).post('/api/auth/login').send({});

		const loginMock = jest.spyOn(AuthController, 'login');

		expect(response.statusCode).toBe(400);
		expect(response.body).toHaveProperty('errors');
		expect(loginMock).not.toHaveBeenCalled();
	});

	it('Should return 400 bad request when the email is invalid', async () => {
		const userData = { email: 'invalid_email', password: 'password' };

		const response = await request(server).post('/api/auth/login').send(userData);

		const loginMock = jest.spyOn(AuthController, 'login');

		expect(response.statusCode).toBe(400);
		expect(response.body).toHaveProperty('errors');
		expect(response.body.errors).toHaveLength(1);
		expect(response.body.errors[0].msg).toBe('Invalid email');
		expect(loginMock).not.toHaveBeenCalled();
	});

	it('Should return 404 if user is not found', async () => {
		const userData = { email: 'user@test.com', password: 'password' };

		const response = await request(server).post('/api/auth/login').send(userData);

		expect(response.statusCode).toBe(404);
		expect(response.body).toEqual({ message: 'Email not found' });
		expect(response.statusCode).not.toBe(200);
	});

	it('Should return 403 if user account is not confirmed', async () => {
		const userData = { email: 'user@test.com', password: 'password', id: 1, confirmed: false };

		(jest.spyOn(User, 'findOne') as jest.Mock).mockResolvedValue(userData);

		const response = await request(server)
			.post('/api/auth/login')
			.send({ email: 'user@test.com', password: 'password' });

		expect(response.statusCode).toBe(403);
		expect(response.body).toEqual({ message: 'This account has not yet been confirmed' });
	});

	it('Should return 401 if password is incorrect', async () => {
		const userData = { email: 'user@test.com', password: 'password', id: 1, confirmed: true };

		const findOne = (jest.spyOn(User, 'findOne') as jest.Mock).mockResolvedValue(userData);
		const checkPassword = (jest.spyOn(authUtils, 'checkPassword') as jest.Mock).mockResolvedValue(false);

		const response = await request(server)
			.post('/api/auth/login')
			.send({ email: 'user@test.com', password: 'password' });

		expect(response.statusCode).toBe(401);
		expect(response.body).toEqual({ message: 'Invalid password' });
		expect(response.body).toEqual({ message: 'Invalid password' });
		expect(findOne).toHaveBeenCalledTimes(1);
		expect(checkPassword).toHaveBeenCalledTimes(1);
	});

	it('Should return 200 and generate token to use', async () => {
		const userData = { email: 'user@test.com', password: 'password', id: 1, confirmed: true };

		const findOne = (jest.spyOn(User, 'findOne') as jest.Mock).mockResolvedValue(userData);
		const checkPassword = (jest.spyOn(authUtils, 'checkPassword') as jest.Mock).mockResolvedValue(true);
		const generateJWT = (jest.spyOn(jwtUtils, 'generateJWT') as jest.Mock).mockReturnValue('jwt_token');

		const response = await request(server)
			.post('/api/auth/login')
			.send({ email: 'user@test.com', password: 'password' });

		expect(response.status).toBe(200);
		expect(response.status).not.toBe(400);
		expect(response.body).toEqual('jwt_token');
		expect(findOne).toHaveBeenCalled();
		expect(findOne).toHaveBeenCalledTimes(1);
		expect(checkPassword).toHaveBeenCalled();
		expect(checkPassword).toHaveBeenCalledTimes(1);
		expect(generateJWT).toHaveBeenCalled();
		expect(generateJWT).toHaveBeenCalledTimes(1);
	});
});
