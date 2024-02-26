import { getData, setData } from '../dataStore';
import crypto from 'crypto';

type sessions = {
  uId: number,
  token: string
}
/**
  * Hashes a token
  *
  * @param {string} token - token of the authorised user
  *
  * @returns {string} - returns encrypted token
*/

export function getHashOf(token: string): string {
  // const secret: crypto.Hash = 'GroupEggs';
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  return hash;
}

/**
  * Checks if the given token is valid.
  *
  * @param {string} token - token of the authorised user
  *
  * @returns {true} - if token is valid
  * @returns {false} - if token is invalid
*/

export function checkToken(token: string): boolean {
  const data = getData();
  const sessions = data.sessions;
  const givenToken = token;

  if (sessions.find(({ token }) => givenToken === getHashOf(token))) {
    return true;
  } else {
    return false;
  }
}

/**
  * Returns a unique token
  *
  * @param {number} authUserId - Id of the authorised user
  *
  * @returns {string} - returns Token assuming that authUserId is valid
*/

export function returnToken(authUserId: number): string {
  const data = getData();
  const sessions = data.sessions;
  const token = String(Math.max(sessions.map((o: sessions) => Number(o.token)).length) + 1);
  const userSession = {
    uId: authUserId,
    token: token
  };

  sessions.push(userSession);
  setData(data);
  return getHashOf(token);
}
