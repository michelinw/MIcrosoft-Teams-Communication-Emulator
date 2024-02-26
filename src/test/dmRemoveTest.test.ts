import { requestClear, requestRegister, requestDmCreate, requestDmRemove } from './testHelper';

const OK = 200;
const INPUT_ERROR_400 = 400;
const INPUT_ERROR_403 = 403;

type AuthUserId = {output: {token: string, authUserId: number}, statusCode: number}
type dmId = {output: {dmId: number}, statusCode: number}
type Empty = {output: Record<string, never>, statusCode: number}

beforeEach(() => {
  requestClear();
});

test('Testing successful remove with valid details as owner with members present', () => {
  const userRegister1 = requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const registerToken = userRegister1.output.token;
  const userRegister2 = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const userRegister3 = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const uIds = [userRegister2.output.authUserId, userRegister3.output.authUserId];
  const dmCreate = requestDmCreate(registerToken, uIds) as dmId;
  const dmRemove = requestDmRemove(registerToken, dmCreate.output.dmId) as Empty;
  expect(dmRemove.statusCode).toBe(OK);
  expect(dmRemove.output).toStrictEqual({});
});

test('Testing unsuccessful remove with valid details as member in channel with owner and other members present', () => {
  const userRegister1 = requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const registerToken1 = userRegister1.output.token;
  const userRegister2 = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const registerToken2 = userRegister2.output.token;
  const userRegister3 = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const uIds = [userRegister2.output.authUserId, userRegister3.output.authUserId];
  const dmCreate = requestDmCreate(registerToken1, uIds) as dmId;
  const dmRemove = requestDmRemove(registerToken2, dmCreate.output.dmId) as Empty;
  expect(dmRemove.statusCode).toBe(INPUT_ERROR_403);
  expect(dmRemove.output).toStrictEqual({ error: { message: expect.any(String) } });
});

test('Testing successful remove with valid details as owner with members present and multiple dms created', () => {
  const userRegister1 = requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const registerToken = userRegister1.output.token;
  const userRegister2 = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const userRegister3 = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const userRegister4 = requestRegister('xin@unsw.edu.au', 'password123', 'Xin', 'Wang') as AuthUserId;
  const uIds = [userRegister2.output.authUserId];
  const uIds1 = [userRegister3.output.authUserId];
  const uIds2 = [userRegister4.output.authUserId];
  const dmCreate = requestDmCreate(registerToken, uIds) as dmId;
  requestDmCreate(registerToken, uIds1) as dmId;
  requestDmCreate(registerToken, uIds2) as dmId;
  const dmRemove = requestDmRemove(registerToken, dmCreate.output.dmId) as Empty;
  expect(dmRemove.statusCode).toBe(OK);
  expect(dmRemove.output).toStrictEqual({});
});

test('Testing unsuccessful remove with valid details as member not in channel with owner and other members present in channel', () => {
  const userRegister1 = requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const registerToken1 = userRegister1.output.token;
  const userRegister2 = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const registerToken2 = userRegister2.output.token;
  const userRegister3 = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const uIds = [userRegister3.output.authUserId];
  const dmCreate = requestDmCreate(registerToken1, uIds) as dmId;
  const dmRemove = requestDmRemove(registerToken2, dmCreate.output.dmId) as Empty;
  expect(dmRemove.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(dmRemove.statusCode).toBe(INPUT_ERROR_403);
});

test('Testing unsuccessful remove with invalid dmId', () => {
  const userRegister = requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const registerToken = userRegister.output.token;
  const userRegister1 = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const uIds = [userRegister1.output.authUserId];
  const dmCreate = requestDmCreate(registerToken, uIds) as dmId;
  const dmRemove = requestDmRemove(registerToken, dmCreate.output.dmId + 1) as Empty;
  expect(dmRemove.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(dmRemove.statusCode).toBe(INPUT_ERROR_400);
});

test('Testing unsuccessful remove with invalid token', () => {
  const userRegister = requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const registerToken = userRegister.output.token;
  const userRegister1 = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const invalidToken = 'invalid';
  const uIds = [userRegister1.output.authUserId];
  const dmCreate = requestDmCreate(registerToken, uIds) as dmId;
  const dmRemove = requestDmRemove(invalidToken, dmCreate.output.dmId) as Empty;
  expect(dmRemove.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(dmRemove.statusCode).toBe(INPUT_ERROR_403);
});
