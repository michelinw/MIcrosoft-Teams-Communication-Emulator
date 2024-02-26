import {
  requestClear, requestRegister, requestCreate, requestSend, requestLeave,
  requestJoin, requestDmSend, requestDmCreate, requestEdit
} from './testHelper';

const OK = 200;
const INPUT_ERROR = 400;
const AUTH_ERROR = 403;

type AuthUserId = {output: {token: string, authUserId: number}, statusCode: number}
type ChannelId = {output: {channelId: number}, statusCode: number}
type dmId = {output: {dmId: number}, statusCode: number}

beforeEach(() => {
  requestClear();
});

describe('Editing channel messages', () => {
  test('Testing editing a valid message', () => {
    const userRegister = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
    const channelCreate = requestCreate(userRegister.output.token, 'My Channel', true) as ChannelId;
    const messageSend = requestSend(userRegister.output.token, channelCreate.output.channelId, 'Hi, this is a message');
    const messageEdit = requestEdit(userRegister.output.token, messageSend.output.messageId, 'Hi, this is another message');
    expect(messageEdit.output).toStrictEqual({});
    expect(messageEdit.statusCode).toBe(OK);
  });

  test('Testing editing an existing message in a channel the user is not part of', () => {
    const userRegister = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
    const channelCreate = requestCreate(userRegister.output.token, 'My Channel', true) as ChannelId;
    const messageSend = requestSend(userRegister.output.token, channelCreate.output.channelId, 'Hi, this is a message');
    requestLeave(userRegister.output.token, channelCreate.output.channelId);
    const messageEdit = requestEdit(userRegister.output.token, messageSend.output.messageId, 'Hi, this is another message');
    expect(messageEdit.output).toStrictEqual({ error: { message: expect.any(String) } });
    expect(messageEdit.statusCode).toBe(AUTH_ERROR);
  });

  test('Testing editing an invalid message', () => {
    const userRegister = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
    const channelCreate = requestCreate(userRegister.output.token, 'My Channel', true) as ChannelId;
    const messageSend = requestSend(userRegister.output.token, channelCreate.output.channelId, 'Hi, this is a message');
    const messageEdit = requestEdit(userRegister.output.token, messageSend.output.messageId + 1, 'Hi, this is another message');
    expect(messageEdit.output).toStrictEqual({ error: { message: expect.any(String) } });
    expect(messageEdit.statusCode).toBe(INPUT_ERROR);
  });

  test('Testing deleting a message', () => {
    const userRegister = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
    const channelCreate = requestCreate(userRegister.output.token, 'My Channel', true) as ChannelId;
    const messageSend = requestSend(userRegister.output.token, channelCreate.output.channelId, 'Hi, this is a message');
    const messageEdit = requestEdit(userRegister.output.token, messageSend.output.messageId, '');
    expect(messageEdit.output).toStrictEqual({});
    expect(messageEdit.statusCode).toBe(OK);
  });

  test('Testing changing to a message with length of 1001 characters', () => {
    const userRegister = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
    const channelCreate = requestCreate(userRegister.output.token, 'My Channel', true) as ChannelId;
    const messageSend = requestSend(userRegister.output.token, channelCreate.output.channelId, 'Hi, this is a message');
    const messageEdit = requestEdit(userRegister.output.token, messageSend.output.messageId, 'aMessageWithALengthGreaterThanAThousandThatIsVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryLong');
    expect(messageEdit.output).toStrictEqual({ error: { message: expect.any(String) } });
    expect(messageEdit.statusCode).toBe(INPUT_ERROR);
  });

  test('Testing editing a message with invalid token', () => {
    const userRegister = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
    const channelCreate = requestCreate(userRegister.output.token, 'My Channel', true) as ChannelId;
    const messageSend = requestSend(userRegister.output.token, channelCreate.output.channelId, 'Hi, this is a message');
    const messageEdit = requestEdit('', messageSend.output.messageId, 'Hi, this is another message');
    expect(messageEdit.output).toStrictEqual({ error: { message: expect.any(String) } });
    expect(messageEdit.statusCode).toBe(AUTH_ERROR);
  });

  test('Testing editing a message that a user did not send', () => {
    const userRegister = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
    const userRegister2 = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
    const channelCreate = requestCreate(userRegister.output.token, 'My Channel', true) as ChannelId;
    const messageSend = requestSend(userRegister.output.token, channelCreate.output.channelId, 'Hi, this is a message');
    const messageEdit = requestEdit(userRegister2.output.token, messageSend.output.messageId, 'Hi, this is another message');
    expect(messageEdit.output).toStrictEqual({ error: { message: expect.any(String) } });
    expect(messageEdit.statusCode).toBe(AUTH_ERROR);
  });

  test('Testing editing a message that a user did not send but they are the channel owner', () => {
    const userRegister = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
    const userRegister2 = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
    const channelCreate = requestCreate(userRegister2.output.token, 'My Channel', true) as ChannelId;
    requestJoin(userRegister.output.token, channelCreate.output.channelId);
    const messageSend = requestSend(userRegister.output.token, channelCreate.output.channelId, 'Hi, this is a message');
    const messageEdit = requestEdit(userRegister2.output.token, messageSend.output.messageId, 'Hi, this is another message');
    expect(messageEdit.output).toStrictEqual({});

    expect(messageEdit.statusCode).toBe(OK);
  });

  test('Testing editing a message that a user did not send but they are a global owner', () => {
    const userRegister = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
    const userRegister2 = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
    const channelCreate = requestCreate(userRegister2.output.token, 'My Channel', true) as ChannelId;
    requestJoin(userRegister.output.token, channelCreate.output.channelId);
    const messageSend = requestSend(userRegister2.output.token, channelCreate.output.channelId, 'Hi, this is a message');
    const messageEdit = requestEdit(userRegister.output.token, messageSend.output.messageId, 'Hi, this is another message');
    expect(messageEdit.output).toStrictEqual({});
    expect(messageEdit.statusCode).toBe(OK);
  });
});

