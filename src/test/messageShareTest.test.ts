import {
  requestClear, requestRegister, requestCreate, requestSend,
  requestShare, requestDmCreate, requestDmSend, requestJoin
} from './testHelper';

const OK = 200;
const INPUT_ERROR = 400;
const AUTH_ERROR = 403;

type AuthUserId = {output: {token: string, authUserId: number}, statusCode: number}
type ChannelId = {output: {channelId: number}, statusCode: number}
type dmId = {output: {dmId: number}, statusCode: number}
type MessageId = {output: {messageId: number}, statusCode: number}
type SharedMessageId = {output: {sharedMessageId: number}, statusCode: number}

requestClear();
const userRegister = requestRegister('Michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
const userRegister2 = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
const userRegister3 = requestRegister('cecilia@unsw.edu.au', 'password', 'Cecilia', 'Le') as AuthUserId;
const channelCreate = requestCreate(userRegister.output.token, 'My Channel', true) as ChannelId;
const uIds = [userRegister2.output.authUserId];
requestJoin(userRegister3.output.token, channelCreate.output.channelId);
const dmCreate = requestDmCreate(userRegister.output.token, uIds) as dmId;
const messageDmSend = requestDmSend(userRegister.output.token, dmCreate.output.dmId, 'Test message 1, 2, 3') as MessageId;
const messageSend = requestSend(userRegister.output.token, channelCreate.output.channelId, 'Hi, this is a message') as MessageId;

afterAll(() => {
  requestClear();
});

describe('success', () => {
  test('Testing sharing to channel no message (share dm to channel)', () => {
    const messageShare = requestShare(userRegister.output.token, messageDmSend.output.messageId, '', channelCreate.output.channelId, -1) as SharedMessageId;
    expect(messageShare.output).toStrictEqual({ sharedMessageId: expect.any(Number) });
    expect(messageShare.statusCode).toBe(OK);
  });

  test('Testing sharing to channel with message', () => {
    const messageShare = requestShare(userRegister.output.token, messageSend.output.messageId, 'Message 1 2 3', channelCreate.output.channelId, -1) as SharedMessageId;
    expect(messageShare.output).toStrictEqual({ sharedMessageId: expect.any(Number) });
    expect(messageShare.statusCode).toBe(OK);
  });

  test('Testing sharing to dm no message', () => {
    const messageShare = requestShare(userRegister.output.token, messageSend.output.messageId, '', -1, dmCreate.output.dmId) as SharedMessageId;
    expect(messageShare.output).toStrictEqual({ sharedMessageId: expect.any(Number) });
    expect(messageShare.statusCode).toBe(OK);
  });

  test('Testing sharing to dm with message (share channel to dm)', () => {
    const messageShare = requestShare(userRegister.output.token, messageDmSend.output.messageId, 'Message 1 2 3', -1, dmCreate.output.dmId) as SharedMessageId;
    expect(messageShare.output).toStrictEqual({ sharedMessageId: expect.any(Number) });
    expect(messageShare.statusCode).toBe(OK);
  });
});

describe('fail', () => {
  test('Testing sharing with both Id as -1', () => {
    const messageShare = requestShare(userRegister.output.token, messageSend.output.messageId, '', -1, -1) as SharedMessageId;
    expect(messageShare.output).toStrictEqual({ error: { message: expect.any(String) } });
    expect(messageShare.statusCode).toBe(INPUT_ERROR);
  });

  test('Testing sharing with no Id as -1', () => {
    const messageShare = requestShare(userRegister.output.token, messageSend.output.messageId, '', 1, 1) as SharedMessageId;
    expect(messageShare.output).toStrictEqual({ error: { message: expect.any(String) } });
    expect(messageShare.statusCode).toBe(INPUT_ERROR);
  });

  test('Testing sharing with invalid channelId and dmId as -1', () => {
    const messageShare = requestShare(userRegister.output.token, messageSend.output.messageId, '', channelCreate.output.channelId + 1, -1) as SharedMessageId;
    expect(messageShare.output).toStrictEqual({ error: { message: expect.any(String) } });
    expect(messageShare.statusCode).toBe(INPUT_ERROR);
  });

  test('Testing sharing with invalid dmId and channelId as -1', () => {
    const messageShare = requestShare(userRegister.output.token, messageDmSend.output.messageId, '', -1, dmCreate.output.dmId + 1) as SharedMessageId;
    expect(messageShare.output).toStrictEqual({ error: { message: expect.any(String) } });
    expect(messageShare.statusCode).toBe(INPUT_ERROR);
  });

  test('Testing sharing with message length > 1000', () => {
    const messageShare = requestShare(userRegister.output.token, messageSend.output.messageId + 1, 'aMessageWithALengthGreaterThanAThousandThatIsVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryLong', channelCreate.output.channelId, -1) as SharedMessageId;
    expect(messageShare.output).toStrictEqual({ error: { message: expect.any(String) } });
    expect(messageShare.statusCode).toBe(INPUT_ERROR);
  });

  test('Testing sharing with valid channelId but not joined', () => {
    const messageShare = requestShare(userRegister2.output.token, messageSend.output.messageId, 'message', channelCreate.output.channelId, -1) as SharedMessageId;
    expect(messageShare.output).toStrictEqual({ error: { message: expect.any(String) } });
    expect(messageShare.statusCode).toBe(AUTH_ERROR);
  });

  test('Testing sharing with valid dmId but not joined', () => {
    const messageShare = requestShare(userRegister3.output.token, channelCreate.output.channelId, '', -1, dmCreate.output.dmId) as SharedMessageId;
    expect(messageShare.output).toStrictEqual({ error: { message: expect.any(String) } });
    expect(messageShare.statusCode).toBe(AUTH_ERROR);
  });

  test('Testing sharing with invalid ogMessageId', () => {
    const messageShare = requestShare(userRegister.output.token, messageSend.output.messageId + 100, '', channelCreate.output.channelId, -1) as SharedMessageId;
    expect(messageShare.output).toStrictEqual({ error: { message: expect.any(String) } });
    expect(messageShare.statusCode).toBe(INPUT_ERROR);
  });

  test('Testing sharing with invalid ogMessageId (user has not joined original channel)', () => {
    const messageShare = requestShare(userRegister2.output.token, messageSend.output.messageId, '', -1, dmCreate.output.dmId) as SharedMessageId;
    expect(messageShare.output).toStrictEqual({ error: { message: expect.any(String) } });
    expect(messageShare.statusCode).toBe(INPUT_ERROR);
  });

  test('Testing sharing with invalid ogMessageId (user has not joined original dm)', () => {
    const messageShare = requestShare(userRegister3.output.token, messageDmSend.output.messageId, 'message', channelCreate.output.channelId, -1) as SharedMessageId;
    expect(messageShare.output).toStrictEqual({ error: { message: expect.any(String) } });
    expect(messageShare.statusCode).toBe(INPUT_ERROR);
  });

  test('Testing sharing with invalid token', () => {
    const messageShare = requestShare(userRegister.output.token + 20, messageSend.output.messageId, 'message', channelCreate.output.channelId, -1) as SharedMessageId;
    expect(messageShare.output).toStrictEqual({ error: { message: expect.any(String) } });
    expect(messageShare.statusCode).toBe(AUTH_ERROR);
  });
});
