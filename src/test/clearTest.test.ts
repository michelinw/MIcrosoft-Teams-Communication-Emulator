import { requestRegister, requestClear } from './testHelper';

const OK = 200;

type Empty = {output: Record<string, never>, statusCode: number}

test('Testing clear with no data', () => {
  const clear = requestClear() as Empty;
  expect(clear.output).toStrictEqual({});
  expect(clear.statusCode).toBe(OK);
});

test('Testing clear with data', () => {
  requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le');
  const clear = requestClear() as Empty;
  expect(clear.output).toStrictEqual({});
  expect(clear.statusCode).toBe(OK);
});
