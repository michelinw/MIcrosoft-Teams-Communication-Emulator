import {
  requestClear, requestRegister, requestCreate,
  requestInvite, requestDetails
} from './testHelper';

const OK = 200;
const INPUT_ERROR = 400;
const AUTH_ERROR = 403;

beforeEach(() => {
  requestClear();
});

type AuthUserId = {output: {token: string, authUserId: number}, statusCode: number}
type ChannelId = {output: {channelId: number}, statusCode: number}
type Members = {uId: number, email: string, nameFirst: string, nameLast: string, handleStr: string}
type Empty = {output: Record<string, never>, statusCode: number}
type ChannelDetails = {output: {name: string, isPublic: boolean, ownerMembers: Members[], allMembers: Members[]}, statusCode: number}

test('Testing valid details', () => {
  const userRegister1 = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const userRegister2 = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
  const channelCreate = requestCreate(userRegister1.output.token, 'My Channel', true) as ChannelId;
  const channelInvite = requestInvite(userRegister1.output.token, channelCreate.output.channelId, userRegister2.output.authUserId) as Empty;
  expect(channelInvite.output).toStrictEqual({});
  expect(channelInvite.statusCode).toBe(OK);
});

test('Testing invalid channel ID', () => {
  const userRegister1 = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const userRegister2 = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
  const channelCreate = requestCreate(userRegister1.output.token, 'My Channel', true) as ChannelId;
  const channelInvite = requestInvite(userRegister1.output.token, channelCreate.output.channelId + 1, userRegister2.output.authUserId) as Empty;
  expect(channelInvite.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(channelInvite.statusCode).toBe(INPUT_ERROR);
});

test('Testing invalid uID', () => {
  const userRegister1 = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const userRegister2 = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
  const channelCreate = requestCreate(userRegister1.output.token, 'My Channel', true) as ChannelId;
  const channelInvite = requestInvite(userRegister1.output.token, channelCreate.output.channelId, userRegister2.output.authUserId + 1) as Empty;
  expect(channelInvite.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(channelInvite.statusCode).toBe(INPUT_ERROR);
});

test('Testing if uID is already a member', () => {
  const userRegister1 = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const userRegister2 = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
  const channelCreate = requestCreate(userRegister1.output.token, 'My Channel', true) as ChannelId;
  requestInvite(userRegister1.output.token, channelCreate.output.channelId, userRegister2.output.authUserId);
  const channelInvite2 = requestInvite(userRegister1.output.token, channelCreate.output.channelId, userRegister2.output.authUserId) as Empty;
  expect(channelInvite2.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(channelInvite2.statusCode).toBe(INPUT_ERROR);
});

test('Testing if authUserId is inviting, but is not a member', () => {
  const userRegister1 = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const userRegister2 = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
  const userRegister3 = requestRegister('xin@unsw.edu.au', 'password123', 'Xin', 'Weng') as AuthUserId;
  const channelCreate = requestCreate(userRegister1.output.token, 'My Channel', true) as ChannelId;
  const channelInvite = requestInvite(userRegister2.output.token, channelCreate.output.channelId, userRegister3.output.authUserId) as Empty;
  expect(channelInvite.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(channelInvite.statusCode).toBe(AUTH_ERROR);
});

test('Testing invalid token', () => {
  const userRegister1 = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const userRegister2 = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
  const channelCreate = requestCreate(userRegister1.output.token, 'My Channel', true) as ChannelId;
  const channelInvite = requestInvite('', channelCreate.output.channelId, userRegister2.output.authUserId) as Empty;
  expect(channelInvite.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(channelInvite.statusCode).toBe(AUTH_ERROR);
});

test('Testing private channel', () => {
  const user1 = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const user2 = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
  const channel = requestCreate(user1.output.token, 'My Channel', false) as ChannelId;
  const channelInvite = requestInvite(user1.output.token, channel.output.channelId, user2.output.authUserId) as Empty;
  const channelDetails = requestDetails(user1.output.token, channel.output.channelId) as ChannelDetails;
  expect(channelDetails.output).toStrictEqual(
    {
      name: 'My Channel',
      isPublic: false,
      ownerMembers: expect.arrayContaining([
        { uId: user1.output.authUserId, email: 'cecilia@unsw.edu.au', nameFirst: 'Cecilia', nameLast: 'Le', handleStr: expect.any(String), profileImageUrl: expect.any(String) },
      ]),
      allMembers: expect.arrayContaining([
        { uId: user1.output.authUserId, email: 'cecilia@unsw.edu.au', nameFirst: 'Cecilia', nameLast: 'Le', handleStr: expect.any(String), profileImageUrl: expect.any(String) },
        { uId: user2.output.authUserId, email: 'matthew@unsw.edu.au', nameFirst: 'Matthew', nameLast: 'Wai', handleStr: expect.any(String), profileImageUrl: expect.any(String) },
      ])
    });
  expect(channelInvite.output).toStrictEqual({});
  expect(channelInvite.statusCode).toBe(OK);
});
