import {
  requestRegister, requestCreate, requestDmCreate, requestClear,
  requestDmSend, requestSend, requestSearch
} from './testHelper';

const OK = 200;
const INPUT_ERROR = 400;
const AUTH_ERROR = 403;

type AuthUserId = {output: {token: string, authUserId: number}, statusCode: number}
type dmId = {output: {dmId: number}, statusCode: number}
type ChannelId = {output: {channelId: number}, statusCode: number}
type MessageId = {output: {messageId: number}, statusCode: number}

afterAll(() => {
  requestClear();
});

requestClear();
const userRegister = requestRegister('Michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
const userRegister2 = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
const userRegister3 = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
const channelCreate = requestCreate(userRegister.output.token, 'My Channel', true) as ChannelId;
const uIds = [userRegister2.output.authUserId];
const dmCreate = requestDmCreate(userRegister.output.token, uIds) as dmId;
const messageSend = requestSend(userRegister.output.token, channelCreate.output.channelId, 'Hi, this is a message') as MessageId;
const messageDmSend = requestDmSend(userRegister.output.token, dmCreate.output.dmId, 'Hi, this is a dm message') as MessageId;

describe('success', () => {
  test('successful search (no answer)', () => {
    const search = requestSearch(userRegister.output.token, 'new');
    expect(search.output).toStrictEqual({ messages: [] });
    expect(search.statusCode).toBe(OK);
  });

  test('successful search (1 answer)', () => {
    const search = requestSearch(userRegister2.output.token, 'message');
    expect(search.output).toStrictEqual({
      messages: [
        {
          messageId: messageDmSend.output.messageId,
          uId: userRegister.output.authUserId,
          message: 'Hi, this is a dm message',
          reacts: [],
          timeSent: expect.any(Number),
          isPinned: false
        }
      ]
    });
    expect(search.statusCode).toBe(OK);
  });

  test('successful search (multiple answer)', () => {
    const search = requestSearch(userRegister.output.token, 'message');
    expect(search.output).toStrictEqual({
      messages: [
        {
          messageId: messageSend.output.messageId,
          uId: userRegister.output.authUserId,
          message: 'Hi, this is a message',
          reacts: [],
          timeSent: expect.any(Number),
          isPinned: false
        },
        {
          messageId: messageDmSend.output.messageId,
          uId: userRegister.output.authUserId,
          message: 'Hi, this is a dm message',
          reacts: [],
          timeSent: expect.any(Number),
          isPinned: false
        }
      ]
    });
    expect(search.statusCode).toBe(OK);
  });

  test('successful search (answer exist but user is not a member)', () => {
    const search = requestSearch(userRegister3.output.token, 'new');
    expect(search.output).toStrictEqual({ messages: [] });
    expect(search.statusCode).toBe(OK);
  });
});

describe('fail', () => {
  test('length of queryStr is less than 1', () => {
    const search = requestSearch(userRegister.output.token, '');
    expect(search.output).toStrictEqual({ error: { message: expect.any(String) } });
    expect(search.statusCode).toBe(INPUT_ERROR);
  });

  test('length of queryStr is more than 1000', () => {
    const search = requestSearch(userRegister.output.token, 'aMessageWithALengthGreaterThanAThousandThatIsVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryLong');
    expect(search.output).toStrictEqual({ error: { message: expect.any(String) } });
    expect(search.statusCode).toBe(INPUT_ERROR);
  });

  test('invalid token', () => {
    const search = requestSearch(userRegister.output.token + 10, 'message');
    expect(search.output).toStrictEqual({ error: { message: expect.any(String) } });
    expect(search.statusCode).toBe(AUTH_ERROR);
  });
});
