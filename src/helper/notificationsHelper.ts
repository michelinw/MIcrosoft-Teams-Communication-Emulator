import { getData, setData } from '../dataStore';
import { getUserHandleFromToken } from './userHelper';
import { getChannelIdPlace, checkAuthorisedUser } from './channelHelper';
import { getDmIdPlace, checkAuthorisedUserDm } from './dmHelper';

/**
 * Creates a notification based on the notifType
 *
 * @param {number} channelId
 * @param {number} dmId
 * @param {string} notifType
 * @param {string} senderToken
 * @param {number} recipientId
 * @param {string} message (optional)
 *
 * @returns {notification[]} array of notifications
 */

export function createNotification(channelId: number, dmId: number, notifType: string, senderToken: string, recipientId: number, message?: string) {
  const data = getData();
  const notifications = data.notifs;
  const userHandle = getUserHandleFromToken(senderToken);

  if (notifType === 'channelInvite') {
    const channelPlace = getChannelIdPlace(channelId);
    const channelName = data.channels[channelPlace].name;

    const notifMessage = userHandle + ' added you to ' + channelName;
    const notification = {
      channelId: channelId,
      dmId: dmId,
      notificationMessage: notifMessage,
      recipient: recipientId
    };
    notifications.unshift(notification);
  } else if (notifType === 'dmInvite') {
    const dmPlace = getDmIdPlace(dmId);
    const dmName = data.dms[dmPlace].name;

    const notifMessage = userHandle + ' added you to ' + dmName;
    const notification = {
      channelId: channelId,
      dmId: dmId,
      notificationMessage: notifMessage,
      recipient: recipientId
    };
    notifications.unshift(notification);
  } else if (notifType === 'channelTag') {
    const channelPlace = getChannelIdPlace(channelId);
    const channelName = data.channels[channelPlace].name;

    const notifMessage = userHandle + ' tagged you in ' + channelName + ': ' + message?.slice(0, 20);
    const notification = {
      channelId: channelId,
      dmId: dmId,
      notificationMessage: notifMessage,
      recipient: recipientId
    };
    notifications.unshift(notification);
  } else if (notifType === 'dmTag') {
    const dmPlace = getDmIdPlace(dmId);
    const dmName = data.dms[dmPlace].name;

    const notifMessage = userHandle + ' tagged you in ' + dmName + ': ' + message?.slice(0, 20);
    const notification = {
      channelId: channelId,
      dmId: dmId,
      notificationMessage: notifMessage,
      recipient: recipientId
    };
    notifications.unshift(notification);
  } else if (notifType === 'channelReact') {
    const valid = checkAuthorisedUser(recipientId, channelId);
    if (valid === true) {
      const channelPlace = getChannelIdPlace(channelId);
      const channelName = data.channels[channelPlace].name;

      const notifMessage = userHandle + ' reacted to your message in ' + channelName;
      const notification = {
        channelId: channelId,
        dmId: dmId,
        notificationMessage: notifMessage,
        recipient: recipientId
      };
      notifications.unshift(notification);
    }
  } else if (notifType === 'dmReact') {
    const valid = checkAuthorisedUserDm(recipientId, dmId);
    if (valid === true) {
      const dmPlace = getDmIdPlace(dmId);
      const dmName = data.dms[dmPlace].name;

      const notifMessage = userHandle + ' reacted to your message in ' + dmName;
      const notification = {
        channelId: channelId,
        dmId: dmId,
        notificationMessage: notifMessage,
        recipient: recipientId
      };
      notifications.unshift(notification);
    }
  }

  setData(data);

  return notifications;
}

/**
 * Checks if a user has been tagged
 *
 * @param {string} message
 * @param {number} id
 *
 * @returns {uId[]} - array of users who are tagged
 */

export function checkTag(message: string, id: number, location: string) {
  const msg = message + ' ';
  let index = 0;
  const isAlphaNumeric = (str: string) => /^[a-z0-9]+$/gi.test(str);
  const handleArr = [];

  while ((index = msg.indexOf('@', index)) !== -1) {
    let handle = '';

    for (let i = index + 1; isAlphaNumeric(msg[i]) === true; i++) {
      handle = handle + msg[i];
    }

    let uId = 0;
    if ((uId = checkHandle(handle, id, location)) !== -1 && handleArr.includes(uId) === false) {
      handleArr.push(uId);
    }
    index++;
  }

  return handleArr;
}

/**
 * Checks a user's handle
 *
 * @param {string} handle - user's string handle
 * @param {number} id
 * @param {string} location - where the handle is stored
 *
 * @returns {number} returns uId based off handle,
 * or returns -1
 */

function checkHandle(handle: string, id: number, location: string) {
  const data = getData();
  for (let i = 0; i < data.users.length; i++) {
    if (handle === data.users[i].handleStr) {
      let valid = false;
      if (location === 'channel') {
        valid = checkAuthorisedUser(data.users[i].uId, id);
      } else if (location === 'dm') {
        valid = checkAuthorisedUserDm(data.users[i].uId, id);
      }
      if (valid === true) {
        return data.users[i].uId;
      }
    }
  }
  return -1;
}
