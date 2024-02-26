import { requestClear, requestPasswordResetRequest, requestPasswordReset, requestRegister } from './testHelper';
import { getData } from '../dataStore';

const OK = 200;
const INPUT_ERROR = 400;

beforeEach(() => {
  requestClear();
});

type AuthUserId = {output: {token: string, authUserId: number}, statusCode: number}

test('Requesting valid reset', () => {
  requestRegister('matthewwai903@gmail.com', 'password123', 'Matthew', 'Wai') as AuthUserId;
  requestPasswordResetRequest('matthewwai903@gmail.com');
  const data = getData();
  const code = data.resetCodes[0].resetCode;
  const reset = requestPasswordReset(code, 'newpassword');
  expect(reset.output).toStrictEqual({});
  expect(reset.statusCode).toBe(OK);
});

test('Resetting password with invalid code', () => {
  requestRegister('matthewwai903@gmail.com', 'password123', 'Matthew', 'Wai') as AuthUserId;
  requestPasswordResetRequest('matthewwai903@gmail.com');
  const reset = requestPasswordReset(-1, 'newpassword');
  expect(reset.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(reset.statusCode).toBe(INPUT_ERROR);
});

test('Resetting password with invalid password', () => {
    requestRegister('matthewwai903@gmail.com', 'password123', 'Matthew', 'Wai') as AuthUserId;
    requestPasswordResetRequest('matthewwai903@gmail.com');
    const data = getData();
    const code = data.resetCodes[0].resetCode;
    const reset = requestPasswordReset(code, 'pass');
    expect(reset.output).toStrictEqual({ error: { message: expect.any(String) } });
    expect(reset.statusCode).toBe(INPUT_ERROR);
});
