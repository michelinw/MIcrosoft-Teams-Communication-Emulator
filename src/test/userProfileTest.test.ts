import { requestRegister, requestClear, requestProfile, userRemove } from './testHelper';

const OK = 200;
const INPUT_ERROR = 400;
const AUTH_ERROR = 403;

beforeEach(() => {
  requestClear();
});

type AuthUserId = {output: {token: string, authUserId: number}, statusCode: number}
type UserProfile = {output: {uId: number, email: string, nameFirst: string, nameLast: string, handleStr: string}, statusCode: number}

test('Testing user profile with valid authUserId and checking yourself', () => {
  const userRegister = requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const profile = requestProfile(userRegister.output.token, userRegister.output.authUserId) as UserProfile;
  expect(profile.output).toStrictEqual({
    user: { uId: userRegister.output.authUserId, email: 'michael@unsw.edu.au', nameFirst: 'Michael', nameLast: 'Wang', handleStr: expect.any(String), profileImageUrl: expect.any(String) },
  });
  expect(profile.statusCode).toBe(OK);
});

test('Testing user profile with valid authUserId and checking someone else', () => {
  const userRegister = requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const userRegister2 = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const profile = requestProfile(userRegister.output.token, userRegister2.output.authUserId) as UserProfile;
  expect(profile.output).toStrictEqual({
    user: { uId: userRegister2.output.authUserId, email: 'cecilia@unsw.edu.au', nameFirst: 'Cecilia', nameLast: 'Le', handleStr: expect.any(String), profileImageUrl: expect.any(String) }
  });
  expect(profile.statusCode).toBe(OK);
});

test('Testing user profile with invalid token', () => {
  const userRegister = requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const profile = requestProfile('', userRegister.output.authUserId) as UserProfile;
  expect(profile.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(profile.statusCode).toBe(AUTH_ERROR);
});

test('Testing user profile with invalid uId', () => {
  const userRegister = requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const profile = requestProfile(userRegister.output.token, userRegister.output.authUserId + 1) as UserProfile;
  expect(profile.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(profile.statusCode).toBe(INPUT_ERROR);
});

test('Testing user profile which has been removed', () => {
  const adminRegister = requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const userRegister = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
  userRemove(adminRegister.output.token, userRegister.output.authUserId);
  const profile = requestProfile(adminRegister.output.token, userRegister.output.authUserId) as UserProfile;
  expect(profile.output).toStrictEqual({ user: { uId: userRegister.output.authUserId, email: '', nameFirst: 'Removed', nameLast: 'user', handleStr: '', profileImageUrl: '' } }); // email and handleStr should be null
  expect(profile.statusCode).toBe(OK);
});
