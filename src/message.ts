import { getData, setData } from './dataStore';
import { checkToken } from './helper/tokenHelper';
import { getUserIdFromToken, getUserIdPlace } from './helper/userHelper';
import {
  checkChannelId,
  checkAuthorisedUser,
  getChannelIdPlace,
  checkIfOwner,
} from './helper/channelHelper';
import {
  checkDmId,
  getDmIdPlace,
  checkUserInDm,
  checkAuthorisedUserDm,
  checkIfOwnerDm,
} from './helper/dmHelper';
import {
  removeMessage,
  returnMessageId,
  getMessageInfo,
  editMessage,
  removeMessageDm,
  getMessageFromId,
  hasReacted
} from './helper/messageHelper';
import HTTPError from 'http-errors';
import { checkTag, createNotification } from './helper/notificationsHelper';

type MessageId = { messageId: number };
type Empty = Record<string, never>;
type ShareMessage = { sharedMessageId: number };
type Reacts = {
  reactId: number,
  uIds: number[],
  isThisUserReacted: boolean
};

type Message = {
  messageId: number,
  uId: number,
  message: string,
  reacts: Reacts[],
  timeSent: number,
  isPinned: boolean
};

/**
  * Send message from an authorised user to the channel given by channelId.
  *
  * @param {string} token - token of the authorised user
  * @param {number} channelId - id of channel that message is being sent in.
  * @param {string} message - message being sent.
  *
  * @returns {{dmId: number}} - if no error
  * @returns {{error: string}} - if token is invalid, if any of the uIds are invalid,
  * if any of the uIds are duplicates.
*/

export function messageSendV2(token: string, channelId: number, message: string, ignore?: boolean, messageId?: number): MessageId {
  if ((message.length < 1 || message.length > 1000) && ignore !== true) {
    throw HTTPError(400, 'invalid message');
  }

  if (!checkToken(token)) {
    throw HTTPError(403, 'invalid token');
  }

  if (!checkChannelId(channelId)) {
    throw HTTPError(400, 'invalid channel');
  }

  const authUserId = getUserIdFromToken(token);

  if (!checkAuthorisedUser(authUserId, channelId)) {
    throw HTTPError(403, 'unauthorised Id');
  }

  const data = getData();
  const channels = data.channels;
  const channelPlace = getChannelIdPlace(channelId);
  const channelMessages = channels[channelPlace].messages;
  if (messageId === undefined) {
    messageId = returnMessageId();
  }
  const newMessage: Message = {
    messageId: messageId,
    uId: authUserId,
    message: message,
    reacts: [],
    timeSent: Math.floor(Date.now() / 1000),
    isPinned: false
  };

  channelMessages.unshift(newMessage);
  setData(data);

  if (ignore === undefined) {
    const tag = checkTag(message, channelId, 'channel');
    for (let i = 0; i < tag.length; i++) {
      createNotification(channelId, -1, 'channelTag', token, tag[i], message);
    }
  }
  return { messageId: messageId };
}

/**
  * Given a message, update its text.
  * If new text is an empty string, the original message is deleted.
  *
  * @param {string} token - token of the authorised user
  * @param {number} messageId - id of message being edited
  * @param {string} message - new message.
  *
  * @returns {{}} - if no error
  * @returns {{error: string}} - if token is invalid, messageId is invalid, message length invalid, or user
  * unauthorised to edit message.
*/

export function messageEditV2(token: string, messageId: number, message: string): Empty {
  if (!checkToken(token)) {
    throw HTTPError(403, 'invalid token');
  }

  if (message.length > 1000) {
    throw HTTPError(400, 'invalid message');
  }

  const authUserId = getUserIdFromToken(token);
  const messageInfo = getMessageInfo(messageId);

  if (JSON.stringify(messageInfo) === JSON.stringify({})) {
    throw HTTPError(400, 'invalid message');
  }

  const data = getData();
  const users = data.users;
  const userPlace = getUserIdPlace(authUserId);
  const permissions = users[userPlace].permissionId;

  if (messageInfo.location === 'channels' && !checkAuthorisedUser(authUserId, messageInfo.Id)) {
    throw HTTPError(403, 'unauthorised Id');
  } else if (messageInfo.location === 'dms' && !checkAuthorisedUserDm(authUserId, messageInfo.Id)) {
    throw HTTPError(403, 'unauthorised Id');
  }

  let ifOwner = false;

  if (messageInfo.location === 'channels') {
    ifOwner = checkIfOwner(authUserId, messageInfo.Id);
  } else if (messageInfo.location === 'dms') {
    ifOwner = checkIfOwnerDm(authUserId, messageInfo.Id);
  }

  if (messageInfo.location === 'channels') {
    if (!(authUserId === messageInfo.sender || ifOwner || permissions === 1)) {
      throw HTTPError(403, 'unauthorised Id');
    }
  } else if (messageInfo.location === 'dms') {
    if (!(authUserId === messageInfo.sender || ifOwner)) {
      throw HTTPError(403, 'unauthorised Id');
    }
  }
  editMessage(message, messageId, messageInfo.location);

  if (messageInfo.location === 'channels') {
    const tag = checkTag(message, messageInfo.Id, 'channel');
    for (let i = 0; i < tag.length; i++) {
      createNotification(messageInfo.Id, -1, 'channelTag', token, tag[i], message);
    }
  } else if (messageInfo.location === 'dms') {
    const tag = checkTag(message, messageInfo.Id, 'dm');
    for (let i = 0; i < tag.length; i++) {
      createNotification(-1, messageInfo.Id, 'dmTag', token, tag[i], message);
    }
  }

  return {};
}

