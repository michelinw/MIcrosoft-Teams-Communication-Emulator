import { getData, setData } from './dataStore';
import {
  checkUserId,
  getUserIdFromToken,
  getUserIdPlace,
  getUserIdPlaceMember,
  getUserIdPlaceOwner
} from './helper/userHelper';
import { checkToken } from './helper/tokenHelper';
import {
  checkChannelId,
  getChannelIdPlace,
  checkAuthorisedUser,
  checkIfOwner
} from './helper/channelHelper';
import { standupStarter } from './helper/standupHelper';
import HTTPError from 'http-errors';
import { createNotification } from './helper/notificationsHelper';
import { getMessageFromId, hasReacted } from './helper/messageHelper';

type Member = {
  uId: number,
  email: string,
  nameFirst: string,
  nameLast: string,
  handleStr: string,
  profileImageUrl: string
};

type ChannelDetails = {
  name: string,
  isPublic: boolean,
  ownerMembers: Member[],
  allMembers: Member[]
}

type Empty = Record<string, never>

/**
  * Given a channelId and the authUserId, return the channel details
  *
  *
  * @param {string} token - token of the authorised user
  * @param {number} channelId - Id of the channel
  * ...
  *
  * @returns {{ name: string,
 *           allMembers: array<{
 *             uId: number,
 *             email: string,
 *             nameFirst: string,
 *             nameLast: string,
 *             handleStr: string,
 *           }>,
  *           ownerMembers: array<{
 *             uId: number,
 *             email: string,
 *             nameFirst: string,
 *             nameLast: string,
 *             handleStr: string,
 *           }>,
  *           isPublic: boolean}} - if no error
  * @returns {{error: string}} - if channelId does not refer to a valid channel,
  * if user is not a member of the channel or if token is invalid
  *
  *
*/

export function channelDetailsV3(token: string, channelId: number): ChannelDetails {
  const data = getData();
  const channels = data.channels;
  const channelPlace = getChannelIdPlace(channelId);

  if (!checkToken(token)) {
    throw HTTPError(403, 'Invalid token');
  }

  if (!checkChannelId(channelId)) {
    throw HTTPError(400, 'Invalid channelId');
  }
  const authUserId = getUserIdFromToken(token);
  if (!checkAuthorisedUser(authUserId, channelId)) {
    throw HTTPError(403, 'User is not a member of the channel');
  }

  const ownerMembers = [];
  const allMembers = [];
  for (let count = 0; count < channels[channelPlace].ownerMembers.length; count++) {
    const user = {
      uId: channels[channelPlace].ownerMembers[count].uId,
      email: channels[channelPlace].ownerMembers[count].email,
      nameFirst: channels[channelPlace].ownerMembers[count].nameFirst,
      nameLast: channels[channelPlace].ownerMembers[count].nameLast,
      handleStr: channels[channelPlace].ownerMembers[count].handleStr,
      profileImageUrl: channels[channelPlace].ownerMembers[count].profileImageUrl
    };
    ownerMembers.unshift(user);
  }

  for (let count = 0; count < channels[channelPlace].allMembers.length; count++) {
    const user = {
      uId: channels[channelPlace].allMembers[count].uId,
      email: channels[channelPlace].allMembers[count].email,
      nameFirst: channels[channelPlace].allMembers[count].nameFirst,
      nameLast: channels[channelPlace].allMembers[count].nameLast,
      handleStr: channels[channelPlace].allMembers[count].handleStr,
      profileImageUrl: channels[channelPlace].allMembers[count].profileImageUrl
    };
    allMembers.unshift(user);
  }
  return {
    name: channels[channelPlace].name,
    isPublic: channels[channelPlace].isPublic,
    ownerMembers: ownerMembers,
    allMembers: allMembers
  };
}

/**
  * Given a channelId of a channel that the authorised user can join,
  * they are added to that channel
  *
  * @param {string} token - token of the authorised user
  * @param {number} channelId - Id of the channel
  *
  * @returns {{}} - if no error
  * @returns {{error: string}} - if channelId does not refer to a valid channel,
  * user is already a member of the channel, channel is private and user is not
  * global owner or if token is invalid
*/

