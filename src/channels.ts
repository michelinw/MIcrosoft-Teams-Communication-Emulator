import { getData, setData } from './dataStore';
import { getUserIdPlace, getUserIdFromToken } from './helper/userHelper';
import { checkToken } from './helper/tokenHelper';
import { checkAuthorisedUser } from './helper/channelHelper';
import HTTPError from 'http-errors';

/**
  * Creates a new channel with the given name, that is either a public or private channel.
  * The user who created it automatically joins the channel.
  *
  * @param {string} token - token of the authorised user
  * @param {string} name - name of channel
  * @param {boolean} isPublic - boolean of whether channel is public or private
  * ...
  *
  * @returns {{channelId: number}} - if no error
  * @returns {{error: string}} - if length of name is less than 1 or more than
  * 20 characters or if token is invalid
*/

type channelId = {channelId: number}
type Reacts = {reactId: number, uIds: any[], isThisUserReacted: boolean};
type Message = {
  messageId: number,
  uId: number,
  message: string,
  reacts: Reacts[],
  timeSent: number,
  isPinned: boolean
};

export function channelsCreateV3(token: string, name: string, isPublic: boolean): channelId {
  const data = getData();
  const users = data.users;
  const channels = data.channels;
  const userId = getUserIdFromToken(token);

  if (!checkToken(token)) {
    throw HTTPError(403, 'invalid token!');
  }

  const userPlace = getUserIdPlace(getUserIdFromToken(token));
  const nameLength = name.length;
  if (nameLength < 1 || nameLength > 20) {
    throw HTTPError(400, 'incorrect name length');
  }

  const timeStamp = Math.floor(Date.now() / 1000);
  const messageArray: Message[] = [];
  const channelDetails = {
    channelId: channels.length + 1,
    name: name,
    isPublic: isPublic,
    ownerMembers: [users[userPlace]],
    allMembers: [users[userPlace]],
    messages: messageArray,
    joinTime: [{ userId, timeStamp }]
  };

  channels.push(channelDetails);
  setData(data);
  return {
    channelId: channelDetails.channelId,
  };
}

/**
  * <Returns details of all channels that the user is a part of>
  *
  * @param {string} token - token of the user
  * ...
  *
  * @returns {channel: array<{
  *           channelId: number,
  *            name: string
  *           }>} - if token is valid
*/

type channels = {channelId: number, name: string}
type channelsList = {channels: channels[]}

export function channelsListV3(token: string): channelsList {
  if (!checkToken(token)) {
    throw HTTPError(403, 'invalid token!');
  }

  const data = getData();
  const channels = data.channels;
  const authUserId = getUserIdFromToken(token);
  const list = [];
  for (let i = 0; i < channels.length; i++) {
    if (checkAuthorisedUser(authUserId, channels[i].channelId)) {
      const newChannel = {
        channelId: channels[i].channelId,
        name: channels[i].name,
      };
      list.push(newChannel);
    }
  }

  return {
    channels: list,
  };
}

/**
  * <Given authUserId, lists all the current channels snd their details (even private)>
  *
  * @param {string} token - the token of a registered user
  *
  * @returns { {channels: array<{channelId: number,
  *                               name: string}>} } - if token is valid
  * @returns {{ error: string}} - if given an invalid token
*/

export function channelsListAllV3(token: string): channelsList {
  const data = getData();
  const channels = data.channels;

  if (!checkToken(token)) {
    throw HTTPError(403, 'invalid token!');
  }

  const channelList = [];
  for (let count = 0; count < channels.length; count++) {
    const channel = {
      channelId: channels[count].channelId,
      name: channels[count].name
    };
    channelList.push(channel);
  }
  return { channels: channelList };
}
