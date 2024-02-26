import { requestClear, requestRegister, requestCreate, requestJoin, requestDmCreate, requestSend, requestDmSend, requestUserStats } from './testHelper';

const OK = 200;
const AUTH_ERROR = 403;

beforeEach(() => {
  requestClear();
});

type AuthUserId = {output: {token: string, authUserId: number}, statusCode: number}
type ChannelId = {output: {channelId: number}, statusCode: number}
type DmId = {output: {dmId: number}, statusCode: number}
type channelsJoined = {numChannelsJoined: number, timeStamp: number};
type dmsJoined = {numDmsJoined: number, timeStamp: number};
type messagesSent = {numMessagesSent: number, timeStamp: number};
type UserStats = {output: {userStats: {channelsJoined: channelsJoined[], dmsJoined: dmsJoined[], messagesSent: messagesSent[], involvementRate: number}}, statusCode: number};

test('Testing valid user stats request when user has not joined any dms, channels, and has not sent any messages', () => {
  const userRegister = requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const stats = requestUserStats(userRegister.output.token) as UserStats;
  expect(stats.output).toStrictEqual({
    userStats:
      {
        channelsJoined: [{
          numChannelsJoined: 0,
          timeStamp: expect.any(Number),
        }],
        dmsJoined: [{
          numDmsJoined: 0,
          timeStamp: expect.any(Number),
        }],
        messagesSent: [{
          numMessagesSent: 0,
          timeStamp: expect.any(Number),
        }],
        involvementRate: expect.any(Number)
      }
  });
  expect(stats.statusCode).toBe(OK);
});

test('Testing when user has joined one channel, no dms, and has not sent any message', () => {
  const userRegister = requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  requestCreate(userRegister.output.token, 'channel', true) as ChannelId;
  const stats = requestUserStats(userRegister.output.token) as UserStats;
  expect(stats.output).toStrictEqual({
    userStats:
      {
        channelsJoined: [
          {
            numChannelsJoined: 0,
            timeStamp: expect.any(Number),
          },
          {
            numChannelsJoined: 1,
            timeStamp: expect.any(Number),
          }
        ],
        dmsJoined: [{
          numDmsJoined: 0,
          timeStamp: expect.any(Number),
        }],
        messagesSent: [{
          numMessagesSent: 0,
          timeStamp: expect.any(Number),
        }],
        involvementRate: expect.any(Number)
      }
  });
});

test('Testing when user has joined one dm and has not sent a message', () => {
  const userRegister = requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const userRegister1 = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
  const uIds = [userRegister1.output.authUserId];
  requestDmCreate(userRegister.output.token, uIds) as DmId;
  const stats = requestUserStats(userRegister.output.token) as UserStats;
  expect(stats.output).toStrictEqual({
    userStats:
      {
        channelsJoined: [
          {
            numChannelsJoined: 0,
            timeStamp: expect.any(Number),
          },
        ],
        dmsJoined: [
          {
            numDmsJoined: 0,
            timeStamp: expect.any(Number),
          },
          {
            numDmsJoined: 1,
            timeStamp: expect.any(Number),
          }
        ],
        messagesSent: [
          {
            numMessagesSent: 0,
            timeStamp: expect.any(Number),
          }
        ],
        involvementRate: expect.any(Number)
      }
  });
});

test('Testing when user has joined one channel, and one dm and has sent a message in both the channel and dm', () => {
  const userRegister = requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const userRegister1 = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const uIds = [userRegister1.output.authUserId];
  const channel = requestCreate(userRegister.output.token, 'channel', true) as ChannelId;
  requestJoin(userRegister1.output.token, channel.output.channelId);
  const dm = requestDmCreate(userRegister.output.token, uIds) as DmId;
  requestSend(userRegister.output.token, channel.output.channelId, 'hello');
  requestDmSend(userRegister.output.token, dm.output.dmId, 'hello');
  const stats = requestUserStats(userRegister.output.token) as UserStats;
  expect(stats.output).toStrictEqual({
    userStats:
      {
        channelsJoined: [
          {
            numChannelsJoined: 0,
            timeStamp: expect.any(Number),
          },
          {
            numChannelsJoined: 1,
            timeStamp: expect.any(Number),
          }
        ],
        dmsJoined: [
          {
            numDmsJoined: 0,
            timeStamp: expect.any(Number),
          },
          {
            numDmsJoined: 1,
            timeStamp: expect.any(Number),
          }
        ],
        messagesSent: [
          {
            numMessagesSent: 0,
            timeStamp: expect.any(Number),
          },
          {
            numMessagesSent: 1,
            timeStamp: expect.any(Number),
          },
          {
            numMessagesSent: 2,
            timeStamp: expect.any(Number),
          }
        ],
        involvementRate: expect.any(Number)
      }
  });
});

