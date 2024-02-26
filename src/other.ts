import { setData, getData } from './dataStore';
import { readdirSync, rmSync } from 'fs';
import { checkAuthorisedUser } from './helper/channelHelper';
import { findMessage } from './helper/messageHelper';
import { checkAuthorisedUserDm } from './helper/dmHelper';
import { checkToken } from './helper/tokenHelper';
import { getUserIdFromToken } from './helper/userHelper';

import HTTPError from 'http-errors';

type Reacts = {reactId: number, uIds: any[], isThisUserReacted: boolean};
type Message = {
  messageId: number,
  uId: number,
  message: string,
  reacts: Reacts[],
  timeSent: number,
  isPinned: boolean
};

/**
  * <Reset data to original form>
  *
  * @returns {} - for all circumstance
*/

export function clearV1 () {
  setData({
    users: [],
    channels: [],
    sessions: [],
    dms: [],
    standups: [],
    notifs: [],
    resetCodes: [],
    deletedUsers: [],
  });
  // deletes all photos in the images folder
  // except default.jpg
  const files = readdirSync('images');
  for (const file of files) {
    if (file === 'default.jpg') {
      continue;
    }
    rmSync('images/' + file);
  }
  return {};
}

/**
  * Given a query substring, returns a collection of messages in all of the
  * channels/DMs that the user has joined that contain the query
  *
  * @param {string} token - token of the authorised user
  * @param {string} queryStr - token of the authorised user
  *
  * @returns {} - for all circumstance
*/

export function search (token: string, queryStr: string) {
  if (!checkToken(token)) {
    throw HTTPError(403, 'invalid token');
  }

  if (queryStr.length < 1 || queryStr.length > 1000) {
    throw HTTPError(400, 'invalid message');
  }

  const data = getData();
  const channels = data.channels;
  const dms = data.dms;
  const authUserId = getUserIdFromToken(token);
  let messageList: Message[] = [];
  let list: Message[] = [];
  for (let i = 0; i < channels.length; i++) {
    if (checkAuthorisedUser(authUserId, channels[i].channelId)) {
      const messageArray = findMessage(i, -1, queryStr);
      list = list.concat(messageArray);
    }
  }
  messageList = messageList.concat(list);
  list = [];
  for (let i = 0; i < dms.length; i++) {
    if (checkAuthorisedUserDm(authUserId, dms[i].dmId)) {
      const messageArray = findMessage(-1, i, queryStr);
      list = list.concat(messageArray);
    }
  }
  messageList = messageList.concat(list);
  return { messages: messageList };
}
