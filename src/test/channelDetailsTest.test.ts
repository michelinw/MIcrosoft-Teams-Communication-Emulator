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
type Members = {uId: number, email: string, nameFirst: string, nameLast: string, handleStr: string, profileImageUrl: string}
type ChannelDetails = {output: {name: string, isPublic: boolean, ownerMembers: Members[], allMembers: Members[]}, statusCode: number}

test('Testing function when given valid details', () => {
  const user = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const channel = requestCreate(user.output.token, 'My Channel', true) as ChannelId;
  const channelDetails = requestDetails(user.output.token, channel.output.channelId) as ChannelDetails;
  expect(channelDetails.output).toStrictEqual(
    {
      name: 'My Channel',
      isPublic: true,
      ownerMembers: expect.arrayContaining([
        expect.objectContaining(
          { uId: user.output.authUserId, email: 'cecilia@unsw.edu.au', nameFirst: 'Cecilia', nameLast: 'Le', handleStr: expect.any(String), profileImageUrl: expect.any(String) }
        )
      ]),
      allMembers: expect.arrayContaining([
        expect.objectContaining(
          { uId: user.output.authUserId, email: 'cecilia@unsw.edu.au', nameFirst: 'Cecilia', nameLast: 'Le', handleStr: expect.any(String), profileImageUrl: expect.any(String) }
        )
      ])
    });
  expect(channelDetails.statusCode).toBe(OK);
});

test('Testing function when given valid details and multiple members', () => {
  const user = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const user2 = requestRegister('alan@unsw.edu.au', 'passsword123', 'Alan', 'Hattom') as AuthUserId;
  const channel = requestCreate(user.output.token, 'My Channel', false) as ChannelId;
  requestInvite(user.output.token, channel.output.channelId, user2.output.authUserId);
  const channelDetails = requestDetails(user.output.token, channel.output.channelId) as ChannelDetails;
  expect(channelDetails.output).toStrictEqual(
    {
      name: 'My Channel',
      isPublic: false,
      ownerMembers: expect.arrayContaining([
        { uId: user.output.authUserId, email: 'cecilia@unsw.edu.au', nameFirst: 'Cecilia', nameLast: 'Le', handleStr: expect.any(String), profileImageUrl: expect.any(String) }
      ]),
      allMembers: expect.arrayContaining([
        { uId: user.output.authUserId, email: 'cecilia@unsw.edu.au', nameFirst: 'Cecilia', nameLast: 'Le', handleStr: expect.any(String), profileImageUrl: expect.any(String) },
        { uId: user2.output.authUserId, email: 'alan@unsw.edu.au', nameFirst: 'Alan', nameLast: 'Hattom', handleStr: expect.any(String), profileImageUrl: expect.any(String) }
      ])
    });
  expect(channelDetails.statusCode).toBe(OK);
});

test('Testing function when given invalid token', () => {
  const user = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const channel = requestCreate(user.output.token, 'My Channel', true) as ChannelId;
  const channelDetails = requestDetails('', channel.output.channelId) as ChannelDetails;
  expect(channelDetails.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(channelDetails.statusCode).toBe(AUTH_ERROR);
});

test('Testing function when given invalid channelId', () => {
  const user = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const channel = requestCreate(user.output.token, 'My Channel', true) as ChannelId;
  const channelDetails = requestDetails(user.output.token, channel.output.channelId + 1) as ChannelDetails;
  expect(channelDetails.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(channelDetails.statusCode).toBe(INPUT_ERROR);
});

test('Testing function when giving an unauthorised member', () => {
  const user = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const user2 = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const channel = requestCreate(user.output.token, 'My Channel', false) as ChannelId;
  const channelDetails = requestDetails(user2.output.token, channel.output.channelId) as ChannelDetails;
  expect(channelDetails.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(channelDetails.statusCode).toBe(AUTH_ERROR);
});
