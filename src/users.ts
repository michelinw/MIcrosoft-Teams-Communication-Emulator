import { getData, setData } from './dataStore';
import { checkUserId, getUserIdPlace, getUserIdFromToken, updateUser } from './helper/userHelper';
import { checkToken } from './helper/tokenHelper';
import validator from 'validator';
import HTTPError from 'http-errors';
import request from 'sync-request';
import randomstring from 'randomstring';
import Jimp from 'jimp';
import sizeOf from 'image-size';
import { rmSync } from 'fs';
import fs from 'fs';
import config from './config.json';

type User = {
  uId: number,
  email: string,
  nameFirst: string,
  nameLast: string,
  handleStr: string,
  profileImageUrl: string
};
type UserProfile = {user: User};
type Empty = Record<string, never>;
type UserAll = {users: User[]};
type channelsJoined = {numChannelsJoined: number, timeStamp: number};
type dmsJoined = {numDmsJoined: number, timeStamp: number};
type messagesSent = {numMessagesSent: number, timeStamp: number};
type channelsExist = {numChannelsExist: number, timeStamp: number};
type dmsExist = {numDmsExist: number, timeStamp: number};
type messagesExist = {numMessagesExist: number, timeStamp: number};
type UserStats = {
  channelsJoined: channelsJoined[],
  dmsJoined: dmsJoined[],
  messagesSent: messagesSent[],
  involvementRate: number
};
type WorkspaceStats = {channelsExist: channelsExist, dmsExist: dmsExist, messagesExist: messagesExist, utilizationRate: number};

/**
  * Given the user of the function is authorised, and for a valid user,
  * returns information about their user ID, email, first name, last
  * name, and handle
  * @param {number} token - The token of the user who is making the request
  * @param {number} uId - The id of the user whose profile is being requested
  *
  * @returns {user: {
 *             uId: number,
 *             email: string,
 *             nameFirst: string,
 *             nameLast: string,
 *             handleStr: string,
 *           }} user - The user profile being requested
**/

export function userProfileV1(token: string, uId: number): UserProfile | Error {
  const data = getData();
  const users = data.users;

  if (!checkToken(token)) {
    throw HTTPError(403, 'invalid token!');
  }

  if (!checkUserId(uId)) {
    throw HTTPError(400, 'invalid uId!');
  }

  const userPlace = getUserIdPlace(uId);

  return {
    user: {
      uId: users[userPlace].uId,
      email: users[userPlace].email,
      nameFirst: users[userPlace].nameFirst,
      nameLast: users[userPlace].nameLast,
      handleStr: users[userPlace].handleStr,
      profileImageUrl: users[userPlace].profileImageUrl
    }
  };
}

/**
  * Given the user of the function is authorised, change the user's nameFirst and nameLast
  * @param {number} token - The token of the user who is making the request
  * @param {string} nameFirst - The string to change nameFirst to
  * @param {string} nameLast - The string to change nameLast to
  *
  * @returns {}
**/

export function userSetname (token: string, nameFirst: string, nameLast: string): Empty {
  if (!checkToken(token)) {
    throw HTTPError(403, 'invalid token!');
  }

  if (nameFirst.length > 50 || nameFirst.length < 1 || nameLast.length > 50 || nameLast.length < 1) {
    throw HTTPError(400, 'invalid name!');
  }

  const data = getData();
  const userId = getUserIdFromToken(token);
  const place = getUserIdPlace(userId);

  data.users[place].nameFirst = nameFirst;
  data.users[place].nameLast = nameLast;

  setData(data);
  updateUser(data.users[place]);

  return {};
}

/**
  * Given the user of the function is authorised, change the user's email
  * @param {number} token - The token of the user who is making the request
  * @param {string} email - The email to change to
  *
  * @returns {}
**/

export function userSetemail (token: string, email: string): Empty {
  const data = getData();
  const users = data.users;

  if (!checkToken(token)) {
    throw HTTPError(403, 'invalid token!');
  }

  if (users.filter(user => user.email === email).length > 0) {
    throw HTTPError(400, 'email is already used by another user!');
  }

  if (validator.isEmail(email) === false) {
    throw HTTPError(400, 'invalid email!');
  }

  const userId = getUserIdFromToken(token);
  const place = getUserIdPlace(userId);

  data.users[place].email = email;
  setData(data);
  updateUser(data.users[place]);

  return {};
}

