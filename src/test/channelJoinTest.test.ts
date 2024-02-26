import { requestClear, requestRegister, requestCreate, requestJoin } from './testHelper';

const OK = 200;
const INPUT_ERROR_400 = 400;
const INPUT_ERROR_403 = 403;

beforeEach(() => {
  requestClear();
});

type AuthUserId = {output: {token: string, authUserId: number}, statusCode: number}
type ChannelId = {output: {channelId: number}, statusCode: number}
type Empty = {output: Record<string, never>, statusCode: number}

test('Testing joining valid channel', () => {
  const userRegister1 = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const channelCreate = requestCreate(userRegister1.output.token, 'My Channel', true) as ChannelId;
  const userRegister2 = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
  const joinChannel = requestJoin(userRegister2.output.token, channelCreate.output.channelId) as Empty;
  expect(joinChannel.output).toStrictEqual({});
  expect(joinChannel.statusCode).toBe(OK);
});

test('Testing joining invalid channel', () => {
  const userRegister1 = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const channelCreate = requestCreate(userRegister1.output.token, 'My Channel', true) as ChannelId;
  const invalidId = channelCreate.output.channelId + 1;
  const userRegister2 = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
  const joinChannel = requestJoin(userRegister2.output.token, invalidId) as Empty;
  expect(joinChannel.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(joinChannel.statusCode).toBe(INPUT_ERROR_400);
});

test('Testing joining channel when already a member', () => {
  const userRegister1 = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const channelCreate = requestCreate(userRegister1.output.token, 'My Channel', true) as ChannelId;
  const joinChannel = requestJoin(userRegister1.output.token, channelCreate.output.channelId) as Empty;
  expect(joinChannel.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(joinChannel.statusCode).toBe(INPUT_ERROR_400);
});

test('Testing joining private channel', () => {
  const userRegister1 = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const channelCreate = requestCreate(userRegister1.output.token, 'My Channel', false) as ChannelId;
  const userRegister2 = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
  const joinChannel = requestJoin(userRegister2.output.token, channelCreate.output.channelId) as Empty;
  expect(joinChannel.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(joinChannel.statusCode).toBe(INPUT_ERROR_403);
});

test('Testing joining channel with invalid token', () => {
  const userRegister1 = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const channelCreate = requestCreate(userRegister1.output.token, 'My Channel', true) as ChannelId;
  const joinChannel = requestJoin('', channelCreate.output.channelId) as Empty;
  expect(joinChannel.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(joinChannel.statusCode).toBe(INPUT_ERROR_403);
});

test('Testing joining a private channel as a global owner', () => {
  const userRegister1 = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const userRegister2 = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
  const channelCreate = requestCreate(userRegister2.output.token, 'My Channel', false) as ChannelId;
  const joinChannel = requestJoin(userRegister1.output.token, channelCreate.output.channelId) as Empty;
  expect(joinChannel.output).toStrictEqual({});
  expect(joinChannel.statusCode).toBe(OK);
});