/**
  * Send message from am authorised user to the DM given by dmId.
  *
  * @param {string} token - token of the authorised user
  * @param {number} dmId - id of dm being edited
  * @param {string} message - new message.
  *
  * @returns {{}} - if no error
  * @returns {{error: string}} - if token is invalid, dmId is invalid, message length invalid, or user
  * unauthorised to send dm (not in dm)
*/

export function messageSendDmV2(token: string, dmId: number, message: string, ignore?: boolean, messageId?: number): MessageId {
  if ((message.length < 1 || message.length > 1000) && ignore === undefined) {
    throw HTTPError(400, 'invalid message');
  }
  if (!checkDmId(dmId)) {
    throw HTTPError(400, 'invalid dmId');
  }
  if (!checkToken(token)) {
    throw HTTPError(403, 'invalid token');
  }

  const data = getData();
  const dms = data.dms;
  const dmPlace = getDmIdPlace(dmId);
  const dmMessages = dms[dmPlace].messages;
  const authUserId = getUserIdFromToken(token);

  if (!checkUserInDm(authUserId, dmPlace)) {
    throw HTTPError(403, 'unauthorised user');
  }

  if (messageId === undefined) {
    messageId = returnMessageId();
  }

  const newMessage: Message = {
    messageId: messageId,
    uId: authUserId,
    message: message,
    reacts: [],
    timeSent: Math.floor(Date.now() / 1000),
    isPinned: false
  };

  dmMessages.unshift(newMessage);
  setData(data);

  if (ignore === undefined) {
    const tag = checkTag(message, dmId, 'dm');
    for (let i = 0; i < tag.length; i++) {
      createNotification(-1, dmId, 'dmTag', token, tag[i], message);
    }
  }

  return { messageId: messageId };
}

/**
  * Given a messageId for a message, removes a message from the channel/DM
  *
  * @param {string} token - token of the authorised user
  * @param {number} messageId - id of message being removed
  *
  * @returns {{}} - if no error
  * @returns {{error: string}} - if token is invalid, messageId is invalid, or user
  * unauthorised to remove message.
*/

export function messageRemoveV2(token: string, messageId: number): Empty {
  if (!checkToken(token)) {
    throw HTTPError(403, 'invalid token');
  }

  const authUserId = getUserIdFromToken(token);
  const messageInfo = getMessageInfo(messageId);

  if (JSON.stringify(messageInfo) === JSON.stringify({})) {
    throw HTTPError(400, 'invalid message');
  }

  const data = getData();
  const users = data.users;
  const userPlace = getUserIdPlace(authUserId);
  const permissions = users[userPlace].permissionId;

  if (messageInfo.location === 'channels' && !checkAuthorisedUser(authUserId, messageInfo.Id)) {
    throw HTTPError(403, 'unauthorised Id');
  } else if (messageInfo.location === 'dms' && !checkAuthorisedUserDm(authUserId, messageInfo.Id)) {
    throw HTTPError(403, 'unauthorised Id');
  }

  let ifOwner = false;

  if (messageInfo.location === 'channels') {
    ifOwner = checkIfOwner(authUserId, messageInfo.Id);
  } else if (messageInfo.location === 'dms') {
    ifOwner = checkIfOwnerDm(authUserId, messageInfo.Id);
  }

  if (messageInfo.location === 'channels') {
    if (authUserId === messageInfo.sender || ifOwner || permissions === 1) {
      removeMessage(messageInfo.Id, messageId);
    } else {
      throw HTTPError(403, 'unauthorised Id');
    }
  } else if (messageInfo.location === 'dms') {
    if (authUserId === messageInfo.sender || ifOwner) {
      removeMessageDm(messageInfo.Id, messageId);
    } else {
      throw HTTPError(403, 'unauthorised Id');
    }
  }

  return {};
}

