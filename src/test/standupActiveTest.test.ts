import {
  requestClear,
  requestRegister,
  requestCreate,
  requestStandupStart,
  requestStandupActive
} from './testHelper';

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
type ActiveStatus = {output: {isActive: boolean, timeFinish: number}, statusCode: number}

test('Testing active standup', () => {
  const user = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const channel = requestCreate(user.output.token, 'My Channel', true) as ChannelId;
  requestStandupStart(user.output.token, channel.output.channelId, 2);
  const standup = requestStandupActive(user.output.token, channel.output.channelId) as ActiveStatus;
  expect(standup.output).toStrictEqual({ isActive: true, timeFinish: expect.any(Number) });
  expect(standup.statusCode).toBe(OK);
  const timeSent = Math.floor((new Date()).getTime() / 1000) + 2;
  let timeNow = Math.floor((new Date()).getTime() / 1000);
  while (timeNow <= timeSent) {
    timeNow = Math.floor((new Date()).getTime() / 1000);
  }
});

test('Testing inactive standup', () => {
  const user = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const channel = requestCreate(user.output.token, 'My Channel', true) as ChannelId;
  const standup = requestStandupActive(user.output.token, channel.output.channelId) as ActiveStatus;
  expect(standup.output).toStrictEqual({ isActive: false, timeFinish: null });
  expect(standup.statusCode).toBe(OK);
});

test('Testing invalid channel id', () => {
  const user = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const channel = requestCreate(user.output.token, 'My Channel', true) as ChannelId;
  requestStandupStart(user.output.token, channel.output.channelId, 2);
  const standup = requestStandupActive(user.output.token, channel.output.channelId + 1) as ActiveStatus;
  expect(standup.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(standup.statusCode).toBe(INPUT_ERROR);
});

test('Testing invalid token', () => {
  const user = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const channel = requestCreate(user.output.token, 'My Channel', true) as ChannelId;
  requestStandupStart(user.output.token, channel.output.channelId, 2);
  const standup = requestStandupActive('', channel.output.channelId) as ActiveStatus;
  expect(standup.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(standup.statusCode).toBe(AUTH_ERROR);
});

test('Testing a non member', () => {
  const user = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const userTwo = requestRegister('xin@unsw.edu.au', 'password123', 'Xin', 'Weng') as AuthUserId;
  const channel = requestCreate(user.output.token, 'My Channel', true) as ChannelId;
  requestStandupStart(user.output.token, channel.output.channelId, 2);
  const standup = requestStandupActive(userTwo.output.token, channel.output.channelId) as ActiveStatus;
  expect(standup.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(standup.statusCode).toBe(AUTH_ERROR);
});