describe('Editing dm messages', () => {
  test('Testing editing a valid message', () => {
    const userRegister1 = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
    const registerToken = userRegister1.output.token;
    const uIds:number[] = [];
    const dmCreate = requestDmCreate(registerToken, uIds) as dmId;
    const messageSend = requestDmSend(userRegister1.output.token, dmCreate.output.dmId, 'Hi, this is a message');
    const messageEdit = requestEdit(userRegister1.output.token, messageSend.output.messageId, 'Hi, this is another message');
    expect(messageEdit.output).toStrictEqual({});
    expect(messageEdit.statusCode).toBe(OK);
  });

  test('Testing editing an existing message in a dm the user is not part of', () => {
    const userRegister1 = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
    const userRegister2 = requestRegister('Michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
    const registerToken = userRegister1.output.token;
    const uIds:number[] = [];
    const dmCreate = requestDmCreate(registerToken, uIds) as dmId;
    const messageSend = requestDmSend(userRegister1.output.token, dmCreate.output.dmId, 'Hi, this is a message');
    const messageEdit = requestEdit(userRegister2.output.token, messageSend.output.messageId, 'Hi, this is another message23');
    expect(messageEdit.output).toStrictEqual({ error: { message: expect.any(String) } });
    expect(messageEdit.statusCode).toBe(AUTH_ERROR);
  });

  test('Testing editing an invalid message', () => {
    const userRegister1 = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
    const registerToken = userRegister1.output.token;
    const uIds:number[] = [];
    const dmCreate = requestDmCreate(registerToken, uIds) as dmId;
    const messageSend = requestDmSend(userRegister1.output.token, dmCreate.output.dmId, 'Hi, this is a message');
    const messageEdit = requestEdit(userRegister1.output.token, messageSend.output.messageId + 1, 'Hi, this is another message');
    expect(messageEdit.output).toStrictEqual({ error: { message: expect.any(String) } });
    expect(messageEdit.statusCode).toBe(INPUT_ERROR);
  });

  test('Testing deleting a message', () => {
    const userRegister1 = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
    const registerToken = userRegister1.output.token;
    const uIds:number[] = [];
    const dmCreate = requestDmCreate(registerToken, uIds) as dmId;
    const messageSend = requestDmSend(userRegister1.output.token, dmCreate.output.dmId, 'Hi, this is a message');
    const messageEdit = requestEdit(userRegister1.output.token, messageSend.output.messageId, '');
    expect(messageEdit.output).toStrictEqual({});
    expect(messageEdit.statusCode).toBe(OK);
  });

  test('Testing changing to a message with length of 1001 characters', () => {
    const userRegister1 = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
    const registerToken = userRegister1.output.token;
    const uIds:number[] = [];
    const dmCreate = requestDmCreate(registerToken, uIds) as dmId;
    const messageSend = requestDmSend(userRegister1.output.token, dmCreate.output.dmId, 'Hi, this is a message');
    const messageEdit = requestEdit(userRegister1.output.token, messageSend.output.messageId, 'aMessageWithALengthGreaterThanAThousandThatIsVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryLong');
    expect(messageEdit.output).toStrictEqual({ error: { message: expect.any(String) } });
    expect(messageEdit.statusCode).toBe(INPUT_ERROR);
  });

  test('Testing editing a message with invalid token', () => {
    const userRegister1 = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
    const registerToken = userRegister1.output.token;
    const uIds:number[] = [];
    const dmCreate = requestDmCreate(registerToken, uIds) as dmId;
    const messageSend = requestDmSend(userRegister1.output.token, dmCreate.output.dmId, 'Hi, this is a message');
    const messageEdit = requestEdit('', messageSend.output.messageId, 'Hi, this is another message');
    expect(messageEdit.output).toStrictEqual({ error: { message: expect.any(String) } });
    expect(messageEdit.statusCode).toBe(AUTH_ERROR);
  });

  test('Testing editing a message that a user did not send', () => {
    const userRegister1 = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
    const registerToken = userRegister1.output.token;
    const userRegister2 = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
    const uIds = [userRegister2.output.authUserId];
    const dmCreate = requestDmCreate(registerToken, uIds) as dmId;
    const messageSend = requestDmSend(userRegister1.output.token, dmCreate.output.dmId, 'Hi, this is a message');
    const messageEdit = requestEdit(userRegister2.output.token, messageSend.output.messageId, 'Hi, this is another message');
    expect(messageEdit.output).toStrictEqual({ error: { message: expect.any(String) } });
    expect(messageEdit.statusCode).toBe(AUTH_ERROR);
  });

  test('Testing editing a message that a user did not send but they are the channel owner', () => {
    const userRegister1 = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
    const registerToken = userRegister1.output.token;
    const userRegister2 = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
    const uIds = [userRegister2.output.authUserId];
    const dmCreate = requestDmCreate(registerToken, uIds) as dmId;
    const messageSend = requestDmSend(userRegister2.output.token, dmCreate.output.dmId, 'Hi, this is a message');
    const messageEdit = requestEdit(userRegister1.output.token, messageSend.output.messageId, 'Hi, this is another message');
    expect(messageEdit.output).toStrictEqual({});
    expect(messageEdit.statusCode).toBe(OK);
  });

  test('Testing editing a message that a user did not send but they are a global owner', () => {
    const user = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
    const userTwo = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
    const dm = requestDmCreate(userTwo.output.token, [user.output.authUserId]) as dmId;
    const messageSend = requestDmSend(userTwo.output.token, dm.output.dmId, 'Hi, this is a message');
    const messageEdit = requestEdit(user.output.token, messageSend.output.messageId, 'Hi, this is another message');
    expect(messageEdit.output).toStrictEqual({ error: { message: expect.any(String) } });
    expect(messageEdit.statusCode).toBe(AUTH_ERROR);
  });
});