/**
  * Given a messageId, share the message to another channel/Dm
  *
  * @param {string} token - token of the authorised user
  * @param {number} ogMessageId - id of the original message
  * @param {string} message - optional message added on
  * @param {number} channelId - id of the channel to share, -1 if to dm
  * @param {number} dmId - id of the dm to share, -1 if to channel
  *
  * @returns {{sharedMessageId: number}} - if no error
*/

export function messageShare(token: string, ogMessageId: number, message: string, channelId: number, dmId: number): ShareMessage {
  if (!checkToken(token)) {
    throw HTTPError(403, 'invalid token');
  }

  const user = getUserIdFromToken(token);

  if (message.length > 1000) {
    throw HTTPError(400, 'invalid message');
  }

  if (channelId !== -1 && dmId !== -1) {
    throw HTTPError(400, 'invalid Id');
  }

  if (checkChannelId(channelId)) {
    if (!checkAuthorisedUser(user, channelId)) {
      throw HTTPError(403, 'unauthorised Id');
    }
  } else if (checkDmId(dmId)) {
    if (!checkAuthorisedUserDm(user, dmId)) {
      throw HTTPError(403, 'unauthorised Id');
    }
  } else {
    throw HTTPError(400, 'invalid Id');
  }

  const Info = getMessageInfo(ogMessageId);

  if (Info.message === undefined) {
    throw HTTPError(400, 'invalid ogMessageId');
  } else if (Info.location === 'channels') {
    if (!checkAuthorisedUser(user, Info.Id)) {
      throw HTTPError(400, 'invalid ogMessageId');
    }
  } else {
    if (!checkAuthorisedUserDm(user, Info.Id)) {
      throw HTTPError(400, 'invalid ogMessageId');
    }
  }

  const newMessage = Info.message + '\n^^^^Shared^^^^\n' + message;

  if (dmId === -1) {
    const tag = checkTag(message, channelId, 'channel');
    for (let i = 0; i < tag.length; i++) {
      createNotification(channelId, -1, 'channelTag', token, tag[i], newMessage);
    }
  } else {
    const tag = checkTag(message, dmId, 'dm');
    for (let i = 0; i < tag.length; i++) {
      createNotification(-1, dmId, 'dmTag', token, tag[i], newMessage);
    }
  }

  let Id;

  if (dmId === -1) {
    // share to channel

    Id = messageSendV2(token, channelId, newMessage, true);
  } else {
    // share to dm

    Id = messageSendDmV2(token, dmId, newMessage, true);
  }

  return { sharedMessageId: Id.messageId };
}

/**
  * Allows a user to react to a message
  *
  * @param {string} token - token of the authorised user
  * @param {number} messageId - id of a message
  * @param {number} reactId - which react emoji they want
  *
  * @returns {} - if no error
*/

export function messageReactV1(token: string, messageId: number, reactId: number): Empty {
  if (!checkToken(token)) {
    throw HTTPError(403, 'invalid token!');
  }
  const messageInfo = getMessageInfo(messageId);
  if (JSON.stringify(messageInfo) === JSON.stringify({})) {
    throw HTTPError(400, 'invalid message!');
  }
  if (reactId !== 1) {
    throw HTTPError(400, 'invalid reactId!');
  }

  const data = getData();
  const authUserId = getUserIdFromToken(token);
  let message: Message;

  if (messageInfo.location === 'channels') {
    if (!checkAuthorisedUser(authUserId, messageInfo.Id)) {
      throw HTTPError(400, 'you are not part of this channel!');
    } else {
      const channelPlace = getMessageFromId(messageId).channelPlace;
      const messagePlace = getMessageFromId(messageId).messagePlace;
      message = data.channels[channelPlace].messages[messagePlace];
    }
  }

  if (messageInfo.location === 'dms') {
    if (!checkAuthorisedUserDm(authUserId, messageInfo.Id)) {
      throw HTTPError(400, 'you are not part of this dm!');
    } else {
      const dmPlace = getMessageFromId(messageId).dmPlace;
      const messagePlace = getMessageFromId(messageId).messagePlace;
      message = data.dms[dmPlace].messages[messagePlace];
    }
  }

  if (hasReacted(authUserId, message)) {
    throw HTTPError(400, 'you have already reacted!');
  } else {
    if (message.reacts.length === 0) {
      const newReact = {
        reactId: reactId,
        uIds: [authUserId],
        isThisUserReacted: false
      };
      message.reacts.push(newReact);
    } else {
      message.reacts[0].uIds.push(authUserId);
    }
  }
  setData(data);

  if (messageInfo.location === 'channels') {
    createNotification(messageInfo.Id, -1, 'channelReact', token, messageInfo.sender);
  } else if (messageInfo.location === 'dms') {
    createNotification(-1, messageInfo.Id, 'dmReact', token, messageInfo.sender);
  }
  return {};
}

