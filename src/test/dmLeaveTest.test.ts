import { requestClear, requestRegister, requestDmCreate, requestDmDetails, requestDmLeave } from './testHelper';

const OK = 200;
const INPUT_ERROR = 400;
const AUTH_ERROR = 403;

type AuthUserId = {output: {token: string, authUserId: number}, statusCode: number}
type dmId = {output: {dmId: number}, statusCode: number}
type EMPTY = {output: Record<string, never>, statusCode: number}
type member = {uId: number, email: string, nameFirst: string, nameLast: string, handleStr: string}
type dmDetails = {output: {name: string, members: member[]}, statusCode: number}

beforeEach(() => {
  requestClear();
});

test('Testing successful leave with valid details as owner with members present', () => {
  const userRegister1 = requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const registerToken1 = userRegister1.output.token;
  const userRegister2 = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const userRegister3 = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const uIds = [userRegister2.output.authUserId, userRegister3.output.authUserId];
  const dmCreate = requestDmCreate(registerToken1, uIds) as dmId;
  const dmLeave = requestDmLeave(registerToken1, dmCreate.output.dmId) as EMPTY;
  const dmDetails = requestDmDetails(userRegister2.output.token, dmCreate.output.dmId) as dmDetails;
  expect(dmDetails.output.members.length).toStrictEqual(2);
  expect(dmLeave.statusCode).toBe(OK);
  expect(dmLeave.output).toStrictEqual({});
});

test('Testing successful leave with valid details as member with owner and other members present', () => {
  const userRegister1 = requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const registerToken1 = userRegister1.output.token;
  const userRegister2 = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const registerToken2 = userRegister2.output.token;
  const userRegister3 = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const uIds = [userRegister2.output.authUserId, userRegister3.output.authUserId];
  const dmCreate = requestDmCreate(registerToken1, uIds) as dmId;
  const dmLeave = requestDmLeave(registerToken2, dmCreate.output.dmId) as EMPTY;
  const dmDetails = requestDmDetails(registerToken1, dmCreate.output.dmId) as dmDetails;
  expect(dmDetails.output.members.length).toStrictEqual(2);
  expect(dmLeave.statusCode).toBe(OK);
  expect(dmLeave.output).toStrictEqual({});
});

test('Testing unsuccessful leave with invalid dmId', () => {
  const userRegister = requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const registerToken = userRegister.output.token;
  const userRegister1 = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const uIds = [userRegister1.output.authUserId];
  const dmCreate = requestDmCreate(registerToken, uIds) as dmId;
  const dmLeave = requestDmLeave(registerToken, dmCreate.output.dmId + 1) as EMPTY;
  expect(dmLeave.statusCode).toBe(INPUT_ERROR);
  expect(dmLeave.output).toStrictEqual({ error: { message: expect.any(String) } });
});

test('Testing unsuccessful leave with a member who is not in the DM', () => {
  const userRegister = requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const registerToken = userRegister.output.token;
  const userRegister1 = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const userRegister2 = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const registerToken2 = userRegister2.output.token;
  const uIds = [userRegister1.output.authUserId];
  const dmCreate = requestDmCreate(registerToken, uIds) as dmId;
  const dmLeave = requestDmLeave(registerToken2, dmCreate.output.dmId) as EMPTY;
  expect(dmLeave.statusCode).toBe(AUTH_ERROR);
  expect(dmLeave.output).toStrictEqual({ error: { message: expect.any(String) } });
});

test('Testing unsuccessful leave with invalid token', () => {
  const userRegister = requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const registerToken = userRegister.output.token;
  const userRegister1 = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const invalidToken = 'invalid';
  const uIds = [userRegister1.output.authUserId];
  const dmCreate = requestDmCreate(registerToken, uIds) as dmId;
  const dmLeave = requestDmLeave(invalidToken, dmCreate.output.dmId) as EMPTY;
  expect(dmLeave.statusCode).toBe(AUTH_ERROR);
  expect(dmLeave.output).toStrictEqual({ error: { message: expect.any(String) } });
});

test('Testing leave as owner and only member', () => {
  const userRegister = requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const registerToken = userRegister.output.token;
  requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const uIds:number[] = [];
  const dmCreate = requestDmCreate(registerToken, uIds) as dmId;
  const dmLeave = requestDmLeave(registerToken, dmCreate.output.dmId) as EMPTY;
  expect(dmLeave.statusCode).toBe(OK);
  expect(dmLeave.output).toStrictEqual({});
});

test('Testing leave as owner and new owner is assigned', () => {
  const userRegister = requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const registerToken = userRegister.output.token;
  const userRegister1 = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const uIds = [userRegister1.output.authUserId];
  const dmCreate = requestDmCreate(registerToken, uIds) as dmId;
  const dmLeave = requestDmLeave(registerToken, dmCreate.output.dmId) as EMPTY;
  expect(dmLeave.statusCode).toBe(OK);
  expect(dmLeave.output).toStrictEqual({});
});
