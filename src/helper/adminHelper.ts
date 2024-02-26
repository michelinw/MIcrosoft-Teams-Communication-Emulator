import { getData, setData } from '../dataStore';

type adminPlace = number
type userPlace = number

/**
 * Finding place of admin in databse given the admin id
 *
 * @param {number} adminId
 *
 * @returns {adminPlace} - index of admin in database
 */

export function adminPlaceGivenId (adminId: number): adminPlace {
  const data = getData();
  let adminPlace = 0;

  for (let i = 0; i < data.users.length; i++) {
    if (data.users[i].uId === adminId) {
      adminPlace = i;
    }
  }

  return adminPlace;
}

/**
 * finding place of user in database given the user id for admin functions
 *
 * @param {number} userId
 *
 * @returns {userPlace} - index of user in database
 */

export function userPlaceGivenId (uId: number): userPlace {
  const data = getData();
  let userPlace = 0;

  for (let i = 0; i < data.users.length; i++) {
    if (data.users[i].uId === uId) {
      userPlace = i;
    }
  }

  return userPlace;
}

/**
 *
 * Removing user from channels within database
 *
 * @param {number} userId
 *
 * @returns {empty}
 */

export function removeFromChannels (uId: number): void {
  const data = getData();
  const channels = data.channels;

  for (let i = 0; i < channels.length; i++) {
    for (let j = 0; j < channels[i].allMembers.length; j++) {
      if (channels[i].allMembers[j].uId === uId) {
        channels[i].allMembers.splice(j, 1);
      }
    }
  }

  for (let i = 0; i < channels.length; i++) {
    for (let j = 0; j < channels[i].ownerMembers.length; j++) {
      if (channels[i].ownerMembers[j].uId === uId) {
        channels[i].ownerMembers.splice(j, 1);
      }
    }
  }

  for (let i = 0; i < channels.length; i++) {
    for (let j = 0; j < channels[i].messages.length; j++) {
      if (channels[i].messages[j].uId === uId) {
        channels[i].messages[j].message = 'Removed user';
      }
    }
  }
  setData(data);
}

/**
 * Remove user from dms within database
 *
 * @param {number} userId
 *
 * @returns {empty}
 */

export function removeFromDms (uId: number): void {
  const data = getData();
  const dms = data.dms;

  for (let i = 0; i < dms.length; i++) {
    for (let j = 0; j < dms[i].members.length; j++) {
      if (dms[i].members[j].uId === uId) {
        dms[i].members.splice(j, 1);
      }
    }
  }

  // find user in messages in dms
  for (let i = 0; i < dms.length; i++) {
    for (let j = 0; j < dms[i].messages.length; j++) {
      if (dms[i].messages[j].uId === uId) {
        dms[i].messages[j].message = 'Removed user';
      }
    }
  }
  setData(data);
}
