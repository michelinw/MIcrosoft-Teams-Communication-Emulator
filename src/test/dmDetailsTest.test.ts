import { requestRegister, requestDmCreate, requestClear, requestDmDetails } from './testHelper';

const OK = 200;
const INPUT_ERROR = 400;
const AUTH_ERROR = 403;

beforeEach(() => {
  requestClear();
});

type AuthUserId = {output: {token: string, authUserId: number}, statusCode: number}
type dmId = {output: {dmId: number}, statusCode: number}
type member = {uId: number, email: string, nameFirst: string, nameLast: string, handleStr: string}
type dmDetails = {output: {name: string, members: member[]}, statusCode: number}

test('Testing valid details', () => {
  const userRegister1 = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const registerToken = userRegister1.output.token;
  const userRegister2 = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const uIds = [userRegister2.output.authUserId];
  const dmCreate = requestDmCreate(registerToken, uIds) as dmId;
  const dmDetails = requestDmDetails(registerToken, dmCreate.output.dmId) as dmDetails;

  expect(dmDetails.statusCode).toBe(OK);
  expect(dmDetails.output).toStrictEqual(
    {
      name: 'alanhattom, ceciliale',
      members: expect.arrayContaining([
        { uId: userRegister1.output.authUserId, email: 'alan@unsw.edu.au', nameFirst: 'Alan', nameLast: 'Hattom', handleStr: expect.any(String), profileImageUrl: expect.any(String) },
        { uId: userRegister2.output.authUserId, email: 'cecilia@unsw.edu.au', nameFirst: 'Cecilia', nameLast: 'Le', handleStr: expect.any(String), profileImageUrl: expect.any(String) },
      ]),
    });
});

test('Testing invalid dm id', () => {
  const userRegister1 = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const registerToken = userRegister1.output.token;
  const uIds:number[] = [];
  const dmCreate = requestDmCreate(registerToken, uIds) as dmId;
  const dmDetails = requestDmDetails(registerToken, dmCreate.output.dmId + 1) as dmDetails;
  expect(dmDetails.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(dmDetails.statusCode).toBe(INPUT_ERROR);
});

test('Testing user not in dm', () => {
  const userRegister1 = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const registerToken1 = userRegister1.output.token;
  const userRegister2 = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const registerToken2 = userRegister2.output.token;
  const uIds:number[] = [];
  const dmCreate = requestDmCreate(registerToken1, uIds) as dmId;
  const dmDetails = requestDmDetails(registerToken2, dmCreate.output.dmId) as dmDetails;
  expect(dmDetails.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(dmDetails.statusCode).toBe(AUTH_ERROR);
});

test('Testing invalid token', () => {
  const userRegister1 = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const registerToken = userRegister1.output.token;
  const uIds:number[] = [];
  const dmCreate = requestDmCreate(registerToken, uIds) as dmId;
  const dmDetails = requestDmDetails(registerToken + 20, dmCreate.output.dmId) as dmDetails;
  expect(dmDetails.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(dmDetails.statusCode).toBe(AUTH_ERROR);
});
