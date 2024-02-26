import { requestClear, requestRegister, userPermissionChange, userRemove } from './testHelper';

const OK = 200;
const INPUT_ERROR = 400;
const AUTH_ERROR = 403;

beforeEach(() => {
  requestClear();
});

type AuthUserId = {output: {token: string, authUserId: number}, statusCode: number}
type Empty = {output: Record<string, never>, statusCode: number}

test('Testing valid user permission change as global owner promoting a user', () => {
  const adminRegister = requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const userRegister = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const permissionChange = userPermissionChange(adminRegister.output.token, userRegister.output.authUserId, 1) as Empty;
  const remove = userRemove(userRegister.output.token, adminRegister.output.authUserId) as Empty;
  expect(permissionChange.output).toStrictEqual({});
  expect(remove.output).toStrictEqual({});
  expect(remove.statusCode).toBe(OK);
  expect(permissionChange.statusCode).toBe(OK);
});

test('Testing valid user permission change as global owner demoting another global owner', () => {
  const adminRegister = requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const userRegister = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const permissionChange = userPermissionChange(adminRegister.output.token, userRegister.output.authUserId, 1) as Empty;
  const permissionChange2 = userPermissionChange(userRegister.output.token, adminRegister.output.authUserId, 2) as Empty;
  const remove = userRemove(adminRegister.output.token, userRegister.output.authUserId) as Empty;
  expect(remove.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(remove.statusCode).toBe(AUTH_ERROR);
  expect(permissionChange.output).toStrictEqual({});
  expect(permissionChange2.output).toStrictEqual({});
  expect(permissionChange.statusCode).toBe(OK);
  expect(permissionChange2.statusCode).toBe(OK);
});

test('Testing invalid user permission change as global owner, user already has permission id of 2', () => {
  const adminRegister = requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const userRegister = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const permissionChange = userPermissionChange(adminRegister.output.token, userRegister.output.authUserId, 2) as Empty;
  expect(permissionChange.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(permissionChange.statusCode).toBe(INPUT_ERROR);
});

test('Testing invalid user permission change as global owner with invalid permission level of 3', () => {
  const adminRegister = requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const userRegister = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const permissionChange = userPermissionChange(adminRegister.output.token, userRegister.output.authUserId, 3) as Empty;
  expect(permissionChange.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(permissionChange.statusCode).toBe(INPUT_ERROR);
});

test('Testing invalid user permission change as global owner with invalid user id', () => {
  const adminRegister = requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const userRegister = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const permissionChange = userPermissionChange(adminRegister.output.token, userRegister.output.authUserId + 1, 1) as Empty;
  expect(permissionChange.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(permissionChange.statusCode).toBe(INPUT_ERROR);
});

test('Testing invalid user permission change as non global owner', () => {
  const adminRegister = requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const userRegister = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const permissionChange = userPermissionChange(userRegister.output.token, adminRegister.output.authUserId, 2) as Empty;
  expect(permissionChange.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(permissionChange.statusCode).toBe(AUTH_ERROR);
});

test('Testing invalid token for user permission change', () => {
  requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const userRegister = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const permissionChange = userPermissionChange('invalid token', userRegister.output.authUserId, 1) as Empty;
  expect(permissionChange.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(permissionChange.statusCode).toBe(AUTH_ERROR);
});

test('Testing demoting the last admin in the system', () => {
  const adminRegister = requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const permissionChange = userPermissionChange(adminRegister.output.token, adminRegister.output.authUserId, 2) as Empty;
  expect(permissionChange.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(permissionChange.statusCode).toBe(INPUT_ERROR);
});

test('Testing invalid user permission change as global owner with invalid permission level of 0', () => {
  const adminRegister = requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const userRegister = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const permissionChange = userPermissionChange(adminRegister.output.token, userRegister.output.authUserId, 0) as Empty;
  expect(permissionChange.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(permissionChange.statusCode).toBe(INPUT_ERROR);
});
