import {
  requestClear,
  requestRegister,
  requestCreate,
  requestStandupStart,
  requestStandupSend
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

test('Testing active standup', () => {
  const user = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const channel = requestCreate(user.output.token, 'My Channel', true) as ChannelId;
  requestStandupStart(user.output.token, channel.output.channelId, 20);
  const send = requestStandupSend(user.output.token, channel.output.channelId, 'hello');
  expect(send.output).toStrictEqual({});
  expect(send.statusCode).toBe(OK);
});

test('Testing inactive standup', () => {
  const user = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const channel = requestCreate(user.output.token, 'My Channel', true) as ChannelId;
  const send = requestStandupSend(user.output.token, channel.output.channelId, 'hello');
  expect(send.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(send.statusCode).toBe(INPUT_ERROR);
});

test('Testing invalid channel id', () => {
  const user = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const channel = requestCreate(user.output.token, 'My Channel', true) as ChannelId;
  requestStandupStart(user.output.token, channel.output.channelId, 20);
  const send = requestStandupSend(user.output.token, channel.output.channelId + 1, 'hello');
  expect(send.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(send.statusCode).toBe(INPUT_ERROR);
});

test('Testing long message', () => {
  const user = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const channel = requestCreate(user.output.token, 'My Channel', true) as ChannelId;
  requestStandupStart(user.output.token, channel.output.channelId, 20);
  const send = requestStandupSend(user.output.token, channel.output.channelId, 'a'.repeat(1001));
  expect(send.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(send.statusCode).toBe(INPUT_ERROR);
});

test('Testing invalid token', () => {
  const user = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const channel = requestCreate(user.output.token, 'My Channel', true) as ChannelId;
  requestStandupStart(user.output.token, channel.output.channelId, 20);
  const send = requestStandupSend('', channel.output.channelId, 'hello');
  expect(send.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(send.statusCode).toBe(AUTH_ERROR);
});

test('Testing a non member', () => {
  const user = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const userTwo = requestRegister('xin@unsw.edu.au', 'password123', 'Xin', 'Weng') as AuthUserId;
  const channel = requestCreate(user.output.token, 'My Channel', true) as ChannelId;
  requestStandupStart(user.output.token, channel.output.channelId, 20);
  const send = requestStandupSend(userTwo.output.token, channel.output.channelId, 'hello');
  expect(send.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(send.statusCode).toBe(AUTH_ERROR);
});

test('Testing no message', () => {
  const user = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const channel = requestCreate(user.output.token, 'My Channel', true) as ChannelId;
  requestStandupStart(user.output.token, channel.output.channelId, 20);
  const send = requestStandupSend(user.output.token, channel.output.channelId, ''.repeat(1001));
  expect(send.output).toStrictEqual({});
  expect(send.statusCode).toBe(OK);
});
