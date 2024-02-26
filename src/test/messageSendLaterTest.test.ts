import { requestClear, requestRegister, requestCreate, requestSendLater, requestMessages } from './testHelper';

const OK = 200;
const INPUT_ERROR_400 = 400;
const INPUT_ERROR_403 = 403;

type AuthUserId = {output: {token: string, authUserId: number}, statusCode: number}
type ChannelId = {output: {channelId: number}, statusCode: number}
type MessageId = {output: {messageId: number}, statusCode: number}
type Messages = {
  messageId: number,
  uId: number,
  message: string,
  timeSent: number
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
const userRegister = requestRegister('Michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
const userRegister2 = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
const channelCreate = requestCreate(userRegister.output.token, 'My Channel', true) as ChannelId;

describe('success', () => {
  test('Testing send later', () => {
    const timeSent = Math.floor((new Date()).getTime() / 1000) + 2;
    const sendlater = requestSendLater(userRegister.output.token, channelCreate.output.channelId, 'message', timeSent) as MessageId;

    expect(sendlater.output).toStrictEqual({ messageId: expect.any(Number) });
    expect(sendlater.statusCode).toBe(OK);

    let timeNow = Math.floor((new Date()).getTime() / 1000);
    while (timeSent + 1 > timeNow) {
      timeNow = Math.floor((new Date()).getTime() / 1000);
    }
    const channelMessages = requestMessages(userRegister.output.token, channelCreate.output.channelId, 0) as ChannelMessages;
    expect(channelMessages.output).toStrictEqual({
      messages: [{
        messageId: sendlater.output.messageId,
        uId: userRegister.output.authUserId,
        isPinned: false,
        message: 'message',
        timeSent: timeSent,
        reacts: [],
      }],
      start: 0,
      end: -1
    });
    expect(channelMessages.statusCode).toBe(OK);
  });
});

describe('fail', () => {
  test('Testing send later with invalid channel', () => {
    const timeSent = Math.floor((new Date()).getTime() / 1000) + 2;
    const sendlater = requestSendLater(userRegister.output.token, channelCreate.output.channelId + 1, 'message', timeSent) as MessageId;
    expect(sendlater.output).toStrictEqual({ error: { message: expect.any(String) } });
    expect(sendlater.statusCode).toBe(INPUT_ERROR_400);
  });

  test('Testing send later with too short message', () => {
    const timeSent = Math.floor((new Date()).getTime() / 1000) + 2;
    const sendlater = requestSendLater(userRegister.output.token, channelCreate.output.channelId, '', timeSent) as MessageId;
    expect(sendlater.output).toStrictEqual({ error: { message: expect.any(String) } });
    expect(sendlater.statusCode).toBe(INPUT_ERROR_400);
  });

  test('Testing send later with too long message', () => {
    const timeSent = Math.floor((new Date()).getTime() / 1000) + 2;
    const sendlater = requestSendLater(userRegister.output.token, channelCreate.output.channelId, 'aMessageWithALengthGreaterThanAThousandThatIsVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryLong', timeSent) as MessageId;
    expect(sendlater.output).toStrictEqual({ error: { message: expect.any(String) } });
    expect(sendlater.statusCode).toBe(INPUT_ERROR_400);
  });

  test('Testing send later with timeSent in the past', () => {
    const timeSent = Math.floor((new Date()).getTime() / 1000) - 2;
    const sendlater = requestSendLater(userRegister.output.token, channelCreate.output.channelId, 'message', timeSent) as MessageId;
    expect(sendlater.output).toStrictEqual({ error: { message: expect.any(String) } });
    expect(sendlater.statusCode).toBe(INPUT_ERROR_400);
  });

  test('Testing send later with valid channel but not a member', () => {
    const timeSent = Math.floor((new Date()).getTime() / 1000) + 2;
    const sendlater = requestSendLater(userRegister2.output.token, channelCreate.output.channelId, 'message', timeSent) as MessageId;
    expect(sendlater.output).toStrictEqual({ error: { message: expect.any(String) } });
    expect(sendlater.statusCode).toBe(INPUT_ERROR_403);
  });

  test('Testing send later with invalid token', () => {
    const timeSent = Math.floor((new Date()).getTime() / 1000) + 2;
    const sendlater = requestSendLater(userRegister2.output.token + 100, channelCreate.output.channelId, 'message', timeSent) as MessageId;
    expect(sendlater.output).toStrictEqual({ error: { message: expect.any(String) } });
    expect(sendlater.statusCode).toBe(INPUT_ERROR_403);
  });
});
