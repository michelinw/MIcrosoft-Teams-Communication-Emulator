import { requestClear, requestRegister, requestDmCreate, requestDmSend } from './testHelper';

const OK = 200;
const INPUT_ERROR = 400;
const AUTH_ERROR = 403;

beforeEach(() => {
  requestClear();
});

type AuthUserId = {output: {token: string, authUserId: number}, statusCode: number}
type dmId = {output: {dmId: number}, statusCode: number}
type MessageId = {output: {messageId: number}, statusCode: number}

test('Testing sending a valid message in DM as owner', () => {
  const userRegister = requestRegister('Michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const userRegister2 = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const uIds = [userRegister2.output.authUserId];
  const dmCreate = requestDmCreate(userRegister.output.token, uIds) as dmId;
  const messageDmSend = requestDmSend(userRegister.output.token, dmCreate.output.dmId, 'Test message 1, 2, 3') as MessageId;
  expect(messageDmSend.output).toStrictEqual({ messageId: expect.any(Number) });
  expect(messageDmSend.statusCode).toBe(OK);
});

test('Testing sending a valid message in DM as member', () => {
  const userRegister = requestRegister('Michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const userRegister2 = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const uIds = [userRegister2.output.authUserId];
  const dmCreate = requestDmCreate(userRegister.output.token, uIds) as dmId;
  const messageDmSend = requestDmSend(userRegister2.output.token, dmCreate.output.dmId, 'Test message 1, 2, 3') as MessageId;
  expect(messageDmSend.output).toStrictEqual({ messageId: expect.any(Number) });
  expect(messageDmSend.statusCode).toBe(OK);
});

test('Testing sending a message to an invalid DM', () => {
  const userRegister = requestRegister('Michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const userRegister2 = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const uIds = [userRegister2.output.authUserId];
  const dmCreate = requestDmCreate(userRegister.output.token, uIds) as dmId;
  const messageDmSend = requestDmSend(userRegister.output.token, dmCreate.output.dmId + 1, 'Test message 1, 2, 3') as MessageId;
  expect(messageDmSend.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(messageDmSend.statusCode).toBe(INPUT_ERROR);
});

test('Testing sending an empty message', () => {
  const userRegister = requestRegister('Michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const userRegister2 = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const uIds = [userRegister2.output.authUserId];
  const dmCreate = requestDmCreate(userRegister.output.token, uIds) as dmId;
  const messageDmSend = requestDmSend(userRegister.output.token, dmCreate.output.dmId, '') as MessageId;
  expect(messageDmSend.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(messageDmSend.statusCode).toBe(INPUT_ERROR);
});

test('Testing sending a message of length 1', () => {
  const userRegister = requestRegister('Michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const userRegister2 = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const uIds = [userRegister2.output.authUserId];
  const dmCreate = requestDmCreate(userRegister.output.token, uIds) as dmId;
  const messageDmSend = requestDmSend(userRegister.output.token, dmCreate.output.dmId, 'A') as MessageId;
  expect(messageDmSend.output).toStrictEqual({ messageId: expect.any(Number) });
  expect(messageDmSend.statusCode).toBe(OK);
});

test('Testing sending a message of length 1001 exceeding max length', () => {
  const userRegister = requestRegister('Michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const userRegister2 = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const uIds = [userRegister2.output.authUserId];
  const dmCreate = requestDmCreate(userRegister.output.token, uIds) as dmId;
  const messageDmSend = requestDmSend(userRegister.output.token, dmCreate.output.dmId, 'aMessageWithALengthGreaterThanAThousandThatIsVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryLong') as MessageId;
  expect(messageDmSend.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(messageDmSend.statusCode).toBe(INPUT_ERROR);
});

test('Testing sending a message of length 999', () => {
  const userRegister = requestRegister('Michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const userRegister2 = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const uIds = [userRegister2.output.authUserId];
  const dmCreate = requestDmCreate(userRegister.output.token, uIds) as dmId;
  const messageDmSend = requestDmSend(userRegister.output.token, dmCreate.output.dmId, 'AaMessageWithALengthlessThanAThousandThatIsVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryLong') as MessageId;
  expect(messageDmSend.output).toStrictEqual({ messageId: expect.any(Number) });
  expect(messageDmSend.statusCode).toBe(OK);
});

test('Testing sending a message to a valid dm but not a member', () => {
  const userRegister = requestRegister('Michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const userRegister2 = requestRegister('Alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const userRegister3 = requestRegister('cecilia@unsw.ed.uau', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const uIds = [userRegister2.output.authUserId];
  const dmCreate = requestDmCreate(userRegister.output.token, uIds) as dmId;
  const messageDmSend = requestDmSend(userRegister3.output.token, dmCreate.output.dmId, 'Hi, this is a message') as MessageId;
  expect(messageDmSend.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(messageDmSend.statusCode).toBe(AUTH_ERROR);
});

test('Testing sending a message with invalid token', () => {
  const userRegister = requestRegister('Michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const userRegister2 = requestRegister('Alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const invalidToken = 'invalidToken';
  const uIds = [userRegister2.output.authUserId];
  const dmCreate = requestDmCreate(userRegister.output.token, uIds) as dmId;
  const messageDmSend = requestDmSend(invalidToken, dmCreate.output.dmId, 'Hi, this is a message') as MessageId;
  expect(messageDmSend.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(messageDmSend.statusCode).toBe(AUTH_ERROR);
});