/**
  * Allows a user to unreact to a message
  *
  * @param {string} token - token of the authorised user
  * @param {number} messageId - id of a message
  * @param {number} reactId - which react emoji they want
  *
  * @returns {} - if no error
*/

export function messageUnreactV1(token: string, messageId: number, reactId: number): Empty {
  if (!checkToken(token)) {
    throw HTTPError(403, 'invalid token!');
  }
  const messageInfo = getMessageInfo(messageId);
  if (JSON.stringify(messageInfo) === JSON.stringify({})) {
    throw HTTPError(400, 'invalid message!');
  }
  if (reactId !== 1) {
    throw HTTPError(400, 'invalid reactId!');
  }

  const data = getData();
  const authUserId = getUserIdFromToken(token);
  let message: Message;

  if (messageInfo.location === 'channels') {
    if (!checkAuthorisedUser(authUserId, messageInfo.Id)) {
      throw HTTPError(400, 'you are not part of this channel!');
    } else {
      const channelPlace = getMessageFromId(messageId).channelPlace;
      const messagePlace = getMessageFromId(messageId).messagePlace;
      message = data.channels[channelPlace].messages[messagePlace];
    }
  }
  if (messageInfo.location === 'dms') {
    if (!checkAuthorisedUserDm(authUserId, messageInfo.Id)) {
      throw HTTPError(400, 'you are not part of this dm!');
    }
    const dmPlace = getMessageFromId(messageId).dmPlace;
    const messagePlace = getMessageFromId(messageId).messagePlace;
    message = data.dms[dmPlace].messages[messagePlace];
  }

  if (!hasReacted(authUserId, message)) {
    throw HTTPError(400, 'you have not reacted!');
  }
  const reactPlace = message.reacts[0].uIds.indexOf(authUserId);
  message.reacts[0].uIds.splice(reactPlace, 1);
  setData(data);
  return {};
}

/**
 * Allows a user to pin a message
 * @param {string} token - token of the authorised user
 * @param {number} messageId - id of a message
 *
 * @returns {} - if no error
**/

export function messagePinV1(token: string, messageId: number): Empty {
  if (!checkToken(token)) {
    throw HTTPError(403, 'invalid token!');
  }
  const messageInfo = getMessageInfo(messageId);
  if (JSON.stringify(messageInfo) === JSON.stringify({})) {
    throw HTTPError(400, 'invalid message!');
  }

  const data = getData();
  const authUserId = getUserIdFromToken(token);
  let message: Message;

  if (messageInfo.location === 'channels') {
    if (!checkAuthorisedUser(authUserId, messageInfo.Id)) {
      throw HTTPError(400, 'you are not part of this channel!');
    }
    if (!checkIfOwner(authUserId, messageInfo.Id)) {
      throw HTTPError(403, 'you do not have permission to pin');
    }
    const channels = data.channels;
    const place = getChannelIdPlace(messageInfo.Id);
    const messageIds = [channels[place].messages.map((o: Message) => o.messageId)];
    const index = messageIds[0].indexOf(messageId);
    message = channels[place].messages[index];
  }
  if (messageInfo.location === 'dms') {
    if (!checkAuthorisedUserDm(authUserId, messageInfo.Id)) {
      throw HTTPError(400, 'you are not part of this dm!');
    }
    if (!checkIfOwnerDm(authUserId, messageInfo.Id)) {
      throw HTTPError(403, 'you do not have permission to pin');
    }
    const dms = data.dms;
    const place = getDmIdPlace(messageInfo.Id);
    const messageIds = [dms[place].messages.map((o: Message) => o.messageId)];
    const index = messageIds[0].indexOf(messageId);
    message = dms[place].messages[index];
  }
  if (message.isPinned) {
    throw HTTPError(400, 'message is already pinned');
  }
  message.isPinned = true;
  setData(data);
  return {};
}

