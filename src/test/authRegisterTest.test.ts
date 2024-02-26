import { requestClear, requestRegister, requestProfile } from './testHelper';

const OK = 200;
const INPUT_ERROR = 400;

beforeEach(() => {
  requestClear();
});

type AuthUserId = {output: {token: string, authUserId: number}, statusCode: number}

test('Testing register with correct details', () => {
  const userRegister = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  expect(userRegister.output).toStrictEqual({
    token: expect.any(String),
    authUserId: expect.any(Number)
  });
  expect(userRegister.statusCode).toBe(OK);
});

test('Testing register with invalid email', () => {
  const userRegister = requestRegister('ceciliaEmail', 'password123', 'Cecilia', 'Le') as AuthUserId;
  expect(userRegister.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(userRegister.statusCode).toBe(INPUT_ERROR);
});

test('Testing register with an already used email', () => {
  requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le');
  const userRegisterTwo = requestRegister('cecilia@unsw.edu.au', 'password456', 'Cecilia', 'Le') as AuthUserId;
  expect(userRegisterTwo.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(userRegisterTwo.statusCode).toBe(INPUT_ERROR);
});

test('Testing register with short password', () => {
  const userRegister = requestRegister('cecilia@unsw.edu.au', 'short', 'Cecilia', 'Le') as AuthUserId;
  expect(userRegister.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(userRegister.statusCode).toBe(INPUT_ERROR);
});

test('Testing register with long first name', () => {
  const userRegister = requestRegister('cecilia@unsw.edu.au', 'password123', 'AVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryLongFirstName', 'Le');
  expect(userRegister.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(userRegister.statusCode).toBe(INPUT_ERROR);
});

test('Testing register with long last name', () => {
  const userRegister = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'AVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryLongLastName') as AuthUserId;
  expect(userRegister.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(userRegister.statusCode).toBe(INPUT_ERROR);
});

test('Testing register with long first and last name', () => {
  const userRegister = requestRegister('cecilia@unsw.edu.au', 'password123', 'AVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryLongFirstName', 'AVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryLongLastName') as AuthUserId;
  expect(userRegister.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(userRegister.statusCode).toBe(INPUT_ERROR);
});

describe('Testing handle', () => {
  test('Testing basic', () => {
    const userRegister = requestRegister('cecilia@unsw.edu.au', 'password123', 'ababababab', 'cdcdcdcdcdcd') as AuthUserId;
    expect(userRegister.output).toStrictEqual({
      token: expect.any(String),
      authUserId: expect.any(Number)
    });
    expect(userRegister.statusCode).toBe(OK);
    const userProfile = requestProfile(userRegister.output.token, userRegister.output.authUserId);
    expect(userProfile.output.user.handleStr).toStrictEqual('abababababcdcdcdcdcd');
  });
  test('Testing duplicate', () => {
    const userRegister = requestRegister('cecilia@unsw.edu.au', 'password123', '@bcdefgh!j', 'klmn opqrst') as AuthUserId;
    const userRegister1 = requestRegister('alan@unsw.edu.au', 'password123', 'bcdefghj', 'klmnopqrst') as AuthUserId;
    expect(userRegister.output).toStrictEqual({
      token: expect.any(String),
      authUserId: expect.any(Number)
    });
    expect(userRegister.statusCode).toBe(OK);
    expect(userRegister1.output).toStrictEqual({
      token: expect.any(String),
      authUserId: expect.any(Number)
    });
    expect(userRegister1.statusCode).toBe(OK);
    const userProfile = requestProfile(userRegister.output.token, userRegister.output.authUserId);
    expect(userProfile.output.user.handleStr).toStrictEqual('bcdefghjklmnopqrst');
    const userProfile1 = requestProfile(userRegister1.output.token, userRegister1.output.authUserId);
    expect(userProfile1.output.user.handleStr).toStrictEqual('bcdefghjklmnopqrst0');
  });
});