/**
  * Given the user of the function is authorised, change the user's handleStr
  * @param {number} token - The token of the user who is making the request
  * @param {string} handleStr - The handleStr to change to
  *
  * @returns {}
**/

export function userSethandle (token: string, handleStr: string): Empty {
  const data = getData();
  const users = data.users;
  if (!checkToken(token)) {
    throw HTTPError(403, 'invalid token');
  }

  const alphanumerical = handleStr.replace(/[^a-z0-9]/gi, '');

  if (handleStr.length > 20 || handleStr.length < 3 || handleStr !== alphanumerical) {
    throw HTTPError(400, 'invalid handle!');
  }

  if (users.filter(user => user.handleStr === handleStr).length > 0) {
    throw HTTPError(400, 'handle is already being used by another user');
  }

  const userId = getUserIdFromToken(token);
  const place = getUserIdPlace(userId);

  data.users[place].handleStr = handleStr;
  setData(data);
  updateUser(data.users[place]);

  return {};
}

/**
  * Given the user of the function is authorised, returns a list of all users
  * and their associated details
  * @param {number} token - The token of the user who is making the request
  *
  * @returns {{users: Array<{
  *             uId: number,
  *             email: string,
  *             nameFirst: string,
  *             nameLast: string,
  *             handleStr: string,}>
  * }}
**/

export function userAll(token: string): UserAll {
  if (!checkToken(token)) {
    throw HTTPError(403, 'invalid token!');
  }

  const data = getData();
  const list: User[] = [];

  for (let i = 0; i < data.users.length; i++) {
    const profile = userProfileV1(token, data.users[i].uId) as UserProfile;
    if (profile.user.email !== '') {
      list.push(profile.user);
    }
  }

  return { users: list };
}

/**
 * Given a valid user, crops the image given and saves it to the user's profile.
 * @param {number} token - The token of the user who is making the request
 * @param {string} img - The image to upload
 * @param {string} xStart - The x coordinate of the top left corner of the image
 * @param {string} yStart - The y coordinate of the top left corner of the image
 * @param {string} xEnd - The x coordinate of where the image will be cropped
 * @param {string} yEnd - The y coordinate of where the image will be cropped
 *
 * @returns {}
**/

export function uploadPhotoV1 (token: string, imgUrl: string, xStart: number, yStart: number, xEnd: number, yEnd: number): Empty {
  if (!checkToken(token)) {
    throw HTTPError(403, 'Invalid token');
  }
  if (xStart < 0 || yStart < 0 || xEnd < 0 || yEnd < 0 ||
    xStart >= xEnd || yStart >= yEnd) {
    throw HTTPError(400, 'Invalid bounds');
  }
  if (imgUrl.indexOf('.jpg' || '.jpeg') < 0) {
    throw HTTPError(400, 'Image does not have .jpg format');
  }
  // imgUrl returns an HTTP status other than 200,
  // or any other errors occur when attempting to retrieve the image
  // request the url
  const img = request('GET', imgUrl);
  // check the status code
  if (img.statusCode !== 200) {
    throw HTTPError(400, 'Image does not exist');
  }

  // unique string
  const imgName = randomstring.generate() + '.jpg';
  // download the image
  const imgBody = request('GET', imgUrl).getBody();
  // save the image
  fs.writeFileSync('images/' + imgName, imgBody, { flag: 'w' });
  const dimensions = sizeOf('images/' + imgName);

  if (xEnd > dimensions.width || yEnd > dimensions.height) {
    rmSync('images/' + imgName);
    throw HTTPError(400, 'Bounds given are larger than the image');
  }

  Jimp.read('images/' + imgName)
    .then(image => {
      image.crop(xStart, yStart, xEnd - xStart, yEnd - yStart)
        .write('images/' + imgName);
    });

  const data = getData();
  const authUserId = getUserIdFromToken(token);
  const userPlace = getUserIdPlace(authUserId);
  const HOST = parseInt(process.env.PORT || config.port);
  const PORT = process.env.IP || 'localhost';
  const URL = 'http://' + HOST + ':' + PORT + '/imgurl/' + imgName;
  data.users[userPlace].profileImageUrl = URL;
  setData(data);
  updateUser(data.users[userPlace]);
  return {};
}

/**
 * Fetches the required statistics about this user's use of UNSW Beans.
 *
 * @param {number} token - The token of the user who is making the request
 *
 * @returns {userStats} userStats - The statistics about this user's use of UNSW Beans
 */