/**
 * Allows a user to unpin a message
 * @param {string} token - token of the authorised user
 * @param {number} messageId - id of a message
 *
 * @returns {} - if no error
**/

export function messageUnpinV1(token: string, messageId: number): Empty {
  if (!checkToken(token)) {
    throw HTTPError(403, 'invalid token!');
  }
  const messageInfo = getMessageInfo(messageId);
  if (JSON.stringify(messageInfo) === JSON.stringify({})) {
    throw HTTPError(400, 'invalid message!');
  }

  const data = getData();
  const authUserId = getUserIdFromToken(token);
  let message: Message;

  if (messageInfo.location === 'channels') {
    if (!checkAuthorisedUser(authUserId, messageInfo.Id)) {
      throw HTTPError(400, 'you are not part of this channel!');
    }
    if (!checkIfOwner(authUserId, messageInfo.Id)) {
      throw HTTPError(403, 'you do not have permission to unpin');
    }
    const channels = data.channels;
    const place = getChannelIdPlace(messageInfo.Id);
    const messageIds = [channels[place].messages.map((o: Message) => o.messageId)];
    const index = messageIds[0].indexOf(messageId);
    message = channels[place].messages[index];
  }
  if (messageInfo.location === 'dms') {
    if (!checkAuthorisedUserDm(authUserId, messageInfo.Id)) {
      throw HTTPError(400, 'you are not part of this dm!');
    }
    if (!checkIfOwnerDm(authUserId, messageInfo.Id)) {
      throw HTTPError(403, 'you do not have permission to unpin');
    }
    const dms = data.dms;
    const place = getDmIdPlace(messageInfo.Id);
    const messageIds = [dms[place].messages.map((o: Message) => o.messageId)];
    const index = messageIds[0].indexOf(messageId);
    message = dms[place].messages[index];
  }
  if (!message.isPinned) {
    throw HTTPError(400, 'message is not pinned');
  }
  message.isPinned = false;
  setData(data);
  return {};
}

/**
  * Send message from an authorised user to the channel given by channelId at a later time.
  *
  * @param {string} token - token of the authorised user
  * @param {number} channelId - id of channel that message is being sent in.
  * @param {string} message - message being sent.
  * @param {number} timeSent - time which the message is to be sent
  *
  * @returns {{messageId: number}} -
*/
export function messageSendLater (token: string, channelId: number, message: string, timeSent: number): MessageId {
  if (!checkToken(token)) {
    throw HTTPError(403, 'invalid token');
  }

  if (!checkChannelId(channelId)) {
    throw HTTPError(400, 'invalid Id');
  }
  const user = getUserIdFromToken(token);

  if (!checkAuthorisedUser(user, channelId)) {
    throw HTTPError(403, 'unauthorised Id');
  }

  if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'invalid message');
  }

  const timeDiff = timeSent - Math.floor((new Date()).getTime() / 1000);
  if (timeDiff <= 0) {
    throw HTTPError(400, 'invalid time');
  }

  const newId = returnMessageId();
  setTimeout((token, channelId, message, newId) => {
    messageSendV2(token, channelId, message, false, newId);
  }, timeDiff * 1000, token, channelId, message, newId);

  return { messageId: newId };
}

/**
  * Send message from an authorised user to the dm given by dmId at a later time.
  *
  * @param {string} token - token of the authorised user
  * @param {number} dmId - id of dm that message is being sent in.
  * @param {string} message - message being sent.
  * @param {number} timeSent - time which the message is to be sent
  *
  * @returns {{messageId: number}} -
*/
export function messageSendLaterDm (token: string, dmId: number, message: string, timeSent: number): MessageId {
  if (!checkToken(token)) {
    throw HTTPError(403, 'invalid token');
  }

  if (!checkDmId(dmId)) {
    throw HTTPError(400, 'invalid Id');
  }
  const user = getUserIdFromToken(token);

  if (!checkAuthorisedUserDm(user, dmId)) {
    throw HTTPError(403, 'unauthorised Id');
  }

  if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'invalid message');
  }

  const timeDiff = timeSent - Math.floor((new Date()).getTime() / 1000);
  if (timeDiff <= 0) {
    throw HTTPError(400, 'invalid time');
  }

  const newId = returnMessageId();
  setTimeout((token, dmId, message, newId, user) => {
    if (checkDmId(dmId)) {
      messageSendDmV2(token, dmId, message, false, newId);
    }
  }, timeDiff * 1000, token, dmId, message, newId, user);

  return { messageId: newId };
}
