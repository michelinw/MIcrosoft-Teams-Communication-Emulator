import {
  requestClear, requestRegister, requestCreate, requestSend,
  requestDmSend, requestDmCreate, requestPin, requestUnpin, requestJoin
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

test('Testing unpinning a valid message in a channel', () => {
  const user = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const channel = requestCreate(user.output.token, 'My Channel', true) as ChannelId;
  const message = requestSend(user.output.token, channel.output.channelId, 'Hi, this is a message');
  requestPin(user.output.token, message.output.messageId);
  const pin = requestUnpin(user.output.token, message.output.messageId);
  expect(pin.output).toStrictEqual({});
  expect(pin.statusCode).toBe(OK);
});

test('Testing reacting a valid message in a DM', () => {
  const user = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const user2 = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const dm = requestDmCreate(user.output.token, [user2.output.authUserId]) as dmId;
  const message = requestDmSend(user.output.token, dm.output.dmId, 'Hi, this is a message');
  requestPin(user.output.token, message.output.messageId);
  const pin = requestUnpin(user.output.token, message.output.messageId);
  expect(pin.output).toStrictEqual({});
  expect(pin.statusCode).toBe(OK);
});

test('Testing unpinning an invalid message', () => {
  const user = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const channel = requestCreate(user.output.token, 'My Channel', true) as ChannelId;
  const message = requestSend(user.output.token, channel.output.channelId, 'Hi, this is a message');
  requestPin(user.output.token, message.output.messageId);
  const pin = requestUnpin(user.output.token, message.output.messageId + 1);
  expect(pin.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(pin.statusCode).toBe(INPUT_ERROR);
});

test('Testing unreacting a message that has not been pinned', () => {
  const user = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const channel = requestCreate(user.output.token, 'My Channel', true) as ChannelId;
  const message = requestSend(user.output.token, channel.output.channelId, 'Hi, this is a message');
  const pin = requestUnpin(user.output.token, message.output.messageId);
  expect(pin.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(pin.statusCode).toBe(INPUT_ERROR);
});

test('Testing not channel owner', () => {
  const user = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const user2 = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const channel = requestCreate(user.output.token, 'My Channel', true) as ChannelId;
  requestJoin(user2.output.token, channel.output.channelId);
  const message = requestSend(user.output.token, channel.output.channelId, 'Hi, this is a message');
  requestPin(user.output.token, message.output.messageId);
  const pin = requestUnpin(user2.output.token, message.output.messageId);
  expect(pin.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(pin.statusCode).toBe(AUTH_ERROR);
});

test('Testing not dm owner', () => {
  const user = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const user2 = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const dm = requestDmCreate(user.output.token, [user2.output.authUserId]) as dmId;
  const message = requestDmSend(user.output.token, dm.output.dmId, 'Hi, this is a message');
  requestPin(user.output.token, message.output.messageId);
  const pin = requestUnpin(user2.output.token, message.output.messageId);
  expect(pin.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(pin.statusCode).toBe(AUTH_ERROR);
});

test('Testing invalid token', () => {
  const user = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const channel = requestCreate(user.output.token, 'My Channel', true) as ChannelId;
  const message = requestSend(user.output.token, channel.output.channelId, 'Hi, this is a message');
  requestPin(user.output.token, message.output.messageId);
  const pin = requestUnpin(user.output.token + 20, message.output.messageId);
  expect(pin.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(pin.statusCode).toBe(AUTH_ERROR);
});

test('Testing not member of channel', () => {
  const user = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const user2 = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const channel = requestCreate(user.output.token, 'My Channel', true) as ChannelId;
  const message = requestSend(user.output.token, channel.output.channelId, 'Hi, this is a message');
  requestPin(user.output.token, message.output.messageId);
  const pin = requestUnpin(user2.output.token, message.output.messageId);
  expect(pin.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(pin.statusCode).toBe(INPUT_ERROR);
});

test('Testing not member of dms', () => {
  const user = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const user2 = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const dm = requestDmCreate(user.output.token, []) as dmId;
  const message = requestDmSend(user.output.token, dm.output.dmId, 'Hi, this is a message');
  requestPin(user.output.token, message.output.messageId);
  const pin = requestUnpin(user2.output.token, message.output.messageId);
  expect(pin.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(pin.statusCode).toBe(INPUT_ERROR);
});
