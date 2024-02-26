import {
  requestClear, requestRegister, requestCreate,
  requestJoin, requestAddOwner, requestRemoveOwner
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
type Empty = {output: Record<string, never>, statusCode: number}

test('Testing removeOwner with invalid token', () => {
  const userRegister = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const userRegister2 = requestRegister('xin@unsw.edu.au', 'password123', 'Xin', 'Weng') as AuthUserId;
  const channel = requestCreate(userRegister.output.token, 'My  Channel', true) as ChannelId;
  requestJoin(userRegister2.output.token, channel.output.channelId);
  requestAddOwner(userRegister.output.token, channel.output.channelId, userRegister2.output.authUserId);
  const removeOwner = requestRemoveOwner(userRegister.output.token + 100, channel.output.channelId, userRegister2.output.authUserId) as Empty;
  expect(removeOwner.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(removeOwner.statusCode).toBe(AUTH_ERROR);
});

test('Testing removeOwner with invalid channelId', () => {
  const userRegister = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const userRegister2 = requestRegister('xin@unsw.edu.au', 'password123', 'Xin', 'Weng') as AuthUserId;
  const channel = requestCreate(userRegister.output.token, 'My  Channel', true) as ChannelId;
  requestJoin(userRegister2.output.token, channel.output.channelId);
  requestAddOwner(userRegister.output.token, channel.output.channelId, userRegister2.output.authUserId);
  const removeOwner = requestRemoveOwner(userRegister.output.token, channel.output.channelId + 1, userRegister2.output.authUserId) as Empty;
  expect(removeOwner.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(removeOwner.statusCode).toBe(INPUT_ERROR);
});

test('Testing removeOwner with invalid uId', () => {
  const userRegister = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const userRegister2 = requestRegister('xin@unsw.edu.au', 'password123', 'Xin', 'Weng') as AuthUserId;
  const channel = requestCreate(userRegister.output.token, 'My  Channel', true) as ChannelId;
  requestJoin(userRegister2.output.token, channel.output.channelId);
  requestAddOwner(userRegister.output.token, channel.output.channelId, userRegister2.output.authUserId);
  const removeOwner = requestRemoveOwner(userRegister.output.token, channel.output.channelId, userRegister2.output.authUserId + 1) as Empty;
  expect(removeOwner.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(removeOwner.statusCode).toBe(INPUT_ERROR);
});

test('Testing removeOwner with the uId not a member of the channel', () => {
  const userRegister = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const userRegister2 = requestRegister('xin@unsw.edu.au', 'password123', 'Xin', 'Weng') as AuthUserId;
  const channel = requestCreate(userRegister.output.token, 'My  Channel', true) as ChannelId;
  const removeOwner = requestRemoveOwner(userRegister.output.token, channel.output.channelId, userRegister2.output.authUserId) as Empty;
  expect(removeOwner.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(removeOwner.statusCode).toBe(INPUT_ERROR);
});

test('Testing removeOwner on a non-owner', () => {
  const userRegister = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const userRegister2 = requestRegister('xin@unsw.edu.au', 'password123', 'Xin', 'Weng') as AuthUserId;
  const channel = requestCreate(userRegister.output.token, 'My  Channel', true) as ChannelId;
  requestJoin(userRegister2.output.token, channel.output.channelId);
  const removeOwner = requestRemoveOwner(userRegister.output.token, channel.output.channelId, userRegister2.output.authUserId) as Empty;
  expect(removeOwner.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(removeOwner.statusCode).toBe(INPUT_ERROR);
});

test('Testing removeOwner with valid details as a non-owner', () => {
  const userRegister = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const userRegister2 = requestRegister('xin@unsw.edu.au', 'password123', 'Xin', 'Weng') as AuthUserId;
  const userRegister3 = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
  const channel = requestCreate(userRegister.output.token, 'My  Channel', true) as ChannelId;
  requestJoin(userRegister2.output.token, channel.output.channelId);
  requestJoin(userRegister3.output.token, channel.output.channelId);
  requestAddOwner(userRegister.output.token, channel.output.channelId, userRegister2.output.authUserId);
  const removeOwner = requestRemoveOwner(userRegister3.output.token, channel.output.channelId, userRegister2.output.authUserId) as Empty;
  expect(removeOwner.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(removeOwner.statusCode).toBe(AUTH_ERROR);
});

test('Testing removeOwner as global owner', () => {
  const userRegister = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const userRegister2 = requestRegister('xin@unsw.edu.au', 'password123', 'Xin', 'Weng') as AuthUserId;
  const userRegister3 = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
  const channel = requestCreate(userRegister2.output.token, 'My  Channel', true) as ChannelId;
  requestJoin(userRegister.output.token, channel.output.channelId);
  requestJoin(userRegister3.output.token, channel.output.channelId);
  requestAddOwner(userRegister.output.token, channel.output.channelId, userRegister3.output.authUserId);
  const removeOwner = requestRemoveOwner(userRegister.output.token, channel.output.channelId, userRegister3.output.authUserId) as Empty;
  expect(removeOwner.output).toStrictEqual({});
  expect(removeOwner.statusCode).toBe(OK);
});

test('Testing removeOwner on only owner', () => {
  const userRegister = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const channel = requestCreate(userRegister.output.token, 'My  Channel', true) as ChannelId;
  const removeOwner = requestRemoveOwner(userRegister.output.token, channel.output.channelId, userRegister.output.authUserId) as Empty;
  expect(removeOwner.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(removeOwner.statusCode).toBe(INPUT_ERROR);
});

test('Testing removeOwner with valid details as owner', () => {
  const userRegister = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const userRegister2 = requestRegister('xin@unsw.edu.au', 'password123', 'Xin', 'Weng') as AuthUserId;
  const channel = requestCreate(userRegister.output.token, 'My  Channel', true) as ChannelId;
  requestJoin(userRegister2.output.token, channel.output.channelId);
  requestAddOwner(userRegister.output.token, channel.output.channelId, userRegister2.output.authUserId);
  const removeOwner = requestRemoveOwner(userRegister.output.token, channel.output.channelId, userRegister2.output.authUserId) as Empty;
  expect(removeOwner.output).toStrictEqual({});
  expect(removeOwner.statusCode).toBe(OK);
});
