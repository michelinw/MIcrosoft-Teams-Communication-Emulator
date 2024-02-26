import {
  requestClear,
  requestRegister,
  requestCreate,
  requestJoin,
  requestLeave,
  requestStandupStart
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

test('Testing leave with valid details as owner', () => {
  const userRegister = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const channel = requestCreate(userRegister.output.token, 'My Channel', true) as ChannelId;
  const channelLeave = requestLeave(userRegister.output.token, channel.output.channelId) as Empty;
  expect(channelLeave.output).toStrictEqual({});
  expect(channelLeave.statusCode).toBe(OK);
});

test('Testing leave with valid details as member', () => {
  const userRegister = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const userRegister2 = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
  const channel = requestCreate(userRegister.output.token, 'My Channel', true) as ChannelId;
  requestJoin(userRegister2.output.token, channel.output.channelId);
  const channelLeave = requestLeave(userRegister2.output.token, channel.output.channelId) as Empty;
  expect(channelLeave.output).toStrictEqual({});
  expect(channelLeave.statusCode).toBe(OK);
});

test('Testing leave with invalid channelId', () => {
  const userRegister = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const channel = requestCreate(userRegister.output.token, 'My Channel', true) as ChannelId;
  const channelLeave = requestLeave(userRegister.output.token, channel.output.channelId + 1) as Empty;
  expect(channelLeave.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(channelLeave.statusCode).toBe(INPUT_ERROR);
});

test('Testing leave with a member who is not in the channel', () => {
  const userRegister = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const userRegister2 = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
  const channel = requestCreate(userRegister.output.token, 'My Channel', true) as ChannelId;
  const channelLeave = requestLeave(userRegister2.output.token, channel.output.channelId) as Empty;
  expect(channelLeave.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(channelLeave.statusCode).toBe(AUTH_ERROR);
});

test('Testing leave with an invalid token', () => {
  const userRegister = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const channel = requestCreate(userRegister.output.token, 'My Channel', true) as ChannelId;
  const channelLeave = requestLeave('', channel.output.channelId) as Empty;
  expect(channelLeave.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(channelLeave.statusCode).toBe(AUTH_ERROR);
});

test('Testing leave as a standup starter', () => {
  const userRegister = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const channel = requestCreate(userRegister.output.token, 'My Channel', true) as ChannelId;
  requestStandupStart(userRegister.output.token, channel.output.channelId, 15);
  const channelLeave = requestLeave(userRegister.output.token, channel.output.channelId) as Empty;
  expect(channelLeave.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(channelLeave.statusCode).toBe(INPUT_ERROR);
});
