import { requestRegister, requestClear, requestCreate } from './testHelper';

const OK = 200;
const INPUT_ERROR_400 = 400;
const INPUT_ERROR_403 = 403;

beforeEach(() => {
  requestClear();
});

type AuthUserId = {output: {token: string, authUserId: number}, statusCode: number}
type ChannelId = {output: {channelId: number}, statusCode: number}

test('Testing creating a valid public channel', () => {
  const userRegister = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const registerToken = userRegister.output.token;
  const channelCreate = requestCreate(registerToken, 'My Channel', true) as ChannelId;
  expect(channelCreate.output).toStrictEqual({ channelId: expect.any(Number) });
  expect(channelCreate.statusCode).toBe(OK);
});

test('Testing creating a valid private channel', () => {
  const userRegister = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const registerToken = userRegister.output.token;
  const channelCreate = requestCreate(registerToken, 'My Channel', false) as ChannelId;
  expect(channelCreate.output).toStrictEqual({ channelId: expect.any(Number) });
  expect(channelCreate.statusCode).toBe(OK);
});

test('Testing creating a channel with a name length less than 1', () => {
  const userRegister = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const registerToken = userRegister.output.token;
  const channelCreate = requestCreate(registerToken, '', true) as ChannelId;
  expect(channelCreate.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(channelCreate.statusCode).toBe(INPUT_ERROR_400);
});

test('Testing creating a channel with a name length more than 20', () => {
  const userRegister = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const registerToken = userRegister.output.token;
  const channelCreate = requestCreate(registerToken, 'AVeryVeryLongChannelName', true) as ChannelId;
  expect(channelCreate.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(channelCreate.statusCode).toBe(INPUT_ERROR_400);
});

test('Testing creating a channel with an invalid authUserId', () => {
  const userRegister = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const registerToken = userRegister.output.token;
  const invalidId = registerToken + 1;
  const channelCreate = requestCreate(invalidId, 'My Channel', true) as ChannelId;
  expect(channelCreate.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(channelCreate.statusCode).toBe(INPUT_ERROR_403);
});

test('Testing creating multiple channels to test channelId', () => {
  const userRegister = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const registerToken = userRegister.output.token;
  requestCreate(registerToken, 'Channel1', true);
  requestCreate(registerToken, 'Channel2', true);
  const channel = requestCreate(registerToken, 'Channel3', true) as ChannelId;
  expect(channel.output).toStrictEqual({ channelId: expect.any(Number) });
  expect(channel.statusCode).toBe(OK);
});
