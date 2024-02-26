import { getData } from '../dataStore';

/**
  * Checks if the given dmId is valid
  *
  * @param {number} dmId - a dmId
  *
  * @returns {true} - if dmId is valid
  * @returns {false} - if dmId is invalid
*/

export function checkDmId(dmId: number): boolean {
  const data = getData();
  const dms = data.dms;
  const givenDmId = dmId;

  if (dms.find(({ dmId }) => givenDmId === dmId)) {
    return true;
  } else {
    return false;
  }
}

/**
  * Finds the place of the dms array in the dataStore given an dmId
  *
  * @param {number} dmId - dm Id of the dm
  *
  * @returns {number} - when the dmId has been found in the dataStore
  *
*/

export function getDmIdPlace(dmId: number) : number {
  const data = getData();
  const dms = data.dms;
  const givenDmId = dmId;
  const dmIds = [...dms.map(o => o.dmId)];
  return dmIds.indexOf(givenDmId);
}

/**
* Checks if the given userId is in a dm
  *
  * @param {number} userId - a userId
  *
  * @returns {true} - if userId is present
  * @returns {false} - if userId is not present
*/

export function checkUserInDm(userId: number, dmPlace: number): boolean {
  const data = getData();
  const dms = data.dms;
  if (dms[dmPlace].members.find(({ uId }) => userId === uId)) {
    return true;
  } else {
    return false;
  }
}

/**
  * Checks if a user is part of a dm
  *
  * @param {number} authUserId - User Id of the authorised user
  * @param {number} dmId - given dmId
  *
  * @returns {true} - if the user is part of the dm
  * @returns {false} - if the user is not a part of the dm
  *
*/

export function checkAuthorisedUserDm(authUserId: number, dmId: number): boolean {
  const data = getData();
  const dms = data.dms;
  const dmPlace = getDmIdPlace(dmId);
  if (dms[dmPlace].members.find(({ uId }) => authUserId === uId)) {
    return true;
  } else {
    return false;
  }
}

/**
  * Given a dmId and userId, checks if they are an owner of
  * the dm
  *
  * @param {number} authUserId - id of the authorised user
  * @param {number} dmId - id of a dm
  *
  * @returns {true} - if user is an owner
  * @returns {false} - if user is not an owner
*/

export function checkIfOwnerDm(authUserId: number, dmId: number): boolean {
  const data = getData();
  const dms = data.dms;
  const dmPlace = getDmIdPlace(dmId);
  if (dms[dmPlace].owner === authUserId) {
    return true;
  } else {
    return false;
  }
}