export function channelJoinV3(token: string, channelId: number): Empty {
  const data = getData();
  const users = data.users;
  const channels = data.channels;

  if (!checkToken(token)) {
    throw HTTPError(403, 'invalid token');
  }

  if (!checkChannelId(channelId)) {
    throw HTTPError(400, 'invalid channel');
  }

  const authUserId = getUserIdFromToken(token);
  if (checkAuthorisedUser(authUserId, channelId)) {
    throw HTTPError(400, 'already part of the channel!');
  }

  const channelPlace = getChannelIdPlace(channelId);
  const userPlace = getUserIdPlace(authUserId);

  if (!channels[channelPlace].isPublic && users[userPlace].permissionId !== 1) {
    throw HTTPError(403, 'cannot join a private channel!');
  }

  const join = {
    userId: users[userPlace].uId,
    timeStamp: Math.floor(Date.now() / 1000)
  };

  channels[channelPlace].allMembers.push(users[userPlace]);
  channels[channelPlace].joinTime.push(join);
  setData(data);
  return {};
}

/**
  * Given a channelId of a channel and an authUserId
  * allows for another user to be added into the channel
  * whether its public or private
  *
  * @param {string} token - token of the authorised user
  * @param {number} channelId - Id of the channel
  * @param {number} uId - Id of the user to be invited
  * ...
  *
  * @returns {{}} - if no error
  * @returns {{error: string}} - if channelId does not refer to a valid channel,
  * user is already a member of the channel, user to be invited is a valid user and
  * the token is valid.
*/

export function channelInviteV3(token: string, channelId: number, uId: number): Empty {
  const data = getData();
  const users = data.users;
  const channels = data.channels;

  if (!checkToken(token)) {
    throw HTTPError(403, 'invalid token');
  }
  if (!checkUserId(uId) || !checkChannelId(channelId)) {
    throw HTTPError(400, 'invalid channel or user');
  }
  if (checkAuthorisedUser(uId, channelId)) {
    throw HTTPError(400, 'already part of the channel!');
  }
  const authUserId = getUserIdFromToken(token);
  if (!checkAuthorisedUser(authUserId, channelId)) {
    throw HTTPError(403, 'not authorised to invite user');
  }

  const channelPlace = getChannelIdPlace(channelId);
  const userPlace = getUserIdPlace(uId);
  channels[channelPlace].allMembers.push(users[userPlace]);
  channels[channelPlace].joinTime.push({
    userId: users[userPlace].uId,
    timeStamp: Math.floor(Date.now() / 1000)
  });
  setData(data);
  createNotification(channelId, -1, 'channelInvite', token, uId);
  return {};
}

type Messages = {
  messageId: number,
  uId: number,
  message: string,
  timeSent: number }

type ChannelMessages = {
  messages: Messages[],
  start: number,
  end: number }

/**
  * Given an authored user id, a valid channel id and a start index, gives the next 50 messages
  * @param {string} token - The token of the user who is making the request
  * @param {number} channelId - The id of the channel whose messages are being requested
  * @param {number} start - The index of the first message to be returned
  *
  *
  * @returns {{messages:  array<{ messageId: number,
   *                               uId: number,
   *                               message: string,
   *                               timeSent: number }>,
   *           start: number,
   *           end: number}}
   * @returns {{error: string}} - if given invalid channelId, unauthorised token, invalid token, or
   * start is greater than total number of messages
   * messages - array for messages including the messageId, uId of sender, message and timeSent.
   * start - The index of the first message returned.
   * End - The index of the last message returned.
 */

export function channelMessagesV3(token: string, channelId: number, start: number): ChannelMessages {
  const data = getData();
  const channels = data.channels;

  if (!checkToken(token)) {
    throw HTTPError(403, 'invalid token');
  }

  if (!checkChannelId(channelId)) {
    throw HTTPError(400, 'invalid channel Id');
  }
  const authUserId = getUserIdFromToken(token);
  if (!checkAuthorisedUser(authUserId, channelId)) {
    throw HTTPError(403, 'unauthorised user');
  }

  const channelPlace = getChannelIdPlace(channelId);
  if (start > channels[channelPlace].messages.length || start < 0) {
    throw HTTPError(400, 'invalid start position');
  }

  const messages = channels[channelPlace].messages;
  const end = start + 50;

  for (let i = 0; i < messages.length; i++) {
    const messagePlace = getMessageFromId(messages[i].messageId).messagePlace;
    const message = channels[channelPlace].messages[messagePlace];
    if (hasReacted(authUserId, message)) {
      messages[i].reacts[0].isThisUserReacted = true;
    }
  }

  if (end > messages.length) {
    return { messages: messages.slice(start), start: start, end: -1 };
  }
  return { messages: messages.slice(start, end), start: start, end: end };
}

/**
  * Given a channelId of a channel that the authorised user is part of,
  * they are removed from that channel
  *
  * @param {string} token - token of the authorised user
  * @param {number} channelId - id of the channel
  *
  * @returns {{}} - if no error
  * @returns {{error: string}} - if channelId does not refer to a valid channel,
  * user is not a member of the channel, or token is invalid
*/

