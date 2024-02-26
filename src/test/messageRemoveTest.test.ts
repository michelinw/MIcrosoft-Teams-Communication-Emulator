import {
  requestClear, requestRegister, requestCreate, requestSend,
  requestJoin, requestDmSend, requestDmCreate, requestRemoveMessage
} from './testHelper';

const OK = 200;
const INPUT_ERROR = 400;
const AUTH_ERROR = 403;

beforeEach(() => {
  requestClear();
});

type AuthUserId = {output: {token: string, authUserId: number}, statusCode: number}
type ChannelId = {output: {channelId: number}, statusCode: number}
type MessageId = {output: {messageId: number}, statusCode: number}
type dmId = {output: {dmId: number}, statusCode: number}
type Empty = {output: Record<string, never>, statusCode: number}

test('Testing remove message in channel successfully', () => {
  const user = requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const channel = requestCreate(user.output.token, 'My Channel', true) as ChannelId;
  const sentMessage = requestSend(user.output.token, channel.output.channelId, 'Hello World!') as MessageId;
  const removeMessage = requestRemoveMessage(user.output.token, sentMessage.output.messageId) as Empty;
  expect(removeMessage.output).toStrictEqual({});
  expect(removeMessage.statusCode).toBe(OK);
});

test('Testing remove message in dm successfully', () => {
  const user = requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const userTwo = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const dm = requestDmCreate(user.output.token, [userTwo.output.authUserId]) as dmId;
  const sentMessage = requestDmSend(userTwo.output.token, dm.output.dmId, 'Hello World!') as MessageId;
  const removeMessage = requestRemoveMessage(userTwo.output.token, sentMessage.output.messageId) as Empty;
  expect(removeMessage.output).toStrictEqual({});
  expect(removeMessage.statusCode).toBe(OK);
});

test('Testing remove message in channel as an owner', () => {
  const userRegister = requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const userRegister1 = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const channel = requestCreate(userRegister.output.token, 'My Channel', true) as ChannelId;
  requestJoin(userRegister1.output.token, channel.output.channelId);
  const sentMessage = requestSend(userRegister1.output.token, channel.output.channelId, 'Hello World!') as MessageId;
  const removeMessage = requestRemoveMessage(userRegister.output.token, sentMessage.output.messageId) as Empty;
  expect(removeMessage.output).toStrictEqual({});
  expect(removeMessage.statusCode).toBe(OK);
});

test('Testing remove message in dm as a global owner', () => {
  const user = requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const userTwo = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const userThree = requestRegister('matthew@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const dm = requestDmCreate(userTwo.output.token, [user.output.authUserId, userThree.output.authUserId]) as dmId;
  const sentMessage = requestDmSend(userTwo.output.token, dm.output.dmId, 'Hello World!') as MessageId;
  const removeMessage = requestRemoveMessage(user.output.token, sentMessage.output.messageId) as Empty;
  expect(removeMessage.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(removeMessage.statusCode).toBe(AUTH_ERROR);
});

test('Invalid message Id error case', () => {
  const userRegister = requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const channel = requestCreate(userRegister.output.token, 'My Channel', true) as ChannelId;
  const sentMessage = requestSend(userRegister.output.token, channel.output.channelId, 'Hello World!') as MessageId;
  const removeMessage = requestRemoveMessage(userRegister.output.token, sentMessage.output.messageId + 1) as Empty;
  expect(removeMessage.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(removeMessage.statusCode).toBe(INPUT_ERROR);
});

test('Unauthorised remover', () => {
  const userRegister = requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const userRegister2 = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const channel = requestCreate(userRegister.output.token, 'My Channel', true) as ChannelId;
  requestJoin(userRegister2.output.token, channel.output.channelId);
  const sentMessage = requestSend(userRegister.output.token, channel.output.channelId, 'Hello World!') as MessageId;
  const removeMessage = requestRemoveMessage(userRegister2.output.token, sentMessage.output.messageId) as Empty;
  expect(removeMessage.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(removeMessage.statusCode).toBe(AUTH_ERROR);
});

test('Invalid token', () => {
  const userRegister = requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const channel = requestCreate(userRegister.output.token, 'My Channel', true) as ChannelId;
  const sentMessage = requestSend(userRegister.output.token, channel.output.channelId, 'Hello World!') as MessageId;
  const removeMessage = requestRemoveMessage('', sentMessage.output.messageId) as Empty;
  expect(removeMessage.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(removeMessage.statusCode).toBe(AUTH_ERROR);
});

test('Testing remove message not a member of the channel', () => {
  const userRegister = requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const userRegister1 = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const channel = requestCreate(userRegister.output.token, 'My Channel', true) as ChannelId;
  const sentMessage = requestSend(userRegister.output.token, channel.output.channelId, 'Hello World!') as MessageId;
  const removeMessage = requestRemoveMessage(userRegister1.output.token, sentMessage.output.messageId) as Empty;
  expect(removeMessage.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(removeMessage.statusCode).toBe(AUTH_ERROR);
});

test('Testing remove message not a member of the dm', () => {
  const user = requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const userTwo = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const userThree = requestRegister('matthew@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const dm = requestDmCreate(userTwo.output.token, [user.output.authUserId]) as dmId;
  const sentMessage = requestDmSend(userTwo.output.token, dm.output.dmId, 'Hello World!') as MessageId;
  const removeMessage = requestRemoveMessage(userThree.output.token, sentMessage.output.messageId) as Empty;
  expect(removeMessage.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(removeMessage.statusCode).toBe(AUTH_ERROR);
});
