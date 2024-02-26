import { requestClear, requestRegister, requestCreate, requestSend } from './testHelper';

const OK = 200;
const INPUT_ERROR_400 = 400;
const INPUT_ERROR_403 = 403;

beforeEach(() => {
  requestClear();
});

type AuthUserId = {output: {token: string, authUserId: number}, statusCode: number}
type ChannelId = {output: {channelId: number}, statusCode: number}
type MessageId = {output: {messageId: number}, statusCode: number}

test('Testing sending a valid message', () => {
  const userRegister = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
  const channelCreate = requestCreate(userRegister.output.token, 'My Channel', true) as ChannelId;
  const messageSend = requestSend(userRegister.output.token, channelCreate.output.channelId, 'Hi, this is a message') as MessageId;
  expect(messageSend.output).toStrictEqual({ messageId: expect.any(Number) });
  expect(messageSend.statusCode).toBe(OK);
});

test('Testing sending a message to an invalid channel', () => {
  const userRegister = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
  const messageSend = requestSend(userRegister.output.token, 1, 'Hi, this is a message') as MessageId;
  expect(messageSend.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(messageSend.statusCode).toBe(INPUT_ERROR_400);
});

test('Testing sending an empty message', () => {
  const userRegister = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
  const channelCreate = requestCreate(userRegister.output.token, 'My Channel', true) as ChannelId;
  const messageSend = requestSend(userRegister.output.token, channelCreate.output.channelId, '') as MessageId;
  expect(messageSend.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(messageSend.statusCode).toBe(INPUT_ERROR_400);
});

test('Testing sending a message of length 1', () => {
  const userRegister = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
  const channelCreate = requestCreate(userRegister.output.token, 'My Channel', true) as ChannelId;
  const messageSend = requestSend(userRegister.output.token, channelCreate.output.channelId, 'A') as MessageId;
  expect(messageSend.output).toStrictEqual({ messageId: expect.any(Number) });
  expect(messageSend.statusCode).toBe(OK);
});

test('Testing sending a message of length 1001', () => {
  const userRegister = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
  const channelCreate = requestCreate(userRegister.output.token, 'My Channel', true) as ChannelId;
  const messageSend = requestSend(userRegister.output.token, channelCreate.output.channelId, 'aMessageWithALengthGreaterThanAThousandThatIsVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryLong') as MessageId;
  expect(messageSend.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(messageSend.statusCode).toBe(INPUT_ERROR_400);
});

test('Testing sending a message to a valid channel but not a member', () => {
  const userRegister = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
  const userRegister2 = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const channelCreate = requestCreate(userRegister.output.token, 'My Channel', true) as ChannelId;
  const messageSend = requestSend(userRegister2.output.token, channelCreate.output.channelId, 'Hi, this is a message') as MessageId;
  expect(messageSend.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(messageSend.statusCode).toBe(INPUT_ERROR_403);
});

test('Testing sending a message with invalid token', () => {
  const userRegister = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
  const channelCreate = requestCreate(userRegister.output.token, 'My Channel', true) as ChannelId;
  const messageSend = requestSend('', channelCreate.output.channelId, 'Hi, this is a message') as MessageId;
  expect(messageSend.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(messageSend.statusCode).toBe(INPUT_ERROR_403);
});
