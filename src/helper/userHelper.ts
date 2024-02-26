import { getData, setData } from '../dataStore';
import { getChannelIdPlace } from './channelHelper';
import { getHashOf } from './tokenHelper';

/**
  * Checks if the given userId is valid
  *
  * @param {number} userId - a userId
  *
  * @returns {true} - if userId is valid
  * @returns {false} - if userId is invalid
*/

type User = {
  uId: number,
  nameFirst: string,
  nameLast: string,
  email: string,
  handleStr: string,
  password: string,
  permissionId: number,
  profileImageUrl: string
}

type sessions = {
  uId: number,
  token: string
}

export function checkUserId(authUserId: number): boolean {
  const data = getData();
  const users = data.users;

  if (users.find(({ uId }) => authUserId === uId)) {
    return true;
  } else {
    return false;
  }
}

/**
  * Finds the place of the users array in the dataStore given an userId
  *
  * @param {number} authUserId - User Id of the authorised user
  *
  * @returns {number} - when the userId has been found in the dataStore
  *
*/

export function getUserIdPlace(authUserId: number): number {
  const data = getData();
  const users = data.users;
  const userIds = [...users.map((o: User) => o.uId)];
  return userIds.indexOf(authUserId);
}

/**
  * Finds the place of the ownerMembers array in the dataStore given an userId
  *
  * @param {number} authUserId - User Id of the authorised user
  * @param {number} channelId - id of a channel
  *
  * @returns {number} - when the userId has been found in the dataStore
  *
*/

export function getUserIdPlaceOwner(authUserId: number, channelId: number): number {
  const data = getData();
  const channels = data.channels;
  const channelPlace = getChannelIdPlace(channelId);
  const userIds = [...channels[channelPlace].ownerMembers.map((o: User) => o.uId)];
  return userIds.indexOf(authUserId);
}

/**
  * Finds the place of the allMembers array in the dataStore given an userId
  *
  * @param {number} authUserId - User Id of the authorised user
  * @param {number} channelId = id of a channel
  *
  * @returns {number} - when the userId has been found in the dataStore
  *
*/

export function getUserIdPlaceMember(authUserId: number, channelId: number): number {
  const data = getData();
  const channels = data.channels;
  const channelPlace = getChannelIdPlace(channelId);
  const userIds = [...channels[channelPlace].allMembers.map((o: User) => o.uId)];
  return userIds.indexOf(authUserId);
}

/**
  * Finds the corresponding authUserId given a token
  *
  * @param {string} token - token of the authorised user
  *
  * @returns {number} - returns authUserId
*/

export function getUserIdFromToken(token: string): number {
  const data = getData();
  const sessions = data.sessions;
  const tokens = [sessions.map((o: sessions) => getHashOf(o.token))];
  if (tokens[0].find(element => element === token) === token) {
    const place = tokens[0].indexOf(token);
    return sessions[place].uId;
  }
}

/**
  * Finds the corresponding token given a uId
  *
  * @param {number} uId - uId of user
  *
  * @returns {string} - returns hashed token
*/

export function getTokenFromUserId(uId: number): string {
  const data = getData();
  const sessions = data.sessions;
  const uIds = [sessions.map((o: sessions) => o.uId)];
  if (uIds[0].find(element => element === uId) === uId) {
    const place = uIds[0].indexOf(uId);
    return getHashOf(sessions[place].token);
  }
}

/**
  * Finds the corresponding user handle given a token
  *
  * @param {string} token - token of the authorised user
  *
  * @returns {string} handleStr
*/

export function getUserHandleFromToken(token: string): string {
  const data = getData();
  const userId = getUserIdFromToken(token);
  const place = getUserIdPlace(userId);
  return data.users[place].handleStr;
}

/**
  * Update user details across channel and dms
  *
  * @param {user} user - user updated
  *
*/

export function updateUser(user: User) {
  const member = {
    uId: user.uId,
    email: user.email,
    nameFirst: user.nameFirst,
    nameLast: user.nameLast,
    handleStr: user.handleStr,
    profileImageUrl: user.profileImageUrl
  };

  const data = getData();
  for (let i = 0; i < data.channels.length; i++) {
    for (let j = 0; j < data.channels[i].allMembers.length; j++) {
      if (data.channels[i].allMembers[j].uId === member.uId) {
        data.channels[i].allMembers[j] = member;
      }
    }
  }

  for (let i = 0; i < data.channels.length; i++) {
    for (let j = 0; j < data.channels[i].ownerMembers.length; j++) {
      if (data.channels[i].ownerMembers[j].uId === member.uId) {
        data.channels[i].ownerMembers[j] = member;
      }
    }
  }

  for (let i = 0; i < data.dms.length; i++) {
    for (let j = 0; j < data.dms[i].members.length; j++) {
      if (data.dms[i].members[j].uId === member.uId) {
        data.dms[i].members[j] = member;
      }
    }
  }

  setData(data);
}
