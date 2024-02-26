import {
  requestClear,
  requestRegister,
  requestCreate,
  requestInvite,
  requestNotifications,
  requestDmCreate,
  requestSend,
  requestDmSend,
  requestReact,
  requestLeave,
  requestEdit,
  requestShare
} from './testHelper';

const OK = 200;
const AUTH_ERROR = 403;

beforeEach(() => {
  requestClear();
});

type AuthUserId = {output: {token: string, authUserId: number}, statusCode: number}
type ChannelId = {output: {channelId: number}, statusCode: number}
type dmId = {output: {dmId: number}, statusCode: number}
type MessageId = {output: {messageId: number}, statusCode: number}

test('Testing notifications with invalid token', () => {
  const notif = requestNotifications('');
  expect(notif.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(notif.statusCode).toBe(AUTH_ERROR);
});

test('Getting no notifications', () => {
  const user = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const notif = requestNotifications(user.output.token);
  expect(notif.output).toStrictEqual({ notifications: [] });
  expect(notif.statusCode).toBe(OK);
});

test('Notification from being added to channel', () => {
  const user = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const user2 = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
  const channel = requestCreate(user.output.token, 'My Channel', true) as ChannelId;
  requestInvite(user.output.token, channel.output.channelId, user2.output.authUserId);
  const notif = requestNotifications(user2.output.token);
  const expected = {
    notifications: [
      {
        channelId: expect.any(Number),
        dmId: expect.any(Number),
        notificationMessage: expect.any(String)
      }
    ]
  };
  expect(notif.output).toStrictEqual(expected);
  expect(notif.statusCode).toBe(OK);
});

test('Notification from being added to dm', () => {
  const user = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const user2 = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
  const uIds = [user2.output.authUserId];
  requestDmCreate(user.output.token, uIds) as dmId;
  const notif = requestNotifications(user2.output.token);
  const expected = {
    notifications: [
      {
        channelId: expect.any(Number),
        dmId: expect.any(Number),
        notificationMessage: expect.any(String)
      }
    ]
  };
  expect(notif.output).toStrictEqual(expected);
  expect(notif.statusCode).toBe(OK);
});

test("Notifications from other people's tags in channel", () => {
  const user = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const user2 = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
  const channel = requestCreate(user.output.token, 'My Channel', true) as ChannelId;
  requestInvite(user.output.token, channel.output.channelId, user2.output.authUserId);
  requestSend(user.output.token, channel.output.channelId, 'hi @matthewwai');
  const notif = requestNotifications(user2.output.token);
  const expected = {
    notifications: [
      {
        channelId: expect.any(Number),
        dmId: expect.any(Number),
        notificationMessage: expect.any(String)
      },
      {
        channelId: expect.any(Number),
        dmId: expect.any(Number),
        notificationMessage: expect.any(String)
      }
    ]
  };
  expect(notif.output).toStrictEqual(expected);
  expect(notif.statusCode).toBe(OK);
});

test("Notification from other people's tags in dm", () => {
  const user = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const user2 = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
  const uIds = [user2.output.authUserId];
  const dmCreate = requestDmCreate(user.output.token, uIds) as dmId;
  requestDmSend(user.output.token, dmCreate.output.dmId, 'hi @matthewwai') as MessageId;
  const notif = requestNotifications(user2.output.token);
  const expected = {
    notifications: [
      {
        channelId: expect.any(Number),
        dmId: expect.any(Number),
        notificationMessage: expect.any(String)
      },
      {
        channelId: expect.any(Number),
        dmId: expect.any(Number),
        notificationMessage: expect.any(String)
      }
    ]
  };
  expect(notif.output).toStrictEqual(expected);
  expect(notif.statusCode).toBe(OK);
});

test('Notification from tagging yourself', () => {
  const user = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
  const channel = requestCreate(user.output.token, 'My Channel', true) as ChannelId;
  requestSend(user.output.token, channel.output.channelId, 'hi @matthewwai');
  const notif = requestNotifications(user.output.token);
  const expected = {
    notifications: [
      {
        channelId: expect.any(Number),
        dmId: expect.any(Number),
        notificationMessage: expect.any(String)
      },
    ]
  };
  expect(notif.output).toStrictEqual(expected);
  expect(notif.statusCode).toBe(OK);
});

test('No notification if user is not a member', () => {
  const user = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const user2 = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
  const channel = requestCreate(user.output.token, 'My Channel', true) as ChannelId;
  requestSend(user.output.token, channel.output.channelId, 'hi @matthewwai');
  const notif = requestNotifications(user2.output.token);
  expect(notif.output).toStrictEqual({ notifications: [] });
  expect(notif.statusCode).toBe(OK);
});

test('Only one notification from getting tagged more than once', () => {
  const user = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
  const channel = requestCreate(user.output.token, 'My Channel', true) as ChannelId;
  requestSend(user.output.token, channel.output.channelId, 'hi @matthewwai @matthewwai @matthewwai');
  const notif = requestNotifications(user.output.token);
  const expected = {
    notifications: [
      {
        channelId: expect.any(Number),
        dmId: expect.any(Number),
        notificationMessage: expect.any(String)
      },
    ]
  };
  expect(notif.output).toStrictEqual(expected);
  expect(notif.statusCode).toBe(OK);
});

test('Notifications from tagging more than one user', () => {
  const user = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const user2 = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
  const channel = requestCreate(user.output.token, 'My Channel', true) as ChannelId;
  requestInvite(user.output.token, channel.output.channelId, user2.output.authUserId);
  requestSend(user.output.token, channel.output.channelId, 'hi @matthewwai @ceciliale');
  const notif = requestNotifications(user2.output.token);
  const notif2 = requestNotifications(user.output.token);
  const expected = {
    notifications: [
      {
        channelId: expect.any(Number),
        dmId: expect.any(Number),
        notificationMessage: expect.any(String)
      },
      {
        channelId: expect.any(Number),
        dmId: expect.any(Number),
        notificationMessage: expect.any(String)
      }
    ]
  };
  const expected2 = {
    notifications: [
      {
        channelId: expect.any(Number),
        dmId: expect.any(Number),
        notificationMessage: expect.any(String)
      }
    ]
  };
  expect(notif.output).toStrictEqual(expected);
  expect(notif.statusCode).toBe(OK);
  expect(notif2.output).toStrictEqual(expected2);
  expect(notif2.statusCode).toBe(OK);
});

test('Notification from reacts', () => {
  const user = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
  const channel = requestCreate(user.output.token, 'My Channel', true) as ChannelId;
  const send = requestSend(user.output.token, channel.output.channelId, 'hi');
  requestReact(user.output.token, send.output.messageId, 1);
  const notif = requestNotifications(user.output.token);
  const expected = {
    notifications: [
      {
        channelId: expect.any(Number),
        dmId: expect.any(Number),
        notificationMessage: expect.any(String)
      },
    ]
  };
  expect(notif.output).toStrictEqual(expected);
  expect(notif.statusCode).toBe(OK);
});

test('No notification from reacts when sender has left the channel', () => {
  const user = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
  const user2 = requestRegister('cecilia@unsw.edu.au', 'password123', 'Cecilia', 'Le') as AuthUserId;
  const channel = requestCreate(user.output.token, 'My Channel', true) as ChannelId;
  requestInvite(user.output.token, channel.output.channelId, user2.output.authUserId);
  const send = requestSend(user.output.token, channel.output.channelId, 'hi');
  requestLeave(user.output.token, channel.output.channelId);
  requestReact(user2.output.token, send.output.messageId, 1);
  const notif = requestNotifications(user.output.token);
  const empty:any[] = [];
  const expected = {
    notifications: empty,
  };
  expect(notif.output).toStrictEqual(expected);
  expect(notif.statusCode).toBe(OK);
});

test('Notification from getting tagged from edited message', () => {
  const user = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
  const channel = requestCreate(user.output.token, 'My Channel', true) as ChannelId;
  const send = requestSend(user.output.token, channel.output.channelId, 'hi');
  requestEdit(user.output.token, send.output.messageId, 'hi @matthewwai');
  const notif = requestNotifications(user.output.token);
  const expected = {
    notifications: [
      {
        channelId: expect.any(Number),
        dmId: expect.any(Number),
        notificationMessage: expect.any(String)
      },
    ]
  };
  expect(notif.output).toStrictEqual(expected);
  expect(notif.statusCode).toBe(OK);
});

test('Notification from getting tagged in shared message', () => {
  const user = requestRegister('matthew@unsw.edu.au', 'password123', 'Matthew', 'Wai') as AuthUserId;
  const channel = requestCreate(user.output.token, 'My Channel', true) as ChannelId;
  const send = requestSend(user.output.token, channel.output.channelId, 'hi');
  requestShare(user.output.token, send.output.messageId, 'hi @matthewwai', channel.output.channelId, -1);
  const notif = requestNotifications(user.output.token);
  const expected = {
    notifications: [
      {
        channelId: expect.any(Number),
        dmId: expect.any(Number),
        notificationMessage: expect.any(String)
      },
    ]
  };
  expect(notif.output).toStrictEqual(expected);
  expect(notif.statusCode).toBe(OK);
});
