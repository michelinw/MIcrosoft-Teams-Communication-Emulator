import {
  requestCreate,
  requestRegister,
  requestClear,
  requestList,
  requestJoin,
  requestLeave
} from './testHelper';

const OK = 200;
const AUTH_ERROR = 403;

beforeEach(() => {
  requestClear();
});

type AuthUserId = {output: {token: string, authUserId: number}, statusCode: number}
type ChannelId = {output: {channelId: number}, statusCode: number}
type Channel = {channelId: number, name: string}
type ChannelList = {output: {channels: Channel[]}, statusCode: number}

test('Testing channelsListV1 with user with 3 channels', () => {
  const user = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const channel1 = requestCreate(user.output.token, 'channel1', true) as ChannelId;
  const channel2 = requestCreate(user.output.token, 'channel2', true) as ChannelId;
  const channel3 = requestCreate(user.output.token, 'channel3', true) as ChannelId;
  const list = [
    {
      channelId: channel1.output.channelId,
      name: 'channel1',
    },
    {
      channelId: channel2.output.channelId,
      name: 'channel2',
    },
    {
      channelId: channel3.output.channelId,
      name: 'channel3',
    },
  ];
  const channelsList = requestList(user.output.token) as ChannelList;
  expect(channelsList.output).toStrictEqual({ channels: list });
  expect(channelsList.statusCode).toBe(OK);
});

test('Testing channelsListV1 with channels they left', () => {
  const user = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const userTwo = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const channel1 = requestCreate(user.output.token, 'channel1', true) as ChannelId;
  const channel2 = requestCreate(userTwo.output.token, 'channel2', true) as ChannelId;
  requestJoin(user.output.token, channel2.output.channelId);
  const list1 = [
    {
      channelId: channel1.output.channelId,
      name: 'channel1',
    },
    {
      channelId: channel2.output.channelId,
      name: 'channel2',
    }
  ];
  const channelsList = requestList(user.output.token) as ChannelList;
  expect(channelsList.output).toStrictEqual({ channels: list1 });
  expect(channelsList.statusCode).toBe(OK);
  requestLeave(user.output.token, channel2.output.channelId);
  const list2 = [
    {
      channelId: channel1.output.channelId,
      name: 'channel1',
    }
  ];
  const channelsList2 = requestList(user.output.token) as ChannelList;
  expect(channelsList2.output).toStrictEqual({ channels: list2 });
  expect(channelsList2.statusCode).toBe(OK);
});

test('Testing channelsListV1 with user with 0 channels', () => {
  const user = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const list:Channel[] = [];
  const channelsList = requestList(user.output.token) as ChannelList;
  expect(channelsList.output).toStrictEqual({ channels: list });
  expect(channelsList.statusCode).toBe(OK);
});

test('Testing channelsListV1 with invalid token', () => {
  const user = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  requestCreate(user.output.token, 'name', true) as ChannelId;
  const channelsList = requestList('') as ChannelList;
  expect(channelsList.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(channelsList.statusCode).toBe(AUTH_ERROR);
});
