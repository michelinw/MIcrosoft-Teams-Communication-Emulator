import { requestClear, requestRegister, requestProfile, setHandle } from './testHelper';

const OK = 200;
const INPUT_ERROR = 400;
const AUTH_ERROR = 403;

beforeEach(() => {
  requestClear();
});

type AuthUserId = {output: {token: string, authUserId: number}, statusCode: number}
type Empty = {output: Record<string, never>, statusCode: number}
type UserProfile = {output: {user: {uId: number, email: string, handleFirst: string, handleLast: string, handleStr: string}}, statusCode: number}

test('Testing setHandle with valid handle and token', () => {
  const userRegister = requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const handle = setHandle(userRegister.output.token, 'handleStr') as Empty;
  expect(handle.output).toStrictEqual({});
  expect(handle.statusCode).toBe(OK);
  const profile = requestProfile(userRegister.output.token, userRegister.output.authUserId) as UserProfile;
  expect(profile.output.user.handleStr).toStrictEqual('handleStr');
});

test('Testing setHandle with valid handle and invalid token', () => {
  requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const handle = setHandle('', 'handleStr') as Empty;
  expect(handle.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(handle.statusCode).toBe(AUTH_ERROR);
});

test('Testing setHandle with too long handle and valid token', () => {
  const userRegister = requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const handle = setHandle(userRegister.output.token, 'aVeryVeryVeryhandleStr') as Empty;
  expect(handle.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(handle.statusCode).toBe(INPUT_ERROR);
});

test('Testing setHandle with too short handle and valid token', () => {
  const userRegister = requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const handle = setHandle(userRegister.output.token, 'st') as Empty;
  expect(handle.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(handle.statusCode).toBe(INPUT_ERROR);
});

test('Testing setHandle with non-alphanumerical handle and valid token', () => {
  const userRegister = requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const handle = setHandle(userRegister.output.token, '@handleStr') as Empty;
  expect(handle.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(handle.statusCode).toBe(INPUT_ERROR);
});

test('Testing setHandle with already used handle and valid token', () => {
    requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
    const userRegister = requestRegister('z5417541@unsw.edu.au', 'password123', 'Xin', 'Weng') as AuthUserId;
    const handle = setHandle(userRegister.output.token, 'michaelwang') as Empty;
    expect(handle.output).toStrictEqual({ error: { message: expect.any(String) } });
    expect(handle.statusCode).toBe(INPUT_ERROR);
});
