import { requestClear, requestRegister, requestProfile, setEmail } from './testHelper';

const OK = 200;
const INPUT_ERROR = 400;
const AUTH_ERROR = 403;

beforeEach(() => {
  requestClear();
});

type AuthUserId = {output: {token: string, authUserId: number}, statusCode: number}
type Empty = {output: Record<string, never>, statusCode: number}
type UserProfile = {output: {uId: number, email: string, nameFirst: string, nameLast: string, handleStr: string}, statusCode: number}

test('Testing setEmail with valid email and token', () => {
  const userRegister = requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const email = setEmail(userRegister.output.token, 'z5417541@unsw.edu.au') as Empty;
  expect(email.output).toStrictEqual({});
  expect(email.statusCode).toBe(OK);
  const profile = requestProfile(userRegister.output.token, userRegister.output.authUserId) as UserProfile;
  expect(profile.output).toStrictEqual({
    user: { uId: userRegister.output.authUserId, email: 'z5417541@unsw.edu.au', nameFirst: 'Michael', nameLast: 'Wang', handleStr: expect.any(String), profileImageUrl: expect.any(String) }
  });
});

test('Testing setEmail with valid email and invalid token', () => {
  requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const email = setEmail('', 'z5417541@unsw.edu.au') as Empty;
  expect(email.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(email.statusCode).toBe(AUTH_ERROR);
});

test('Testing setEmail with valid token and invalid email', () => {
  const userRegister = requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const email = setEmail(userRegister.output.token, 'invalid_email') as Empty;
  expect(email.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(email.statusCode).toBe(INPUT_ERROR);
});

test('Testing setEmail with valid token and already used email', () => {
  const userRegister = requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const email = setEmail(userRegister.output.token, 'cecilia@unsw.edu.au') as Empty;
  expect(email.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(email.statusCode).toBe(INPUT_ERROR);
});
