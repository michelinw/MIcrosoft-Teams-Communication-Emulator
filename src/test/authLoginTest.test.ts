import { requestClear, requestRegister, requestLogin } from './testHelper';

const OK = 200;
const INPUT_ERROR = 400;

beforeEach(() => {
  requestClear();
});

type AuthUserId = {output: {token: string, authUserId: number}, statusCode: number}

test('Testing login with registered user', () => {
  requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const userLogin = requestLogin('cecilia@unsw.edu.au', 'password123') as AuthUserId;
  expect(userLogin.output).toStrictEqual({
    token: expect.any(String),
    authUserId: expect.any(Number)
  });
  expect(userLogin.statusCode).toBe(OK);
});

test('Testing login with unregistered user', () => {
  const userLogin = requestLogin('cecilia1@unsw.edu.au', 'password123') as AuthUserId;
  expect(userLogin.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(userLogin.statusCode).toBe(INPUT_ERROR);
});

test('Testing login with incorrect password', () => {
  requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le');
  const userLogin = requestLogin('cecilia@unsw.edu.au', 'password') as AuthUserId;
  expect(userLogin.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(userLogin.statusCode).toBe(INPUT_ERROR);
});
