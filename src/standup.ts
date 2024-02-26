import { getData, setData } from './dataStore';
import { checkToken } from './helper/tokenHelper';
import { checkChannelId, checkAuthorisedUser } from './helper/channelHelper';
import { getStandupPlace, standupFinish } from './helper/standupHelper';
import { getUserIdFromToken, getUserHandleFromToken } from './helper/userHelper';
import HTTPError from 'http-errors';

type TimeFinish = { timeFinish: number }
type ActiveStatus = { isActive: boolean, timeFinish: number }
type Empty = Record<string, never>

/**
  * Starts a standup in a channel
  *
  * @param {string} token - user token
  * @param {number} channelId - id of a channel
  * @param {number} length - length of the standup
  *
  * @returns {number} timeFinish - if standup was successful
*/

export function standupStartV1(token: string, channelId: number, length: number): TimeFinish {
  if (length < 0) {
    throw HTTPError(400, 'length cannot be negative!');
  }
  const authUserId = getUserIdFromToken(token);
  const status = standupActiveV1(token, channelId);
  if (status.isActive) {
    throw HTTPError(400, 'a standup is already active!');
  }

  const timeStart = Math.floor(Date.now() / 1000);
  const timeFinish = Number(timeStart) + length;
  const message = '';

  const data = getData();
  const standups = data.standups;
  const newStandup = {
    channelId: channelId,
    uId: authUserId,
    timeStart: timeStart,
    timeFinish: timeFinish,
    message: message
  };
  standups.push(newStandup);
  setData(data);
  setTimeout(standupFinish, length * 1000, token, channelId);
  return { timeFinish: timeFinish };
}

/**
  * Checks if a standup is active
  *
  * @param {string} token - user token
  * @param {number} channelId - id of a channel
  *
  * @returns {boolean} isActive - true/false depending on if active
  * @returns {number} timeFinish - number/null depending on if active
*/

export function standupActiveV1(token: string, channelId: number): ActiveStatus {
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
  const data = getData();
  const standups = data.standups;
  let isActive = false;
  let timeFinish = null;
  for (let i = 0; i < standups.length && !isActive; i++) {
    if (channelId === standups[i].channelId) {
      isActive = true;
      timeFinish = standups[i].timeFinish;
    }
  }
  return { isActive: isActive, timeFinish: timeFinish };
}

/**
  * Sends a message in a standup
  *
  * @param {string} token - user token
  * @param {number} channelId - id of a channel
  * @param {string} message - message sent
*/

export function standupSendV1(token: string, channelId: number, message: string): Empty {
  if (message.length < 1) {
    return {};
  }
  if (message.length > 1000) {
    throw HTTPError(400, 'message is too long!');
  }
  const status = standupActiveV1(token, channelId);
  if (!status.isActive) {
    throw HTTPError(400, 'there is no standup active!');
  }
  const data = getData();
  const standups = data.standups;
  const place = getStandupPlace(channelId);
  const handle = getUserHandleFromToken(token);
  if (standups.length !== 0) {
    standups[place].message = standups[place].message + handle + ':' + message + '\n';
  }
  setData(data);
  return {};
}