export function userStatsV1(token: string): {userStats: UserStats} {
  if (!checkToken(token)) {
    throw HTTPError(403, 'invalid token!');
  }

  const data = getData();
  const userId = getUserIdFromToken(token);

  let channelsJoined = [];
  const channelsList = [];

  const userPlace = getUserIdPlace(userId);
  const timeJoined = data.users[userPlace].timeJoined;

  for (let i = 0; i < data.channels.length; i++) {
    for (let j = 0; j < data.channels[i].allMembers.length; j++) {
      if (data.channels[i].allMembers[j].uId === userId) {
        channelsList.push(data.channels[i]);
      }
    }
  }

  channelsJoined.push({
    numChannelsJoined: 0,
    timeStamp: timeJoined,
  });

  let channelsCount = 1;
  for (let j = 0; j < channelsList.length; j++) {
    let time;
    for (let i = 0; i < channelsList[j].joinTime.length; i++) {
      if (channelsList[j].joinTime[i].userId === userId) {
        time = channelsList[j].joinTime[i].timeStamp;
      }
    }
    channelsJoined.push({
      numChannelsJoined: 0,
      timeStamp: time
    });
  }
  channelsJoined = channelsJoined.sort((a, b) => a.timeStamp - b.timeStamp);
  channelsJoined.forEach(function (element, index) { element.numChannelsJoined = index; });

  let dmsJoined = [];
  const dmsList = [];

  for (let i = 0; i < data.dms.length; i++) {
    for (let j = 0; j < data.dms[i].members.length; j++) {
      if (data.dms[i].members[j].uId === userId) {
        dmsList.push(data.dms[i]);
      }
    }
  }

  dmsJoined.push({
    numDmsJoined: 0,
    timeStamp: timeJoined,
  });

  let dmsCount = 1;
  for (const dm of dmsList) {
    const time = dm.createTime;
    dmsJoined.push({
      numDmsJoined: 0,
      timeStamp: time,
    });
  }

  dmsJoined = dmsJoined.sort((a, b) => a.timeStamp - b.timeStamp);
  dmsJoined.forEach(function (element, index) { element.numDmsJoined = index; });

  let messagesSent = [];

  messagesSent.push({
    numMessagesSent: 0,
    timeStamp: timeJoined,
  });

  for (const channel of channelsList) {
    for (const message of channel.messages) {
      if (message.uId === userId) {
        messagesSent.push({
          numMessagesSent: 0,
          timeStamp: message.timeSent,
        });
      }
    }
  }

  for (const dm of dmsList) {
    for (const message of dm.messages) {
      if (message.uId === userId) {
        messagesSent.push({
          numMessagesSent: 0,
          timeStamp: message.timeSent,
        });
      }
    }
  }

  messagesSent = messagesSent.sort((a, b) => a.timeStamp - b.timeStamp);
  messagesSent.forEach(function (element, index) { element.numMessagesSent = index; });

  let numMessages = 0;

  for (const channel of data.channels) {
    channelsCount = numMessages + channel.messages.length;
    numMessages += channel.messages.length;
  }

  for (const dms of data.dms) {
    dmsCount = numMessages + dms.messages.length;
    numMessages += dms.messages.length;
  }

  let involvement = 0;
  let messageCount;
  if (messagesSent.length === 0) {
    messageCount = 0;
  } else {
    messageCount = messagesSent[messagesSent.length - 1].numMessagesSent;
  }
  if (data.channels.length !== 0 && data.dms.length !== 0 && numMessages !== 0) {
    involvement = (messageCount + dmsCount + channelsCount) / (numMessages + data.dms.length + data.channels.length);
  }

  if (involvement > 1) {
    involvement = 1;
  }

  return {
    userStats: {
      channelsJoined: channelsJoined,
      dmsJoined: dmsJoined,
      messagesSent: messagesSent,
      involvementRate: involvement,
    }
  };
}

/**
 * Fetches the required statistics about this user's use of UNSW Beans.
 *
 * @param {number} token - The token of the user who is making the request
 *
 * @returns {WorkspaceStats} workspaceStats - Fetches the required statistics about the workspace's use of UNSW Beans.
 */

export function usersStatsV1(token: string): WorkspaceStats {
  if (!checkToken(token)) {
    throw HTTPError(403, 'invalid token!');
  }
  let stats: WorkspaceStats;
  return stats;
}
