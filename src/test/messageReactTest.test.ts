import {
  requestClear, requestRegister, requestCreate, requestSend,
  requestDmSend, requestDmCreate, requestReact
} from './testHelper';

const OK = 200;
const INPUT_ERROR = 400;
const AUTH_ERROR = 403;

type AuthUserId = {output: {token: string, authUserId: number}, statusCode: number}
type ChannelId = {output: {channelId: number}, statusCode: number}
type dmId = {output: {dmId: number}, statusCode: number}

beforeEach(() => {
  requestClear();
});

afterEach(() => {
  requestClear();
});

test('Testing reacting a valid message in a channel', () => {
  const user = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
  const channel = requestCreate(user.output.token, 'My Channel', true) as ChannelId;
  const message = requestSend(user.output.token, channel.output.channelId, 'Hi, this is a message');
  const react = requestReact(user.output.token, message.output.messageId, 1);
  expect(react.output).toStrictEqual({});
  expect(react.statusCode).toBe(OK);
});

test('Testing reacting a valid message in a DM', () => {
  const user = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
  const user2 = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const dm = requestDmCreate(user.output.token, [user2.output.authUserId]) as dmId;
  const message = requestDmSend(user.output.token, dm.output.dmId, 'Hi, this is a message');
  const react = requestReact(user.output.token, message.output.messageId, 1);
  expect(react.output).toStrictEqual({});
  expect(react.statusCode).toBe(OK);
});

test('Testing reacting an invalid message', () => {
  const user = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
  const channel = requestCreate(user.output.token, 'My Channel', true) as ChannelId;
  const message = requestSend(user.output.token, channel.output.channelId, 'Hi, this is a message');
  const react = requestReact(user.output.token, message.output.messageId + 1, 1);
  expect(react.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(react.statusCode).toBe(INPUT_ERROR);
});

test('Testing invalid react', () => {
  const user = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
  const channel = requestCreate(user.output.token, 'My Channel', true) as ChannelId;
  const message = requestSend(user.output.token, channel.output.channelId, 'Hi, this is a message');
  const react = requestReact(user.output.token, message.output.messageId, 2);
  expect(react.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(react.statusCode).toBe(INPUT_ERROR);
});

test('Testing double react', () => {
  const user = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
  const channel = requestCreate(user.output.token, 'My Channel', true) as ChannelId;
  const message = requestSend(user.output.token, channel.output.channelId, 'Hi, this is a message');
  requestReact(user.output.token, message.output.messageId, 1);
  const react = requestReact(user.output.token, message.output.messageId, 1);
  expect(react.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(react.statusCode).toBe(INPUT_ERROR);
});

test('Testing not part of channel', () => {
  const user = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
  const user2 = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const channel = requestCreate(user.output.token, 'My Channel', true) as ChannelId;
  const message = requestSend(user.output.token, channel.output.channelId, 'Hi, this is a message');
  const react = requestReact(user2.output.token, message.output.messageId, 1);
  expect(react.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(react.statusCode).toBe(INPUT_ERROR);
});

test('Testing not part of dm', () => {
  const user = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
  const user2 = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const user3 = requestRegister('xin@unsw.edu.au', 'password123', 'Xin', 'Weng') as AuthUserId;
  const dm = requestDmCreate(user.output.token, [user2.output.authUserId]) as dmId;
  const message = requestDmSend(user.output.token, dm.output.dmId, 'Hi, this is a message');
  const react = requestReact(user3.output.token, message.output.messageId, 1);
  expect(react.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(react.statusCode).toBe(INPUT_ERROR);
});

test('Testing invalid token', () => {
  const user = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
  const channel = requestCreate(user.output.token, 'My Channel', true) as ChannelId;
  const message = requestSend(user.output.token, channel.output.channelId, 'Hi, this is a message');
  const react = requestReact('', message.output.messageId, 1);
  expect(react.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(react.statusCode).toBe(AUTH_ERROR);
});

test('Testing double react (still valid)', () => {
  const user = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
  const user2 = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const dm = requestDmCreate(user.output.token, [user2.output.authUserId]) as dmId;
  const message = requestDmSend(user.output.token, dm.output.dmId, 'Hi, this is a message');
  requestReact(user.output.token, message.output.messageId, 1);
  const react = requestReact(user2.output.token, message.output.messageId, 1);
  expect(react.output).toStrictEqual({});
  expect(react.statusCode).toBe(OK);
});
