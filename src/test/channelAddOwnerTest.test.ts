import {
  requestClear, requestRegister, requestCreate,
  requestJoin, requestAddOwner
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

test('Testing addOwner with invalid channelId', () => {
  const userRegister = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const userRegister2 = requestRegister('xin@unsw.edu.au', 'password123', 'Xin', 'Weng') as AuthUserId;
  const channel = requestCreate(userRegister.output.token, 'My Channel', true) as ChannelId;
  requestJoin(userRegister2.output.token, channel.output.channelId);
  const addOwner = requestAddOwner(userRegister.output.token, channel.output.channelId + 1, userRegister2.output.authUserId) as Empty;
  expect(addOwner.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(addOwner.statusCode).toBe(INPUT_ERROR);
});

test('Testing addOwner with invalid uId', () => {
  const userRegister = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const userRegister2 = requestRegister('xin@unsw.edu.au', 'password123', 'Xin', 'Weng') as AuthUserId;
  const channel = requestCreate(userRegister.output.token, 'My Channel', true) as ChannelId;
  requestJoin(userRegister2.output.token, channel.output.channelId);
  const addOwner = requestAddOwner(userRegister.output.token, channel.output.channelId, userRegister2.output.authUserId + 1) as Empty;
  expect(addOwner.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(addOwner.statusCode).toBe(INPUT_ERROR);
});

test('Testing addOwner with the uId not a member of the channel', () => {
  const userRegister = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const userRegister2 = requestRegister('xin@unsw.edu.au', 'password123', 'Xin', 'Weng') as AuthUserId;
  const channel = requestCreate(userRegister.output.token, 'My Channel', true) as ChannelId;
  const addOwner = requestAddOwner(userRegister.output.token, channel.output.channelId, userRegister2.output.authUserId) as Empty;
  expect(addOwner.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(addOwner.statusCode).toBe(INPUT_ERROR);
});

test('Testing addOwner on an existing owner', () => {
  const userRegister = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const userRegister2 = requestRegister('xin@unsw.edu.au', 'password123', 'Xin', 'Weng') as AuthUserId;
  const channel = requestCreate(userRegister.output.token, 'My Channel', true) as ChannelId;
  requestJoin(userRegister2.output.token, channel.output.channelId);
  requestAddOwner(userRegister.output.token, channel.output.channelId, userRegister2.output.authUserId);
  const addOwner2 = requestAddOwner(userRegister.output.token, channel.output.channelId, userRegister2.output.authUserId) as Empty;
  expect(addOwner2.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(addOwner2.statusCode).toBe(INPUT_ERROR);
});

test('Testing addOwner with adding yourself', () => {
  const userRegister = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const channel = requestCreate(userRegister.output.token, 'My Channel', true) as ChannelId;
  const addOwner = requestAddOwner(userRegister.output.token, channel.output.channelId, userRegister.output.authUserId) as Empty;
  expect(addOwner.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(addOwner.statusCode).toBe(INPUT_ERROR);
});

test('Testing addOwner with valid details as a non-owner', () => {
  const userRegister = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const userRegister2 = requestRegister('xin@unsw.edu.au', 'password123', 'Xin', 'Weng') as AuthUserId;
  const userRegister3 = requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const channel = requestCreate(userRegister.output.token, 'My Channel', true) as ChannelId;
  requestJoin(userRegister2.output.token, channel.output.channelId);
  requestJoin(userRegister3.output.token, channel.output.channelId);
  const addOwner = requestAddOwner(userRegister2.output.token, channel.output.channelId, userRegister3.output.authUserId) as Empty;
  expect(addOwner.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(addOwner.statusCode).toBe(AUTH_ERROR);
});

test('Testing addOwner with invalid token', () => {
  const userRegister = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const userRegister2 = requestRegister('xin@unsw.edu.au', 'password123', 'Xin', 'Weng') as AuthUserId;
  const channel = requestCreate(userRegister.output.token, 'My Channel', true) as ChannelId;
  requestJoin(userRegister2.output.token, channel.output.channelId);
  const addOwner = requestAddOwner('', channel.output.channelId, userRegister2.output.authUserId) as Empty;
  expect(addOwner.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(addOwner.statusCode).toBe(AUTH_ERROR);
});

test('Testing addOwner with valid details as owner', () => {
  const userRegister = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const userRegister2 = requestRegister('xin@unsw.edu.au', 'password123', 'Xin', 'Weng') as AuthUserId;
  const channel = requestCreate(userRegister.output.token, 'My Channel', true) as ChannelId;
  requestJoin(userRegister2.output.token, channel.output.channelId);
  const addOwner = requestAddOwner(userRegister.output.token, channel.output.channelId, userRegister2.output.authUserId) as Empty;
  expect(addOwner.output).toStrictEqual({});
  expect(addOwner.statusCode).toBe(OK);
});

test('Testing addOwner with valid details as a global owner', () => {
  const userRegister = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const userRegister2 = requestRegister('xin@unsw.edu.au', 'password123', 'Xin', 'Weng') as AuthUserId;
  const channel = requestCreate(userRegister2.output.token, 'My Channel', true) as ChannelId;
  requestJoin(userRegister.output.token, channel.output.channelId);
  const addOwner = requestAddOwner(userRegister.output.token, channel.output.channelId, userRegister.output.authUserId) as Empty;
  expect(addOwner.output).toStrictEqual({});
  expect(addOwner.statusCode).toBe(OK);
});