/**
 * channel = user , user 1
 * channel 1 = user 1
 *
 * dm = user, user 1,
 * dm 1 = user 1
 *
 * user sends message in channel and dm
 * user 1 sends message in channel, channel 1, and dm 1
 */

test('Testing when user has joined multiple channels, and multiple dms and has sent a message in multiple channels and dms', () => {
  const userRegister = requestRegister('michael@unsw.edu.au', 'password123', 'Michael', 'Wang') as AuthUserId;
  const userRegister1 = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const uIds = [userRegister1.output.authUserId];
  const uIds1: number[] = [];
  const channel = requestCreate(userRegister.output.token, 'channel', true) as ChannelId;
  requestJoin(userRegister1.output.token, channel.output.channelId);
  const channel1 = requestCreate(userRegister1.output.token, 'channel1', true) as ChannelId;
  const dm = requestDmCreate(userRegister.output.token, uIds) as DmId;
  const dm1 = requestDmCreate(userRegister1.output.token, uIds1) as DmId;
  requestSend(userRegister.output.token, channel.output.channelId, 'hello');
  requestSend(userRegister.output.token, dm.output.dmId, 'hello');
  requestSend(userRegister1.output.token, channel.output.channelId, 'hello');
  requestSend(userRegister1.output.token, channel1.output.channelId, 'hello');
  requestSend(userRegister1.output.token, dm1.output.dmId, 'hello');
  const stats = requestUserStats(userRegister.output.token) as UserStats;
  const stats1 = requestUserStats(userRegister1.output.token) as UserStats;
  expect(stats.output).toStrictEqual({
    userStats:
      {
        channelsJoined: [
          {
            numChannelsJoined: 0,
            timeStamp: expect.any(Number),
          },
          {
            numChannelsJoined: 1,
            timeStamp: expect.any(Number),
          }
        ],
        dmsJoined: [
          {
            numDmsJoined: 0,
            timeStamp: expect.any(Number),
          },
          {
            numDmsJoined: 1,
            timeStamp: expect.any(Number),
          }
        ],
        messagesSent: [
          {
            numMessagesSent: 0,
            timeStamp: expect.any(Number),
          },
          {
            numMessagesSent: 1,
            timeStamp: expect.any(Number),
          },
          {
            numMessagesSent: 2,
            timeStamp: expect.any(Number),
          },
        ],
        involvementRate: expect.any(Number)
      }
  });
  expect(stats1.output).toStrictEqual({
    userStats:
      {
        channelsJoined: [
          {
            numChannelsJoined: 0,
            timeStamp: expect.any(Number),
          },
          {
            numChannelsJoined: 1,
            timeStamp: expect.any(Number),
          },
          {
            numChannelsJoined: 2,
            timeStamp: expect.any(Number),
          }
        ],
        dmsJoined: [
          {
            numDmsJoined: 0,
            timeStamp: expect.any(Number),
          },
          {
            numDmsJoined: 1,
            timeStamp: expect.any(Number),
          },
          {
            numDmsJoined: 2,
            timeStamp: expect.any(Number),
          }
        ],
        messagesSent: [
          {
            numMessagesSent: 0,
            timeStamp: expect.any(Number),
          },
          {
            numMessagesSent: 1,
            timeStamp: expect.any(Number),
          },
          {
            numMessagesSent: 2,
            timeStamp: expect.any(Number),
          },
          {
            numMessagesSent: 3,
            timeStamp: expect.any(Number),
          },
        ],
        involvementRate: expect.any(Number)
      }
  });
  expect(stats.statusCode).toBe(OK);
  expect(stats1.statusCode).toBe(OK);
});

test('Testing invalid user stats request with invalid token', () => {
  const stats = requestUserStats('invalid token') as UserStats;
  expect(stats.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(stats.statusCode).toBe(AUTH_ERROR);
});
