import { getData, setData } from './dataStore';
import { checkToken } from './helper/tokenHelper';
import { checkUserId, getUserIdFromToken, getUserIdPlace } from './helper/userHelper';
import { checkUserInDm, getDmIdPlace, checkDmId } from './helper/dmHelper';
import HTTPError from 'http-errors';
import { createNotification } from './helper/notificationsHelper';
import { getMessageFromId, hasReacted } from './helper/messageHelper';

type dmId = {dmId: number}
type error = {error: string}
type Member = {
  uId: number,
  nameFirst: string,
  nameLast: string,
  email: string,
  handleStr: string,
  profileImageUrl: string
}
type Reacts = {reactId: number, uIds: any[], isThisUserReacted: boolean};

type Message = {
  messageId: number,
  uId: number,
  message: string,
  reacts: Reacts[],
  timeSent: number,
  isPinned: boolean
}

/**
  * Creates a new dw with the users in uIds in it.
  * The user who created it automatically joins the dm and is the owner.
  *
  * @param {string} token - token of the authorised user
  * @param {array} uIds - array of user ids
  *
  * @returns {{dmId: number}} - if no error
*/

type Dms = {
  dmId: number,
  name: string,
  members: Member[],
  messages: Message[],
  owner: number,
  createTime: number,
};

export function dmCreateV2(token: string, uIds: number[]): dmId | error {
  const data = getData();
  const dms = data.dms;
  const users = data.users;
  if (!checkToken(token)) {
    throw HTTPError(403, 'invalid token');
  }
  // check ALL users ids are valid
  for (let i = 0; i < uIds.length; i++) {
    if (!checkUserId(uIds[i])) {
      throw HTTPError(400, 'invalid user id');
    }
  }
  // check that there are no duplicate user ids.
  for (let i = 0; i < uIds.length; i++) {
    if (uIds.filter(x => x === uIds[i]).length > 1) {
      throw HTTPError(400, 'duplicate user id');
    }
  }

  // The creator is the owner of the DM. name should be automatically generated based on the users that are in this DM.
  // The name should be an alphabetically-sorted, comma-and-space-separated list of user handles, e.g. 'ahandle1, bhandle2, chandle3'.
  const names = [];
  const members = [];
  const userId = getUserIdFromToken(token);
  uIds[uIds.length] = userId;

  for (let i = 0; i < uIds.length; i++) {
    const userPlace = getUserIdPlace(uIds[i]);
    const member = {
      uId: users[userPlace].uId,
      email: users[userPlace].email,
      nameFirst: users[userPlace].nameFirst,
      nameLast: users[userPlace].nameLast,
      handleStr: users[userPlace].handleStr,
      profileImageUrl: users[userPlace].profileImageUrl,
    };
    names.push(users[userPlace].handleStr);
    members.push(member);
  }

  // sort names in alphabetical order.
  names.sort((a, b) => a.localeCompare(b));
  const name = names.join(', ');

  const timeStamp = Math.floor(Date.now() / 1000);
  const messageArray: Message[] = [];
  const newDm: Dms = {
    dmId: dms.length + 1,
    name: name,
    members: members,
    messages: messageArray,
    owner: userId,
    createTime: timeStamp,
  };

  dms.push(newDm);
  setData(data);

  for (let j = 0; j < uIds.length; j++) {
    const uId = uIds[j];
    if (uId !== userId) {
      createNotification(-1, newDm.dmId, 'dmInvite', token, uId);
    }
  }

  return { dmId: newDm.dmId };
}

type dmElement = {dmId: number, name: string}
type dmList = {dms: dmElement[]}

/**
  * Given dmId, returns list of dms the member is part of.
  *
  * @param {string} token - token of the authorised user
  *
  * @returns {{dms: array<{ dmId: number
  *                         name: string}> }} - if no error
*/

export function dmListV2(token: string): dmList | error {
  const data = getData();
  const dms = data.dms;

  if (!checkToken(token)) {
    throw HTTPError(403, 'invalid token');
  }
  const userId = getUserIdFromToken(token);
  const dmList = [];
  let uIds = [];

  for (let i = 0; i < dms.length; i++) {
    uIds = [dms[i].members.map(o => o.uId)];
    if (uIds[0].find(o => o === userId) === userId) {
      const dm = {
        dmId: dms[i].dmId,
        name: dms[i].name,
      };
      dmList.push(dm);
    }
  }
  return { dms: dmList };
}

type member = {uId: number, email: string, nameFirst: string, nameLast: string, handleStr: string}
type dmDetails = {name: string, members: member[]}

/**
  * Given token of user and dmId of dm, returns details of the dm.
  *
  * @param {string} token - token of the authorised user
  * @param {number} dmId - Id of the dm
  * ...
  *
  * @returns {{ name: string,
 *           members: array<{
 *             uId: number,
 *             email: string,
 *             nameFirst: string,
 *             nameLast: string,
 *             handleStr: string,
 *           }>}} - if no error
*/

