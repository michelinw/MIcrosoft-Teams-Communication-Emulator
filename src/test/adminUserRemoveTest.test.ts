import {
  requestClear, requestRegister, requestProfile, getUserAll, userRemove, userPermissionChange, requestDmDetails, requestDmCreate,
  requestCreate, requestJoin, requestDetails
} from './testHelper';

const OK = 200;
const INPUT_ERROR = 400;
const AUTH_ERROR = 403;

beforeEach(() => {
  requestClear();
});

type AuthUserId = {output: {token: string, authUserId: number}, statusCode: number}
type Empty = {output: Record<string, never>, statusCode: number}
type Users = {output: Record<string, never>, statusCode: number}
type DeletedUserProfile = {output: {uId: number, nameFirst: string, nameLast: string}, statusCode: number}
type dmId = {output: {dmId: number}, statusCode: number}
type member = {uId: number, email: string, nameFirst: string, nameLast: string, handleStr: string, profileImageUrl: string}
type dmDetails = {output: {name: string, members: member[]}, statusCode: number}
type ChannelId = {output: {channelId: number}, statusCode: number}
type ChannelDetails = {output: {name: string, isPublic: boolean, ownerMembers: member[], allMembers: member[]}, statusCode: number}

test('Testing valid user remove as global owner', () => {
  const adminRegister = requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const userRegister = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
  const remove = userRemove(adminRegister.output.token, userRegister.output.authUserId) as Empty;
  const userProfile = requestProfile(adminRegister.output.token, userRegister.output.authUserId) as DeletedUserProfile;
  const userAll = getUserAll(adminRegister.output.token) as Users;
  expect(userProfile.statusCode).toBe(OK);
  expect(userProfile.output).toStrictEqual({
    user: { uId: userRegister.output.authUserId, email: '', nameFirst: 'Removed', nameLast: 'user', handleStr: '', profileImageUrl: '' }
  });
  expect(userAll.statusCode).toBe(OK);
  expect(userAll.output).toStrictEqual({
    users: [
      {
        uId: 0,
        email: 'michael@unsw.edu.au',
        nameFirst: 'Michael',
        nameLast: 'Wang',
        handleStr: expect.any(String),
        profileImageUrl: expect.any(String)
      }
    ]
  });
  expect(remove.output).toStrictEqual({});
  expect(remove.statusCode).toBe(OK);
});

test('Testing valid remove as global owner removing another owner', () => {
  const adminRegister = requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const adminRegister2 = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
  const permissionChange = userPermissionChange(adminRegister.output.token, adminRegister2.output.authUserId, 1) as Empty;
  expect(permissionChange.output).toStrictEqual({});
  expect(permissionChange.statusCode).toBe(OK);
  const remove = userRemove(adminRegister2.output.token, adminRegister.output.authUserId) as Empty;
  expect(remove.output).toStrictEqual({});
  expect(remove.statusCode).toBe(OK);
});

test('Testing invalid user remove as non global owner', () => {
  const adminRegister = requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const userRegister = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const remove = userRemove(userRegister.output.token, adminRegister.output.authUserId) as Empty;
  expect(remove.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(remove.statusCode).toBe(AUTH_ERROR);
});

test('Testing invalid user remove as global owner with invalid user id', () => {
  const adminRegister = requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const userRegister = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
  const remove = userRemove(adminRegister.output.token, userRegister.output.authUserId + 1) as Empty;
  expect(remove.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(remove.statusCode).toBe(INPUT_ERROR);
});

test('Testing invalid user remove as global owner with invalid token', () => {
  requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const userRegister = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
  const remove = userRemove('invalid token', userRegister.output.authUserId) as Empty;
  expect(remove.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(remove.statusCode).toBe(AUTH_ERROR);
});

test('Testing invalid remove as global owner removing last owner', () => {
  const adminRegister = requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const remove = userRemove(adminRegister.output.token, adminRegister.output.authUserId) as Empty;
  expect(remove.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(remove.statusCode).toBe(INPUT_ERROR);
});

test('Testing dms after user is removed', () => {
  const adminRegister = requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const userRegister = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
  const dmCreate = requestDmCreate(adminRegister.output.token, [userRegister.output.authUserId]) as dmId;
  const remove = userRemove(adminRegister.output.token, userRegister.output.authUserId) as Empty;
  const dmDetails = requestDmDetails(adminRegister.output.token, dmCreate.output.dmId) as dmDetails;
  expect(dmDetails.output.members.length).toBe(1);
  expect(remove.statusCode).toBe(OK);
});

test('Testing channel after user is removed', () => {
  const adminRegister = requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const userRegister = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
  const channelCreate = requestCreate(adminRegister.output.token, 'My Channel', true) as ChannelId;
  requestJoin(userRegister.output.token, channelCreate.output.channelId) as Empty;
  const remove = userRemove(adminRegister.output.token, userRegister.output.authUserId) as Empty;
  const channelDetails = requestDetails(adminRegister.output.token, channelCreate.output.channelId) as ChannelDetails;
  expect(channelDetails.output.allMembers.length).toBe(1);
  expect(remove.statusCode).toBe(OK);
});
