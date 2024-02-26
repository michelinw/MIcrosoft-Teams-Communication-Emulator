import { requestRegister, requestCreate, requestClear, requestMessages, requestSend, requestReact } from './testHelper';

const OK = 200;
const INPUT_ERROR = 400;
const AUTH_ERROR = 403;

type AuthUserId = {output: {token: string, authUserId: number}, statusCode: number}
type ChannelId = {output: {channelId: number}, statusCode: number}
type messageId = {output: {messageId: number}, statusCode: number}
type Messages = {
  messageId: number,
  uId: number,
  message: string,
  timeSent: number,
  reacts: [],
  isPinned: boolean
}
type ChannelMessages = {
  output: {
    messages: Messages[],
    start: number,
    end: number
  },
  statusCode: number
}

afterAll(() => {
  requestClear();
});

requestClear();
const userRegister = requestRegister('michael@unsw.edu.au', 'password', 'Michael', 'Wang') as AuthUserId;
const userRegister1 = requestRegister('example@unsw.edu.au', 'password', 'example', 'user') as AuthUserId;
const channelCreate = requestCreate(userRegister.output.token, 'channel1', true) as ChannelId;
const channelInfo = requestCreate(userRegister.output.token, 'channel6', true) as ChannelId;
const messagesExpected: Messages[] = [];
for (let i = 0; i < 50; i++) {
  const message = requestSend(userRegister.output.token, channelCreate.output.channelId, `${i}`) as messageId;
  messagesExpected.unshift({
    messageId: message.output.messageId,
    uId: userRegister.output.authUserId,
    message: `${i}`,
    reacts: [],
    timeSent: expect.any(Number),
    isPinned: false
  });
}

describe('tests with 50 message', () => {
  test('testing for 50 messages in dm, where start is zero', () => {
    const channelMessages = requestMessages(userRegister.output.token, channelCreate.output.channelId, 0) as ChannelMessages;
    expect(channelMessages.output).toStrictEqual({ messages: messagesExpected, start: 0, end: 50 });
    expect(channelMessages.statusCode).toBe(OK);
  });
});

describe('tests with 70 message', () => {
  beforeAll(() => {
    for (let i = 50; i < 70; i++) {
      const message = requestSend(userRegister.output.token, channelCreate.output.channelId, `${i}`) as messageId;
      messagesExpected.unshift({
        messageId: message.output.messageId,
        uId: userRegister.output.authUserId,
        message: `${i}`,
        reacts: [],
        timeSent: expect.any(Number),
        isPinned: false
      });
    }
  });
  test('testing for seventy messages in dm, where start is 0 so the twenty oldest messages are ignored', () => {
    const messageArray = messagesExpected.slice(0, 50);
    const channelMessages = requestMessages(userRegister.output.token, channelCreate.output.channelId, 0) as ChannelMessages;
    expect(channelMessages.output).toStrictEqual({ messages: messageArray, start: 0, end: 50 });
    expect(channelMessages.statusCode).toBe(OK);
  });

  test('testing for seventy messages in dm, where start is 20 so the twenty newest messages are ignored', () => {
    const messageArray = messagesExpected.slice(20);
    const channelMessages = requestMessages(userRegister.output.token, channelCreate.output.channelId, 20) as ChannelMessages;
    expect(channelMessages.output).toStrictEqual({ messages: messageArray, start: 20, end: 70 });
    expect(channelMessages.statusCode).toBe(OK);
  });
});

describe('tests with 0 message', () => {
  test('no messages in channel', () => {
    const channelMessages = requestMessages(userRegister.output.token, channelInfo.output.channelId, 0) as ChannelMessages;
    expect(channelMessages.output).toStrictEqual({
      messages: [],
      start: 0,
      end: -1
    });
    expect(channelMessages.statusCode).toBe(OK);
  });

  test('channelId does not exist', () => {
    const channelMessages = requestMessages(userRegister.output.token, channelInfo.output.channelId + 100, 0) as ChannelMessages;
    expect(channelMessages.output).toStrictEqual({ error: { message: expect.any(String) } });
    expect(channelMessages.statusCode).toBe(INPUT_ERROR);
  });

  test('channelId valid but authorised user not in channel', () => {
    const channelMessages = requestMessages(userRegister1.output.token, channelInfo.output.channelId, 0) as ChannelMessages;
    expect(channelMessages.output).toStrictEqual({ error: { message: expect.any(String) } });
    expect(channelMessages.statusCode).toBe(AUTH_ERROR);
  });

  test('start is greater than total number of messages', () => {
    const invalidStart = 500;
    const channelMessages = requestMessages(userRegister.output.token, channelInfo.output.channelId, invalidStart) as ChannelMessages;
    expect(channelMessages.output).toStrictEqual({ error: { message: expect.any(String) } });
    expect(channelMessages.statusCode).toBe(INPUT_ERROR);
  });

  test('start is negative number', () => {
    const invalidStart = -1;
    const channelMessages = requestMessages(userRegister.output.token, channelInfo.output.channelId, invalidStart) as ChannelMessages;
    expect(channelMessages.output).toStrictEqual({ error: { message: expect.any(String) } });
    expect(channelMessages.statusCode).toBe(INPUT_ERROR);
  });

  test('token does not exist', () => {
    const channelMessages = requestMessages('', channelInfo.output.channelId, 0) as ChannelMessages;
    expect(channelMessages.output).toStrictEqual({ error: { message: expect.any(String) } });
    expect(channelMessages.statusCode).toBe(AUTH_ERROR);
  });
});

describe('tests with 2 message', () => {
  test('testing two messages in channel, where start is one and the most recent message is ignored', () => {
    const message1 = requestSend(userRegister.output.token, channelInfo.output.channelId, 'firstmessage') as messageId;
    requestSend(userRegister.output.token, channelInfo.output.channelId, 'secondmessage') as messageId;
    requestReact(userRegister.output.token, message1.output.messageId, 1);
    const channelMessages = requestMessages(userRegister.output.token, channelInfo.output.channelId, 1) as ChannelMessages;
    expect(channelMessages.output).toStrictEqual({
      messages: [
        {
          messageId: message1.output.messageId,
          uId: userRegister.output.authUserId,
          message: 'firstmessage',
          reacts: [{
            reactId: 1,
            uIds: [userRegister.output.authUserId],
            isThisUserReacted: true
          }],
          timeSent: expect.any(Number),
          isPinned: false
        },
      ],
      start: 1,
      end: -1,
    });

    expect(channelMessages.statusCode).toBe(OK);
  });

  test('testing for two messages in channel, where start is two so both messags are ignored', () => {
    const channelMessages = requestMessages(userRegister.output.token, channelInfo.output.channelId, 2) as ChannelMessages;
    expect(channelMessages.output).toStrictEqual({
      messages: [],
      start: 2,
      end: -1
    });
    expect(channelMessages.statusCode).toBe(OK);
  });
});
