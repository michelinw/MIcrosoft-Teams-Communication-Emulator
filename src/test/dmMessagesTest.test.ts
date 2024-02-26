import { requestRegister, requestDmCreate, requestDmSend, requestClear, requestDmMessages, requestReact } from './testHelper';

const OK = 200;
const INPUT_ERROR = 400;
const AUTH_ERROR = 403;

type AuthUserId = {output: {token: string, authUserId: number}, statusCode: number}
type dmId = {output: {dmId: number}, statusCode: number}
type messageId = {output: {messageId: number}, statusCode: number}
type Reacts = {reactId: number, uIds: any[], isThisUserReacted: boolean};
type Messages = {messageId: number, uId: number, message: string, timeSent: number, reacts: Reacts[], isPinned: boolean}
type dmMessages = {
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
const userRegister2 = requestRegister('alan@unsw.edu.au', 'password', 'Alan', 'Hattom') as AuthUserId;
const userRegister3 = requestRegister('cecilia@unsw.edu.au', 'password', 'Cecilia', 'Le') as AuthUserId;
const uIds = [userRegister2.output.authUserId];
const dmCreate = requestDmCreate(userRegister.output.token, uIds) as dmId;
const dmCreate1 = requestDmCreate(userRegister.output.token, uIds) as dmId;
const messagesExpected: Messages[] = [];
for (let i = 0; i < 50; i++) {
  const message = requestDmSend(userRegister.output.token, dmCreate1.output.dmId, `${i}`) as messageId;
  messagesExpected.unshift({
    messageId: message.output.messageId,
    uId: userRegister.output.authUserId,
    message: `${i}`,
    reacts: [],
    timeSent: expect.any(Number),
    isPinned: false
  });
}

describe('test with 50 messages', () => {
  test('testing for 50 messages in dm, where start is zero', () => {
    const dmMessages = requestDmMessages(userRegister.output.token, dmCreate1.output.dmId, 0) as dmMessages;
    expect(dmMessages.output).toStrictEqual({ messages: messagesExpected, start: 0, end: 50 });
    expect(dmMessages.statusCode).toBe(OK);
  });
});

describe('testing for 70 messages', () => {
  beforeAll(() => {
    for (let i = 50; i < 70; i++) {
      const message = requestDmSend(userRegister.output.token, dmCreate1.output.dmId, `${i}`) as messageId;
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
    const newExpected = { messages: messageArray, start: 0, end: 50 };
    const dmMessages = requestDmMessages(userRegister.output.token, dmCreate1.output.dmId, 0) as dmMessages;
    expect(dmMessages.output).toStrictEqual(newExpected);
    expect(dmMessages.statusCode).toBe(OK);
  });

  test('testing for seventy messages in dm, where start is 20 so the twenty newest messages are ignored', () => {
    const messageArray: Messages[] = messagesExpected.slice(20);
    const newExpected = { messages: messageArray, start: 20, end: 70 };
    const dmMessages = requestDmMessages(userRegister.output.token, dmCreate1.output.dmId, 20) as dmMessages;
    expect(dmMessages.output).toStrictEqual(newExpected);
    expect(dmMessages.statusCode).toBe(OK);
  });
});

describe('tests with no messages', () => {
  test('testing when no messages are in the dm', () => {
    const dmMessages = requestDmMessages(userRegister.output.token, dmCreate.output.dmId, 0) as dmMessages;
    expect(dmMessages.output).toStrictEqual({
      messages: [],
      start: 0,
      end: -1
    });
    expect(dmMessages.statusCode).toBe(OK);
  });

  test('given dmId does not exist', () => {
    const dmMessages = requestDmMessages(userRegister.output.token, dmCreate.output.dmId + 100, 0) as dmMessages;
    expect(dmMessages.output).toStrictEqual({ error: { message: expect.any(String) } });
    expect(dmMessages.statusCode).toBe(INPUT_ERROR);
  });

  test('dmId is valid but the authorised user not in the dm', () => {
    const dmMessages = requestDmMessages(userRegister3.output.token, dmCreate.output.dmId, 0) as dmMessages;
    expect(dmMessages.output).toStrictEqual({ error: { message: expect.any(String) } });
    expect(dmMessages.statusCode).toBe(AUTH_ERROR);
  });

  test('start greater than total messages', () => {
    const invalidstart = 500;
    const dmMessages = requestDmMessages(userRegister.output.token, dmCreate.output.dmId, invalidstart) as dmMessages;
    expect(dmMessages.output).toStrictEqual({ error: { message: expect.any(String) } });
    expect(dmMessages.statusCode).toBe(INPUT_ERROR);
  });

  test('start is a negative number', () => {
    const invalidstart = -2;
    const dmMessages = requestDmMessages(userRegister.output.token, dmCreate.output.dmId, invalidstart) as dmMessages;
    expect(dmMessages.output).toStrictEqual({ error: { message: expect.any(String) } });
    expect(dmMessages.statusCode).toBe(INPUT_ERROR);
  });

  test('token does not exist', () => {
    const invalidToken = 'invalidToken';
    const dmMessages = requestDmMessages(invalidToken, dmCreate.output.dmId, 0) as dmMessages;
    expect(dmMessages.output).toStrictEqual({ error: { message: expect.any(String) } });
    expect(dmMessages.statusCode).toBe(AUTH_ERROR);
  });
});

describe('test with 2 messages', () => {
  test('testing two messages in dm, where start is one and the most recent message is ignored', () => {
    const messageId1 = requestDmSend(userRegister.output.token, dmCreate.output.dmId, 'firstmessage') as messageId;
    requestDmSend(userRegister2.output.token, dmCreate.output.dmId, 'secondmessage') as messageId;
    requestReact(userRegister.output.token, messageId1.output.messageId, 1);
    const dmMessages = requestDmMessages(userRegister.output.token, dmCreate.output.dmId, 1) as dmMessages;
    expect(dmMessages.output).toStrictEqual({
      messages: [
        {
          messageId: messageId1.output.messageId,
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

    expect(dmMessages.statusCode).toBe(OK);
  });

  test('testing for two messages in dm, where start is two so both messags are ignored', () => {
    const dmMessages = requestDmMessages(userRegister.output.token, dmCreate.output.dmId, 2) as dmMessages;
    expect(dmMessages.output).toStrictEqual({ messages: [], start: 2, end: -1 });
    expect(dmMessages.statusCode).toBe(OK);
  });
});
