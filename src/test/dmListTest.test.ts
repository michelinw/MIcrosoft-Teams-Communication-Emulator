import { requestRegister, requestDmCreate, requestClear, requestDmList } from './testHelper';

const OK = 200;
const INPUT_ERROR_403 = 403;

beforeEach(() => {
  requestClear();
});

type AuthUserId = {output: {token: string, authUserId: number}, statusCode: number}
type dmId = {output: {dmId: number}, statusCode: number}
type dmList = {output: {dmList: Array<{dmId: number, name: string}>}, statusCode: number}

test('Testing dm with just owner', () => {
  const userRegister = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const registerToken = userRegister.output.token;
  const uIds: number[] = [];
  const createDm = requestDmCreate(registerToken, uIds) as dmId;
  const list = [
    {
      dmId: createDm.output.dmId,
      name: 'alanhattom'
    }
  ];
  const dmList = requestDmList(registerToken) as dmList;
  expect(dmList.statusCode).toBe(OK);
  expect(dmList.output).toStrictEqual({ dms: list });
});

test('Testing dm with owner and member', () => {
  const userRegister = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const registerToken = userRegister.output.token;
  const userRegister2 = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const uIds = [userRegister2.output.authUserId];
  const createDm = requestDmCreate(registerToken, uIds) as dmId;
  const list = [
    {
      dmId: createDm.output.dmId,
      name: 'alanhattom, ceciliale'
    }
  ];
  const dmList = requestDmList(registerToken) as dmList;
  expect(dmList.statusCode).toBe(OK);
  expect(dmList.output).toStrictEqual({ dms: list });
});

test('Testing with multiple dms', () => {
  const userRegister1 = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const registerToken = userRegister1.output.token;
  const userRegister2 = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const userRegister3 = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
  const userRegister4 = requestRegister('xin@unsw.edu.au', 'password123', 'Xin', 'Weng') as AuthUserId;
  const uIds1 = [userRegister2.output.authUserId, userRegister3.output.authUserId];
  const uIds2 = [userRegister4.output.authUserId];
  const dm1 = requestDmCreate(registerToken, uIds1) as dmId;
  const dm2 = requestDmCreate(registerToken, uIds2) as dmId;
  const list = [
    {
      dmId: dm1.output.dmId,
      name: 'alanhattom, ceciliale, matthewwai'
    },
    {
      dmId: dm2.output.dmId,
      name: 'alanhattom, xinweng'
    }
  ];
  const dmList = requestDmList(registerToken) as dmList;
  expect(dmList.statusCode).toBe(OK);
  expect(dmList.output).toStrictEqual({ dms: list });
});
test('Testing invalid token', () => {
  const userRegister = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const registerToken = userRegister.output.token;
  const fakeToken = 'invalid';
  const uIds:number[] = [];
  requestDmCreate(registerToken, uIds) as dmId;
  const dmList = requestDmList(fakeToken) as dmList;
  expect(dmList.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(dmList.statusCode).toBe(INPUT_ERROR_403);
});
