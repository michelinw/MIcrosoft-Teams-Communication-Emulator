import { requestClear, requestRegister, getUserAll, userRemove } from './testHelper';

const OK = 200;
const AUTH_ERROR = 403;

beforeEach(() => {
  requestClear();
});

type AuthUserId = {output: {token: string, authUserId: number}, statusCode: number}
type Users = {output: Record<string, never>, statusCode: number}

test('Testing getUserAll with valid token (multiple users)', () => {
  requestRegister('z5417541@unsw.edu.au', 'password123', 'Xin', 'Weng') as AuthUserId;
  const userRegister = requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const list = getUserAll(userRegister.output.token) as Users;
  const expected = {
    users: [
      {
        uId: expect.any(Number),
        email: 'z5417541@unsw.edu.au',
        nameFirst: 'Xin',
        nameLast: 'Weng',
        handleStr: expect.any(String),
        profileImageUrl: expect.any(String)
      },
      {
        uId: expect.any(Number),
        email: 'michael@unsw.edu.au',
        nameFirst: 'Michael',
        nameLast: 'Wang',
        handleStr: expect.any(String),
        profileImageUrl: expect.any(String)
      }
    ]
  };
  expect(list.output).toStrictEqual(expected);
  expect(list.statusCode).toBe(OK);
});

test('Testing getUserAll with valid token (single user)', () => {
  const userRegister = requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const list = getUserAll(userRegister.output.token) as Users;
  const expected = {
    users: [
      {
        uId: expect.any(Number),
        email: 'michael@unsw.edu.au',
        nameFirst: 'Michael',
        nameLast: 'Wang',
        handleStr: expect.any(String),
        profileImageUrl: expect.any(String)
      }
    ]
  };
  expect(list.output).toStrictEqual(expected);
  expect(list.statusCode).toBe(OK);
});

test('Testing getUserAll with invalid token', () => {
    requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
    const list = getUserAll('');
    expect(list.output).toStrictEqual({ error: { message: expect.any(String) } });
    expect(list.statusCode).toBe(AUTH_ERROR);
});

test('Testing getUserAll after removing one of the two users in system', () => {
  const adminRegister = requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const userRegister = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  userRemove(adminRegister.output.token, userRegister.output.authUserId);
  const list = getUserAll(adminRegister.output.token) as Users;
  const expected = {
    users: [
      {
        uId: expect.any(Number),
        email: 'michael@unsw.edu.au',
        nameFirst: 'Michael',
        nameLast: 'Wang',
        handleStr: expect.any(String),
        profileImageUrl: expect.any(String)
      }
    ]
  };
  expect(list.output).toStrictEqual(expected);
  expect(list.statusCode).toBe(OK);
});
