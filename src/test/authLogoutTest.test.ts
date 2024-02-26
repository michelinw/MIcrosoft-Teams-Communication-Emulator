import { requestClear, requestRegister, requestLogout } from './testHelper';

const OK = 200;
const AUTH_ERROR = 403;

beforeEach(() => {
  requestClear();
});

type AuthUserId = {output: {token: string, authUserId: number}, statusCode: number}

test('Testing logout with valid token', () => {
  const userRegister = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const userLogout = requestLogout(userRegister.output.token);
  expect(userLogout.output).toStrictEqual({});
  expect(userLogout.statusCode).toBe(OK);
});

test('Testing logout with invalid token', () => {
  const userLogout = requestLogout('') as AuthUserId;
  expect(userLogout.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(userLogout.statusCode).toBe(AUTH_ERROR);
});
