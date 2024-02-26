import { requestClear, requestRegister, requestCreate, requestStandupStart } from './testHelper';

const OK = 200;
const INPUT_ERROR = 400;
const AUTH_ERROR = 403;

beforeEach(() => {
  requestClear();
});

afterEach(() => {
  requestClear();
});

type AuthUserId = {output: {token: string, authUserId: number}, statusCode: number}
type ChannelId = {output: {channelId: number}, statusCode: number}
type Standup = {output: {timeFinish: number}, statusCode: number}

test('Testing valid standup', () => {
  const user = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const channel = requestCreate(user.output.token, 'My Channel', true) as ChannelId;
  const standup = requestStandupStart(user.output.token, channel.output.channelId, 20) as Standup;
  expect(standup.output).toStrictEqual({ timeFinish: expect.any(Number) });
  expect(standup.statusCode).toBe(OK);
});

test('Testing invalid channel id', () => {
  const user = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const channel = requestCreate(user.output.token, 'My Channel', true) as ChannelId;
  const standup = requestStandupStart(user.output.token, channel.output.channelId + 1, 20) as Standup;
  expect(standup.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(standup.statusCode).toBe(INPUT_ERROR);
});

test('Testing negative length', () => {
  const user = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const channel = requestCreate(user.output.token, 'My Channel', true) as ChannelId;
  const standup = requestStandupStart(user.output.token, channel.output.channelId, -1) as Standup;
  expect(standup.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(standup.statusCode).toBe(INPUT_ERROR);
});

test('Testing two standups', () => {
  const user = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const channel = requestCreate(user.output.token, 'My Channel', true) as ChannelId;
  requestStandupStart(user.output.token, channel.output.channelId, 20);
  const standup = requestStandupStart(user.output.token, channel.output.channelId, 20);
  expect(standup.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(standup.statusCode).toBe(INPUT_ERROR);
});

test('Testing invalid token', () => {
  const user = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const channel = requestCreate(user.output.token, 'My Channel', true) as ChannelId;
  const standup = requestStandupStart('', channel.output.channelId, 20) as Standup;
  expect(standup.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(standup.statusCode).toBe(AUTH_ERROR);
});

test('Testing a non member', () => {
  const user = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const userTwo = requestRegister('xin@unsw.edu.au', 'password123', 'Xin', 'Weng') as AuthUserId;
  const channel = requestCreate(user.output.token, 'My Channel', true) as ChannelId;
  const standup = requestStandupStart(userTwo.output.token, channel.output.channelId, 20) as Standup;
  expect(standup.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(standup.statusCode).toBe(AUTH_ERROR);
});
