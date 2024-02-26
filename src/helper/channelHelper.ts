import { getData } from '../dataStore';

/**
  * Checks if the given channelId is valid
  *
  * @param {number} channelId - a channelId
  *
  * @returns {true} - if channelId is valid
  * @returns {false} - if channelId is invalid
*/

export function checkChannelId(channelId: number): boolean {
  const data = getData();
  const channels = data.channels;
  const givenChannelId = channelId;

  if (channels.find(({ channelId }) => givenChannelId === channelId)) {
    return true;
  } else {
    return false;
  }
}

/**
  * Finds the place of the channel array in the dataStore given a channelId
  *
  * @param {number} channelId - given channelId
  *
  * @returns {number} - when the channelId has been found in the dataStore
  *
*/

export function getChannelIdPlace(channelId: number): number {
  const data = getData();
  const channels = data.channels;
  const givenChannelId = channelId;
  const channelIds = [...channels.map(o => o.channelId)];
  return channelIds.indexOf(givenChannelId);
}

/**
  * Checks if a user is part of a channel
  *
  * @param {number} authUserId - User Id of the authorised user
  * @param {number} channelId - given channelId
  *
  * @returns {true} - if the user is part of the channel
  * @returns {false} - if the user is not a part of the channel
  *
*/

export function checkAuthorisedUser(authUserId: number, channelId: number): boolean {
  const data = getData();
  const channels = data.channels;
  const channelPlace = getChannelIdPlace(channelId);
  if (channels[channelPlace].allMembers.find(({ uId }) => authUserId === uId)) {
    return true;
  } else {
    return false;
  }
}

/**
  * Given a channelId and userId, checks if they are an owner of
  * the channel
  *
  * @param {number} authUserId - id of the authorised user
  * @param {number} channelId - id of a channel
  *
  * @returns {true} - if user is an owner
  * @returns {false} - if user is not an owner
*/

export function checkIfOwner(authUserId: number, channelId: number): boolean {
  const data = getData();
  const channels = data.channels;
  const channelPlace = getChannelIdPlace(channelId);
  if (channels[channelPlace].ownerMembers.find(({ uId }) => authUserId === uId)) {
    return true;
  } else {
    return false;
  }
}
