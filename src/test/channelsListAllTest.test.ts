import { requestRegister, requestCreate, requestClear, requestListAll } from './testHelper';

const OK = 200;
const AUTH_ERROR = 403;

beforeEach(() => {
  requestClear();
});

type AuthUserId = {output: {token: string, authUserId: number}, statusCode: number}
type ChannelId = {output: {channelId: number}, statusCode: number}
type Channel = {channelId: number, name: string}
type ChannelList = {output: {channels: Channel[]}, statusCode: number}

test('Testing function with invalid token', () => {
  const channelsList = requestListAll('') as ChannelList;
  expect(channelsList.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(channelsList.statusCode).toBe(AUTH_ERROR);
});

test('Testing function with valid token', () => {
  const user = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const channelOne = requestCreate(user.output.token, 'Channel One', true) as ChannelId;
  const channelTwo = requestCreate(user.output.token, 'Channel Two', true) as ChannelId;
  const channelThree = requestCreate(user.output.token, 'Channel Three', true) as ChannelId;
  const channelsList = requestListAll(user.output.token) as ChannelList;
  expect(channelsList.output).toStrictEqual({
    channels: [
      {
        channelId: channelOne.output.channelId,
        name: 'Channel One',
      },
      {
        channelId: channelTwo.output.channelId,
        name: 'Channel Two',
      },
      {
        channelId: channelThree.output.channelId,
        name: 'Channel Three',
      }
    ]
  });
  expect(channelsList.statusCode).toBe(OK);
});
