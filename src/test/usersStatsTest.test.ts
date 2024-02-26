import { requestClear, requestRegister, requestUsersStats } from './testHelper';

const AUTH_ERROR = 403;

beforeEach(() => {
  requestClear();
});

type AuthUserId = {output: {token: string, authUserId: number}, statusCode: number}
type Empty = {output: Record<string, never>, statusCode: number}

test('Testing invalid users stats request', () => {
  requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const stats = requestUsersStats('invalid token') as Empty;
  expect(stats.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(stats.statusCode).toBe(AUTH_ERROR);
});
