import { requestClear, requestPasswordResetRequest, requestRegister } from './testHelper';

const OK = 200;

beforeEach(() => {
  requestClear();
});

type AuthUserId = {output: {token: string, authUserId: number}, statusCode: number}

test('Requesting valid reset', () => {
  requestRegister('matthewwai903@gmail.com', 'password123', 'Matthew', 'Wai') as AuthUserId;
  const resetRequest = requestPasswordResetRequest('matthewwai903@gmail.com');
  expect(resetRequest.output).toStrictEqual({});
  expect(resetRequest.statusCode).toBe(OK);
});

test('Requesting with invalid email', () => {
  requestRegister('matthewwai903@gmail.com', 'password123', 'Matthew', 'Wai') as AuthUserId;
  const resetRequest = requestPasswordResetRequest('');
  expect(resetRequest.output).toStrictEqual({});
  expect(resetRequest.statusCode).toBe(OK);
});
