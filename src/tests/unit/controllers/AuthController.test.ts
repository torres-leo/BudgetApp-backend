import { createRequest, createResponse } from 'node-mocks-http';
import { AuthController } from '../../../contollers/AuthController';
import { AuthEmail } from '../../../emails/AuthEmail';
import { checkPassword, hashPassword } from '../../../helpers/auth';
import { generateJWT } from '../../../helpers/jwt';
import { generateToken } from '../../../helpers/userToken';
import User from '../../../models/User';

jest.mock('../../../models/User');
jest.mock('../../../helpers/auth');
jest.mock('../../../helpers/userToken');
jest.mock('../../../helpers/jwt');

describe('AuthController.createAccount', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it('Should return a 409 status and an error message if the email is already registered', async () => {
		(User.findOne as jest.Mock).mockResolvedValue(true);

		const req = createRequest({
			method: 'POST',
			url: '/api/auth/create-account',
			body: { email: 'test@test.com', password: 'testpassword' },
		});

		const res = createResponse();
		await AuthController.createAccount(req, res);

		const data = res._getJSONData();

		expect(res.statusCode).toBe(409);
		expect(data).toHaveProperty('message', 'Email is already use');
		expect(User.findOne).toHaveBeenCalled();
		expect(User.findOne).toHaveBeenCalledTimes(1);
	});

	it('Should register a new user and return a success message', async () => {
		(User.findOne as jest.Mock).mockResolvedValue(null);

		const req = createRequest({
			method: 'POST',
			url: '/api/auth/create-account',
			body: { email: 'test@test.com', password: 'testpassword', name: 'test' },
		});

		const res = createResponse();

		const mockUser = {
			...req.body,
			save: jest.fn(),
		};

		(User.create as jest.Mock).mockResolvedValue(mockUser);
		(hashPassword as jest.Mock).mockResolvedValue('hashedpassword'); // mockResolvedValue => async functions
		(generateToken as jest.Mock).mockReturnValue('123456'); // mockReturnValue => synchronous functions
		jest.spyOn(AuthEmail, 'sendConfirmationEmail').mockImplementation(() => Promise.resolve());

		await AuthController.createAccount(req, res);

		expect(res.statusCode).toBe(201);
		expect(User.create).toHaveBeenCalled();
		expect(User.create).toHaveBeenCalledTimes(1);
		expect(User.create).toHaveBeenCalledWith(req.body);
		expect(mockUser.save).toHaveBeenCalled();
		expect(mockUser.password).toBe('hashedpassword');
		expect(mockUser.token).toBe('123456');
		expect(AuthEmail.sendConfirmationEmail).toHaveBeenCalledWith({
			name: req.body.name,
			email: req.body.email,
			token: '123456',
		});
		expect(AuthEmail.sendConfirmationEmail).toHaveBeenCalledTimes(1);
	});
});

describe('AuthController.login', () => {
	it('Should return 404 if user is not found', async () => {
		(User.findOne as jest.Mock).mockResolvedValue(null);

		const req = createRequest({
			method: 'POST',
			url: '/api/auth/login',
			body: { email: 'test@test.com', password: 'testpassword' },
		});

		const res = createResponse();
		await AuthController.login(req, res);

		const data = res._getJSONData();

		expect(res.statusCode).toBe(404);
		expect(data).toEqual({ message: 'Email not found' });
	});

	it('Should return 403 if user is not confirmed the account yet', async () => {
		(User.findOne as jest.Mock).mockResolvedValue({
			id: 1,
			email: 'test@test.com',
			password: 'password',
			confirmed: false,
		});

		const req = createRequest({
			method: 'POST',
			url: '/api/auth/login',
			body: { email: 'test@test.com', password: 'testpassword' },
		});

		const res = createResponse();
		await AuthController.login(req, res);

		const data = res._getJSONData();

		expect(res.statusCode).toBe(403);
		expect(data).toHaveProperty('message', 'This account has not yet been confirmed');
	});

	it('Should return 401 if user put an incorrect password', async () => {
		const userMock = { id: 1, email: 'test@test.com', password: 'password', confirmed: true };

		(User.findOne as jest.Mock).mockResolvedValue(userMock);

		const req = createRequest({
			method: 'POST',
			url: '/api/auth/login',
			body: { email: 'test@test.com', password: 'testpassword' },
		});

		const res = createResponse();
		(checkPassword as jest.Mock).mockResolvedValue(false);

		await AuthController.login(req, res);

		const data = res._getJSONData();

		expect(res.statusCode).toBe(401);
		expect(data).toHaveProperty('message', 'Invalid password');
		expect(checkPassword).toHaveBeenCalledWith(req.body.password, userMock.password);
		expect(checkPassword).toHaveBeenCalledTimes(1);
	});

	it('Should return a jwt if authentication is successful', async () => {
		const userMock = { id: 1, email: 'test@test.com', password: 'hashedpassword', confirmed: true };

		const req = createRequest({
			method: 'POST',
			url: '/api/auth/login',
			body: { email: 'test@test.com', password: 'password' },
		});

		const res = createResponse();
		const fakejwt = 'fakejwt';

		(User.findOne as jest.Mock).mockResolvedValue(userMock);
		(checkPassword as jest.Mock).mockResolvedValue(true);
		(generateJWT as jest.Mock).mockReturnValue(fakejwt);

		await AuthController.login(req, res);

		const data = res._getJSONData();

		expect(res.statusCode).toBe(200);
		expect(data).toEqual(fakejwt);
		expect(generateJWT).toHaveBeenCalled();
		expect(generateJWT).toHaveBeenCalledTimes(1);
		expect(generateJWT).toHaveBeenCalledWith(userMock.id);
	});
});
