import { getData, setData } from './dataStore';
import { checkToken } from './helper/tokenHelper';
import { getUserIdFromToken } from './helper/userHelper';
import { adminPlaceGivenId, userPlaceGivenId, removeFromChannels, removeFromDms } from './helper/adminHelper';
import HTTPError from 'http-errors';

type Empty = Record<string, never>

/**
  * As an admin, remove a user from the entire system
  * @param {string} token - the admin's token
  * @param {number} uId - user id of user being removed
  *
  * @returns {empty} - if user was successfully removed
*/

export function adminUserRemoveV1(token: string, uId: number): Empty {
  if (!checkToken(token)) {
    throw HTTPError(403, 'Invalid token');
  }

  const data = getData();
  const adminId = getUserIdFromToken(token);
  const adminPlace = adminPlaceGivenId(adminId);
  const admin = data.users[adminPlace];
  const userPlace = userPlaceGivenId(uId);
  const user = data.users[userPlace];

  for (let i = 0; i < data.users.length; i++) {
    if (data.users[i].uId === uId) {
      break;
    }
    if (i === data.users.length - 1) {
      throw HTTPError(400, 'User not found');
    }
  }

  if (admin.permissionId !== 1) {
    throw HTTPError(403, 'User is not an admin');
  }

  let count = 0;

  for (let i = 0; i < data.users.length; i++) {
    if (data.users[i].permissionId === 1) {
      count++;
    }
  }

  if (count === 1) {
    if (user.permissionId === 1) {
      throw HTTPError(400, 'Cannot remove last admin');
    }
  }

  user.email = '';
  user.nameFirst = 'Removed';
  user.nameLast = 'user';
  user.handleStr = '';
  user.profileImageUrl = '';

  setData(data);

  removeFromDms(uId);
  removeFromChannels(uId);
  return {};
}

/**
  * As an admin, change the permissions of a user
  *
  * @param {number} uId - user id of user being removed
  * @param {number} permissionId - new permission level of user
  *
  * @returns {empty} - if permissions were successfully updated
  *
*/

export function adminUserPermissionChangeV1(token: string, uId: number, permissionId: number): Empty {
  if (!checkToken(token)) {
    throw HTTPError(403, 'Invalid token');
  }

  if (permissionId !== 1 && permissionId !== 2) {
    throw HTTPError(400, 'Invalid permission level');
  }

  const data = getData();
  const admin = data.users[getUserIdFromToken(token)];
  const user = data.users[uId];

  for (let i = 0; i < data.users.length; i++) {
    if (data.users[i].uId === uId) {
      break;
    }
    if (i === data.users.length - 1) {
      throw HTTPError(400, 'User not found');
    }
  }

  if (admin.permissionId !== 1) {
    throw HTTPError(403, 'User is not an admin');
  }

  if (user.permissionId === permissionId) {
    throw HTTPError(400, 'User already has that permission level');
  }

  const permissionIds = data.users.map(o => o.permissionId);
  if (permissionIds.filter(x => x === 1).length === 1 && user.permissionId === 1 && permissionId === 2) {
    throw HTTPError(400, 'cannot demote only admin!');
  }

  user.permissionId = permissionId;
  setData(data);
  return {};
}
