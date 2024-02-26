import { requestRegister, requestClear, requestDmCreate } from './testHelper';

const OK = 200;
const INPUT_ERROR = 400;
const AUTH_ERROR = 403;

beforeEach(() => {
  requestClear();
});

type AuthUserId = {output: {token: string, authUserId: number}, statusCode: number}
type dmId = {output: {dmId: number}, statusCode: number}

test('Testing invalid token', () => {
  const userRegister1 = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const registerToken = userRegister1.output.token + 30;
  const userRegister2 = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const uIds = [userRegister2.output.authUserId];
  const dmCreate = requestDmCreate(registerToken, uIds) as dmId;
  expect(dmCreate.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(dmCreate.statusCode).toBe(AUTH_ERROR);
});

test('Testing valid a dm', () => {
  const userRegister1 = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const registerToken = userRegister1.output.token;
  const userRegister2 = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const uIds = [userRegister2.output.authUserId];

  const dmCreate = requestDmCreate(registerToken, uIds) as dmId;
  expect(dmCreate.statusCode).toBe(OK);
  expect(dmCreate.output).toStrictEqual({ dmId: expect.any(Number) });
});

test('Testing muliple members in a dm', () => {
  const userRegister1 = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const registerToken = userRegister1.output.token;
  const userRegister2 = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const userRegister3 = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
  const userRegister4 = requestRegister('xin@unsw.edu.au', 'password123', 'Xin', 'Weng') as AuthUserId;
  const uIds = [userRegister2.output.authUserId, userRegister3.output.authUserId, userRegister4.output.authUserId];

  const dmCreate = requestDmCreate(registerToken, uIds) as dmId;
  expect(dmCreate.statusCode).toBe(OK);
  expect(dmCreate.output).toStrictEqual({ dmId: expect.any(Number) });
});

test('Testing invalid duplicate uIds', () => {
  const userRegister1 = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const registerToken = userRegister1.output.token;
  const userRegister2 = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const userRegister3 = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
  const userRegister4 = requestRegister('xin@unsw.edu.au', 'password123', 'Xin', 'Weng') as AuthUserId;
  const uIds = [userRegister2.output.authUserId, userRegister2.output.authUserId, userRegister3.output.authUserId, userRegister4.output.authUserId];

  const dmCreate = requestDmCreate(registerToken, uIds) as dmId;
  expect(dmCreate.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(dmCreate.statusCode).toBe(INPUT_ERROR);
});

test('Testing invalid uIds', () => {
  const userRegister1 = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const registerToken = userRegister1.output.token;
  const userRegister2 = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const uIds = [userRegister2.output.authUserId + 20];
  const dmCreate = requestDmCreate(registerToken, uIds) as dmId;
  expect(dmCreate.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(dmCreate.statusCode).toBe(INPUT_ERROR);
});