export function channelLeaveV2(token: string, channelId: number): Empty {
  if (!checkChannelId(channelId)) {
    throw HTTPError(400, 'invalid channel id!');
  }
  if (!checkToken(token)) {
    throw HTTPError(403, 'invalid token!');
  }
  const authUserId = getUserIdFromToken(token);
  if (!checkAuthorisedUser(authUserId, channelId)) {
    throw HTTPError(403, 'you are not a member!');
  }
  if (standupStarter(token, channelId)) {
    throw HTTPError(400, 'you started an active standup!');
  }
  const data = getData();
  const channels = data.channels;
  const channelPlace = getChannelIdPlace(channelId);
  const memberPlace = getUserIdPlaceMember(authUserId, channelId);
  if (checkIfOwner(authUserId, channelId)) {
    const ownerPlace = getUserIdPlaceOwner(authUserId, channelId);
    channels[channelPlace].ownerMembers.splice(ownerPlace, 1);
    channels[channelPlace].allMembers.splice(memberPlace, 1);
  } else if (!checkIfOwner(authUserId, channelId)) {
    channels[channelPlace].allMembers.splice(memberPlace, 1);
  }
  setData(data);
  return {};
}

/**
  * Given a channelId of a channel that the authorised user is an owner of,
  * they make an existing member an owner
  *
  * @param {string} token - token of the authorised user
  * @param {number} channelId - id of the channel
  * @param {number} uId - id of an existing member
  *
  * @returns {{}} - if no error
  * @returns {{error: string}} - if channelId does not refer to a valid channel,
  * uId or token is invalid, token is not an owner, uId is not an existing member,
  * or the uId is already an owner
*/

export function channelAddOwnerV2(token: string, channelId: number, uId: number): Empty {
  if (!checkChannelId(channelId)) {
    throw HTTPError(400, 'invalid channel id!');
  }
  if (!checkUserId(uId)) {
    throw HTTPError(400, 'invalid user id!');
  }
  if (!checkToken(token)) {
    throw HTTPError(403, 'invalid token!');
  }
  const data = getData();
  const users = data.users;
  const authUserId = getUserIdFromToken(token);
  const authUserPlace = getUserIdPlace(authUserId);
  if (!checkIfOwner(authUserId, channelId) && users[authUserPlace].permissionId !== 1) {
    throw HTTPError(403, 'you do not have owner permissions!');
  }
  if (!checkAuthorisedUser(uId, channelId)) {
    throw HTTPError(400, 'given user id is not a member!');
  }
  if (checkIfOwner(uId, channelId)) {
    throw HTTPError(400, 'given user id is already an owner!');
  }
  const channels = data.channels;
  const channelPlace = getChannelIdPlace(channelId);
  const userPlace = getUserIdPlace(uId);
  channels[channelPlace].ownerMembers.push(users[userPlace]);
  setData(data);
  return {};
}

/**
  * Given a channelId of a channel that the authorised user is an owner of,
  * they make an existing member an owner
  *
  * @param {string} token - token of the authorised user
  * @param {number} channelId - id of the channel
  * @param {number} uId - id of an existing member
  *
  * @returns {{}} - if no error
  * @returns {{error: string}} - if channelId does not refer to a valid channel,
  * uId or token is invalid, token is not an owner, uId is not an existing member,
  * or the uId is already an owner
*/

export function channelRemoveOwnerV2(token: string, channelId: number, uId: number) {
  if (!checkChannelId(channelId)) {
    throw HTTPError(400, 'invalid channel id');
  }
  if (!checkUserId(uId)) {
    throw HTTPError(400, 'invalid user id!');
  }
  if (!checkToken(token)) {
    throw HTTPError(403, 'invalid token!');
  }
  if (!checkIfOwner(uId, channelId)) {
    throw HTTPError(400, 'given user is not an owner!');
  }
  const data = getData();
  const users = data.users;
  const authUserId = getUserIdFromToken(token);
  const authUserPlace = getUserIdPlace(authUserId);
  if (!checkIfOwner(authUserId, channelId) && users[authUserPlace].permissionId !== 1) {
    throw HTTPError(403, 'you do not have owner permissions!');
  }
  const channels = data.channels;
  const channelPlace = getChannelIdPlace(channelId);
  if (channels[channelPlace].ownerMembers.length === 1) {
    throw HTTPError(400, 'you cannot remove the only owner!');
  }
  const ownerPlace = getUserIdPlaceOwner(uId, channelId);
  channels[channelPlace].ownerMembers.splice(ownerPlace, 1);
  setData(data);
  return {};
}
