import { getData, setData } from './dataStore';
import { checkToken, returnToken, getHashOf } from './helper/tokenHelper';
import validator from 'validator';
import HTTPError from 'http-errors';
import { checkEmail, returnCode, checkCode, logoutSessions } from './helper/authHelper';
import { getUserIdPlace } from './helper/userHelper';
import config from './config.json';
import request from 'sync-request';
import fs from 'fs';

/**
  * <Given a registered account's details, returns their user ID>
  *
  * @param {string} email - the email of a user
  * @param {string} password - the password of a user
  *
  * @returns {{authUserId: number}} - if details are correct and user is registered
  * @returns {{error: string}} - if email is not registered, or password is incorrect
*/

type UserId = {token: string, authUserId: number}
type Error = {error: string}

export function authLoginV3(email: string, password: string): UserId | Error {
  const data = getData();
  const users = data.users;

  const emails = [users.map(o => o.email)];
  if (emails[0].find(element => element === email) === email) {
    const place = emails[0].indexOf(email);
    if (getHashOf(password) === users[place].password) {
      const authUserId = users[place].uId;
      const token = returnToken(authUserId);
      return {
        token: token,
        authUserId: authUserId
      };
    } else {
      throw HTTPError(400, 'incorrect password!');
    }
  } else {
    throw HTTPError(400, 'not a registered email!');
  }
}

/**
  * <Create a new user based on input, return their user ID>
  *
  * @param {string} email - email of the user
  * @param {string} password - password of the user
  * @param {string} nameFirst - first name of the user
  * @param {string} nameLast - last name of the user
  * ...
  *
  * @returns {{authUserId: number}} - if email is valid and names are not too long
  * @returns {{error: string}} - if email is invalid, or name is too long
*/

export function authRegisterV3(email: string, password: string, nameFirst: string, nameLast: string): UserId | Error {
  const data = getData();
  const users = data.users;

  if (password.length < 6) {
    throw HTTPError(400, 'password is too short!');
  }

  if (users.filter(user => user.email === email).length > 0) {
    throw HTTPError(400, 'email is already in use!');
  }

  if (nameFirst.length > 50 || nameFirst.length < 1 || nameLast.length > 50 || nameLast.length < 1) {
    throw HTTPError(400, 'invalid name length!');
  }

  if (validator.isEmail(email) === false) {
    throw HTTPError(400, 'invalid email!');
  }

  let handleStr = nameFirst.toLowerCase() + nameLast.toLowerCase();

  handleStr = handleStr.replace(/[^a-z0-9]/gi, '');

  if (handleStr.length > 20) {
    handleStr = handleStr.slice(0, 20);
  }

  let tempStr = handleStr;

  for (let i = 0; i <= 20; i++) {
    if (users.filter(user => user.handleStr === tempStr).length > 0) {
      tempStr = handleStr + i;
    }
  }

  handleStr = tempStr;

  let permission = 2;

  if (users.length === 0) {
    permission = 1;
  }

  if (!fs.existsSync('images')) {
    fs.mkdirSync('images');
  }
  const res = request(
    'GET',
    'http://w0.peakpx.com/wallpaper/167/11/HD-wallpaper-lazy-egg6-egg-gudetama-kawaii-lazy-egg.jpg'
  );
  const body = res.getBody();
  fs.writeFileSync('images/default.jpg', body, { flag: 'w' });

  const HOST = parseInt(process.env.PORT || config.port);
  const PORT = process.env.IP || 'localhost';
  const imgName = 'http://' + HOST + ':' + PORT + '/imgurl/default.jpg';

  const newUser = {
    uId: users.length,
    nameFirst: nameFirst,
    nameLast: nameLast,
    email: email,
    handleStr: handleStr,
    password: getHashOf(password),
    permissionId: permission,
    timeJoined: Math.floor(Date.now() / 1000),
    profileImageUrl: imgName
  };

  users.push(newUser);
  setData(data);
  const token = returnToken(newUser.uId);
  return {
    token: token,
    authUserId: newUser.uId
  };
}

type Empty = Record<string, never>

/**
  * <Logs out a user and invalidates their token>
  *
  * @param {string} token - token of the user
  *
  * @returns {{}} - if token is valid
  * @returns {{error: string}} - if token is invalid
*/

export function authLogoutV2(token: string): Empty {
  if (!checkToken(token)) {
    throw HTTPError(403, 'invalid token!');
  }
  const data = getData();
  const sessions = data.sessions;
  let tokenPlace = 0;

  const tokens = [sessions.map(o => getHashOf(o.token))];
  if (tokens[0].find(element => element === token) === token) {
    tokenPlace = tokens[0].indexOf(token);
  }
  sessions.splice(tokenPlace, 1);
  setData(data);
  return {};
}

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'groupeggsh15a@gmail.com',
    pass: 'nccovivmzhzkxyum'
  }
});

/**
 * Requests to reset a user's password
 *
 * @param {string} email
 *
 * @returns {} - Sends a reset code to the user's email
 */

export function authPasswordResetRequest(email: string): Empty {
  let uId = 0;
  if ((uId = checkEmail(email)) === -1) {
    return {};
  }

  const resetCode = returnCode(uId);

  const mailOptions = {
    from: 'groupeggsH15A@gmail.com',
    to: email,
    subject: 'Password Reset Code',
    text: String(resetCode)
  };

  transporter.sendMail(mailOptions);

  logoutSessions(uId);

  return {};
}

/**
 * Given a resetCode, resets a user's password
 *
 * @param {number} resetCode - from the user's email
 * @param {string} newPassword - replaces previous password
 *
 * @returns {} - changes password in database
 */
export function authPasswordReset(resetCode: number, newPassword: string): Empty {
  let index = 0;
  if ((index = checkCode(resetCode)) === -1) {
    throw HTTPError(400, 'invalid reset code!');
  }

  if (newPassword.length < 6) {
    throw HTTPError(400, 'invalid password!');
  }

  const data = getData();
  const resetCodes = data.resetCodes;
  const uId = resetCodes[index].uId;
  resetCodes.splice(index);

  const userPlace = getUserIdPlace(uId);
  data.users[userPlace].password = getHashOf(newPassword);

  setData(data);

  return {};
}
