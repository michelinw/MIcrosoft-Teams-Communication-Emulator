import { requestClear, requestRegister, requestProfile, setName } from './testHelper';

const OK = 200;
const INPUT_ERROR = 400;
const AUTH_ERROR = 403;

beforeEach(() => {
  requestClear();
});

type AuthUserId = {output: {token: string, authUserId: number}, statusCode: number}
type Empty = {output: Record<string, never>, statusCode: number}
type UserProfile = {output: {uId: number, email: string, nameFirst: string, nameLast: string, handleStr: string}, statusCode: number}

test('Testing setname with valid name and token', () => {
  const userRegister = requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const name = setName(userRegister.output.token, 'Xin', 'Weng') as Empty;
  expect(name.output).toStrictEqual({});
  expect(name.statusCode).toBe(OK);
  const profile = requestProfile(userRegister.output.token, userRegister.output.authUserId) as UserProfile;
  expect(profile.output).toStrictEqual({
    user: { uId: userRegister.output.authUserId, email: 'michael@unsw.edu.au', nameFirst: 'Xin', nameLast: 'Weng', handleStr: expect.any(String), profileImageUrl: expect.any(String) }
  });
});

test('Testing setname with valid name and invalid token', () => {
  requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const name = setName('', 'Xin', 'Weng') as Empty;
  expect(name.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(name.statusCode).toBe(AUTH_ERROR);
});

test('Testing setname with valid token and invalid first name', () => {
  const userRegister = requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const name = setName(userRegister.output.token, 'AVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryLongFirstName', 'Weng') as Empty;
  expect(name.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(name.statusCode).toBe(INPUT_ERROR);
});

test('Testing setname with valid token and invalid last name', () => {
  const userRegister = requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const name = setName(userRegister.output.token, 'Xin', 'AVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryLongLastName') as Empty;
  expect(name.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(name.statusCode).toBe(INPUT_ERROR);
});
