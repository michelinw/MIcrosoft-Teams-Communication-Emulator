import HTTPError from 'http-errors';
import { getUserIdFromToken } from './helper/userHelper';
import { getData } from './dataStore';
import { checkToken } from './helper/tokenHelper';

type Notification = {
  channelId: number,
  dmId: number,
  notificationMessage: string
};

type Notifications = {
  notifications: Notification[]
};

/**
 * Obtains a user's notifications
 *
 * @param {string} token
 *
 * @returns {Notifications} - returns an array of notifs
 */

export function notificationsGetV1(token: string): Notifications {
  if (!checkToken(token)) {
    throw HTTPError(403, 'invalid token!');
  }

  const uId = getUserIdFromToken(token);
  const data = getData();
  const notifications = data.notifs;

  let count = 0;
  const returnNotifs = [];

  for (let i = 0; count < 20 && i < notifications.length; i++) {
    const notification = notifications[i];
    if (notification.recipient === uId) {
      const returnNotif = {
        channelId: notification.channelId,
        dmId: notification.dmId,
        notificationMessage: notification.notificationMessage
      };
      returnNotifs.push(returnNotif);
      count++;
    }
  }

  return { notifications: returnNotifs };
}