export function dmDetailsV2(token: string, dmId: number): dmDetails | error {
  const data = getData();
  const dms = data.dms;
  if (!checkToken(token)) {
    throw HTTPError(403, 'invalid token');
  }

  if (!checkDmId(dmId)) {
    throw HTTPError(400, 'invalid dm id');
  }

  const userId = getUserIdFromToken(token);
  const dmPlace = getDmIdPlace(dmId);
  if (!checkUserInDm(userId, dmPlace)) {
    throw HTTPError(403, 'user is not in dm');
  }

  return {
    name: dms[dmPlace].name,
    members: dms[dmPlace].members
  };
}

type Empty = Record<string, never>

/**
  * Given a dmId of a dm that the authorised user is a part of, remove the user from that dm. If the
  * user was the owner, give ownership to the first user in that dm.
  * @param {string} token - token of the authorised user
  * @param {number} dmId - Id of the channel
  *
  * @returns {Empty} - Empty object on success
*/

export function dmRemoveV2(token: string, dmId: number): Empty | error {
  const data = getData();
  const dms = data.dms;
  if (!checkToken(token)) {
    throw HTTPError(403, 'invalid token');
  }

  if (!checkDmId(dmId)) {
    throw HTTPError(400, 'invalid dm id');
  }
  const userId = getUserIdFromToken(token);
  const dmPlace = getDmIdPlace(dmId);
  if (!checkUserInDm(userId, dmPlace)) {
    throw HTTPError(403, 'user is not in dm');
  }

  if (dms[dmPlace].owner !== userId) {
    throw HTTPError(403, 'user is not owner');
  }
  dms.splice(dmPlace, 1);
  setData(data);
  return {};
}

/**
  * Given a dmId of a dm that the authorised user is a part of, remove the user from that dm. If the
  * user was the owner, give ownership to the first user in that dm.
  * @param {string} token - token of the authorised user
  * @param {number} dmId - Id of the channel
  *
  * @returns {Empty} - Empty object on success
*/

export function dmLeaveV2(token: string, dmId: number): Empty | error {
  const data = getData();
  const dms = data.dms;
  if (!checkToken(token)) {
    throw HTTPError(403, 'invalid token');
  }
  if (!checkDmId(dmId)) {
    throw HTTPError(400, 'invalid dm id');
  }
  const userId = getUserIdFromToken(token);
  const dmPlace = getDmIdPlace(dmId);
  if (!checkUserInDm(userId, dmPlace)) {
    throw HTTPError(403, 'user is not in dm');
  }

  const uIds = [dms[dmPlace].members.map(o => o.uId)];
  const place = uIds[0].indexOf(userId);
  dms[dmPlace].members.splice(place, 1);

  if (dms[dmPlace].members.length === 0) {
    dms.splice(dmPlace, 1);
  } else if (dms[dmPlace].owner === userId) {
    dms[dmPlace].owner = dms[dmPlace].members[0].uId;
  }

  setData(data);
  return {};
}

type messages = {messages: Message[], start: number, end: number}

/**
  * Given a dmId of a dm that the authorised user is a part of,
  * return up to 50 of the most recent messages in that dm.
  * @param {string} token - token of the authorised user
  * @param {number} dmId - Id of the channel
  *
  * @returns {{messages:  array<{ messageId: number,
  *                               uId: number,
  *                               message: string,
  *                               timeSent: number }>,
  *           start: number,
  *           end: number}} - messages in the dm between start and end index if no error
*/

export function dmMessagesV2(token: string, dmId: number, start: number): messages | error {
  const data = getData();
  const dms = data.dms;

  if (!checkToken(token)) {
    throw HTTPError(403, 'invalid token');
  }

  if (!checkDmId(dmId)) {
    throw HTTPError(400, 'invalid dm id');
  }

  const userId = getUserIdFromToken(token);
  const dmPlace = getDmIdPlace(dmId);

  if (!checkUserInDm(userId, dmPlace)) {
    throw HTTPError(403, 'user is not in dm');
  }

  if (start > dms[dmPlace].messages.length) {
    throw HTTPError(400, 'start is invalid');
  }

  if (start < 0) {
    throw HTTPError(400, 'start is invalid');
  }

  const messages = dms[dmPlace].messages;
  const end = start + 50;

  for (let i = 0; i < messages.length; i++) {
    const messagePlace = getMessageFromId(messages[i].messageId).messagePlace;
    const message: Message = dms[dmPlace].messages[messagePlace];
    if (hasReacted(userId, message)) {
      messages[i].reacts[0].isThisUserReacted = true;
    }
  }

  if (end > messages.length) {
    return { messages: messages.slice(start), start: start, end: -1 };
  }
  return { messages: messages.slice(start, end), start: start, end: end };
}
