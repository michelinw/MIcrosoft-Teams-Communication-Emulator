import {
  requestClear, requestRegister, requestDmCreate, requestSendLaterDm,
  requestDmMessages, requestDmRemove, requestDmList
} from './testHelper';

const OK = 200;
const INPUT_ERROR_400 = 400;
const INPUT_ERROR_403 = 403;

type AuthUserId = {output: {token: string, authUserId: number}, statusCode: number}
type dmId = {output: {dmId: number}, statusCode: number}
type MessageId = {output: {messageId: number}, statusCode: number}
type Messages = {messageId: number, uId: number, message: string, timeSent: number, react: [], isPinned: boolean}
type dmList = {output: {dmList: Array<{dmId: number, name: string}>}, statusCode: number}

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
const userRegister = requestRegister('Michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
const userRegister2 = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
const userRegister3 = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
const uIds = [userRegister2.output.authUserId];
const dmCreate = requestDmCreate(userRegister.output.token, uIds) as dmId;

describe('success', () => {
  test('Testing send later', () => {
    const timeSent = Math.floor((new Date()).getTime() / 1000) + 2;
    const sendlater = requestSendLaterDm(userRegister.output.token, dmCreate.output.dmId, 'message', timeSent) as MessageId;

    expect(sendlater.output).toStrictEqual({ messageId: expect.any(Number) });
    expect(sendlater.statusCode).toBe(OK);

    let timeNow = Math.floor((new Date()).getTime() / 1000);
    while (timeSent + 1 > timeNow) {
      timeNow = Math.floor((new Date()).getTime() / 1000);
    }
    const dmMessages = requestDmMessages(userRegister.output.token, dmCreate.output.dmId, 0) as dmMessages;
    expect(dmMessages.output).toStrictEqual({
      messages: [
        {
          messageId: sendlater.output.messageId,
          uId: userRegister.output.authUserId,
          message: 'message',
          reacts: [],
          timeSent: timeSent,
          isPinned: false
        },
      ],
      start: 0,
      end: -1
    });
    expect(dmMessages.statusCode).toBe(OK);
  });
});

describe('fail', () => {
  test('Testing send later with invalid dm', () => {
    const timeSent = Math.floor((new Date()).getTime() / 1000) + 2;
    const sendlater = requestSendLaterDm(userRegister.output.token, dmCreate.output.dmId + 1, 'message', timeSent) as MessageId;
    expect(sendlater.output).toStrictEqual({ error: { message: expect.any(String) } });
    expect(sendlater.statusCode).toBe(INPUT_ERROR_400);
  });

  test('Testing send later with too short message', () => {
    const timeSent = Math.floor((new Date()).getTime() / 1000) + 2;
    const sendlater = requestSendLaterDm(userRegister.output.token, dmCreate.output.dmId, '', timeSent) as MessageId;
    expect(sendlater.output).toStrictEqual({ error: { message: expect.any(String) } });
    expect(sendlater.statusCode).toBe(INPUT_ERROR_400);
  });

  test('Testing send later with too long message', () => {
    const timeSent = Math.floor((new Date()).getTime() / 1000) + 2;
    const sendlater = requestSendLaterDm(userRegister.output.token, dmCreate.output.dmId, 'aMessageWithALengthGreaterThanAThousandThatIsVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryLong', timeSent) as MessageId;
    expect(sendlater.output).toStrictEqual({ error: { message: expect.any(String) } });
    expect(sendlater.statusCode).toBe(INPUT_ERROR_400);
  });

  test('Testing send later with timeSent in the past', () => {
    const timeSent = Math.floor((new Date()).getTime() / 1000) - 2;
    const sendlater = requestSendLaterDm(userRegister.output.token, dmCreate.output.dmId, 'message', timeSent) as MessageId;
    expect(sendlater.output).toStrictEqual({ error: { message: expect.any(String) } });
    expect(sendlater.statusCode).toBe(INPUT_ERROR_400);
  });

  test('Testing send later with valid dm but not a member', () => {
    const timeSent = Math.floor((new Date()).getTime() / 1000) + 2;
    const sendlater = requestSendLaterDm(userRegister3.output.token, dmCreate.output.dmId, 'message', timeSent) as MessageId;
    expect(sendlater.output).toStrictEqual({ error: { message: expect.any(String) } });
    expect(sendlater.statusCode).toBe(INPUT_ERROR_403);
  });

  test('Testing send later with invalid token', () => {
    const timeSent = Math.floor((new Date()).getTime() / 1000) + 2;
    const sendlater = requestSendLaterDm(userRegister2.output.token + 100, dmCreate.output.dmId, 'message', timeSent) as MessageId;
    expect(sendlater.output).toStrictEqual({ error: { message: expect.any(String) } });
    expect(sendlater.statusCode).toBe(INPUT_ERROR_403);
  });

  test('Testing send later with valid details but dm is removed', () => {
    const timeSent = Math.floor((new Date()).getTime() / 1000) + 2;
    const sendlater = requestSendLaterDm(userRegister.output.token, dmCreate.output.dmId, 'message', timeSent) as MessageId;
    requestDmRemove(userRegister.output.token, dmCreate.output.dmId);
    expect(sendlater.output).toStrictEqual({ messageId: expect.any(Number) });
    expect(sendlater.statusCode).toBe(OK);

    let timeNow = Math.floor((new Date()).getTime() / 1000);
    while (timeSent + 1 > timeNow) {
      timeNow = Math.floor((new Date()).getTime() / 1000);
    }
    const dmList = requestDmList(userRegister.output.token) as dmList;
    expect(dmList.statusCode).toBe(OK);
    expect(dmList.output).toStrictEqual({ dms: [] });
  });
});
