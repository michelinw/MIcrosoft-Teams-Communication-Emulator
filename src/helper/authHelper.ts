import { getData, setData } from '../dataStore';

/**
 * Checks if an email is registered
 *
 * @param {string} email
 *
 * @returns {number} returns userPlace if email is registered,
 * otherwise returns -1
 */

export function checkEmail(email: string) {
  const data = getData();
  const users = data.users;
  const emails = [users.map(o => o.email)];
  if (emails[0].find(element => element === email) === email) {
    const place = emails[0].indexOf(email);
    return users[place].uId;
  }
  return -1;
}

/**
 * Returns unique reset code
 *
 * @param {number} uId
 *
 * @returns {number} returns new Reset Code
 */

export function returnCode(uId: number) {
  const data = getData();
  const resetCodes = data.resetCodes;

  let unique = false;
  let newResetCode = 0;

  while (unique === false) {
    newResetCode = Math.floor(100000 + Math.random() * 900000);
    if (resetCodes.find((element) => element.resetCode === newResetCode) === undefined) {
      unique = true;
    }
  }

  const object = {
    uId: uId,
    resetCode: newResetCode
  };

  resetCodes.push(object);
  setData(data);

  return newResetCode;
}

/**
 * Checks if reset code is in database
 *
 * @param {number} resetCode
 *
 * @returns {number} returns new Reset Code,
 * otherwise returns -1
 */

export function checkCode(resetCode: number) {
  const data = getData();
  const resetCodes = data.resetCodes;
  for (let i = 0; i < resetCodes.length; i++) {
    if (resetCode === resetCodes[i].resetCode) {
      return i;
    }
  }

  return -1;
}

export function logoutSessions(uId: number) {
  const data = getData();
  const sessions = data.sessions;

  for (let i = 0; i < sessions.length; i++) {
    if (sessions[i].uId === uId) {
      sessions.splice(i);
    }
  }

  setData(data);
}
