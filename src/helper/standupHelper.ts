import { getData } from '../dataStore';
import { messageSendV2 } from '../message';
import { standupActiveV1 } from '../standup';
import { getUserIdFromToken } from './userHelper';

type Empty = Record<string, never>

/**
 * Gets a place of a standup in the array
 *
 * @param {number} channelId
 *
 * @returns {number} - the index of the standup
 */

export function getStandupPlace(channelId: number): number {
  const data = getData();
  const standups = data.standups;
  const givenChannelId = channelId;
  const channelIds = [...standups.map(o => o.channelId)];
  return channelIds.indexOf(givenChannelId);
}

/**
 * When a standup finishes, sends a summary message
 * and deletes the standups from the database
 *
 * @param {string} token
 * @param {number} channelId
 *
 * @returns {} - removes the standup and sends final message
 */

export function standupFinish(token: string, channelId: number): Empty {
  const data = getData();
  const standups = data.standups;
  if (standups.length !== 0) {
    const standupPlace = getStandupPlace(channelId);
    const message = standups[standupPlace].message;
    messageSendV2(token, channelId, message, true);
    standups.splice(standupPlace, 1);
  }
}

/**
 * Checks if a user started a standup
 *
 * @param {string} token
 * @param {number} channelId
 *
 * @returns {boolean} - whether or not the given user started the standup
 */

export function standupStarter(token: string, channelId: number): boolean {
  const status = standupActiveV1(token, channelId);
  let isStarter = false;
  if (!status.isActive) {
    return isStarter;
  }

  const data = getData();
  const standups = data.standups;
  const authUserId = getUserIdFromToken(token);
  const place = getStandupPlace(channelId);
  if (authUserId === standups[place].uId) {
    isStarter = true;
  }
  return isStarter;
}
