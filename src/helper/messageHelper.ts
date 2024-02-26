import { getData, setData } from '../dataStore';
import { getChannelIdPlace } from './channelHelper';
import { getDmIdPlace } from './dmHelper';

type Empty = Record<string, never>;
type Reacts = {reactId: number, uIds: number[], isThisUserReacted: boolean};
type Message = {
  messageId: number,
  uId: number,
  message: string,
  reacts: Reacts[],
  timeSent: number,
  isPinned: boolean
};
type Info = {
  sender: number,
  Id: number,
  location: string,
  message: string
};

/**
  * Returns a unique messageId
  *
  * @returns {number} - returns a messageId
*/

export function returnMessageId(): number {
  const data = getData();
  const channels = data.channels;
  const dms = data.dms;
  let max = 0;

  for (let i = 0; i < channels.length; i++) {
    const messages = channels[i].messages;
    for (let j = 0; j < messages.length; j++) {
      if (max < messages[j].messageId) {
        max = messages[j].messageId;
      }
    }
  }

  for (let i = 0; i < dms.length; i++) {
    const messages = dms[i].messages;
    for (let j = 0; j < messages.length; j++) {
      if (max < messages[j].messageId) {
        max = messages[j].messageId;
      }
    }
  }
  const messageId = max + 1;
  return messageId;
}

/**
  * Returns details about a message
  *
  * @param {number} messageId - id of a message
  *
  * @returns {number, number, string, string} - if messageid is valid
*/

export function getMessageInfo(messageId: number): Info | Empty {
  const data = getData();
  const channels = data.channels;

  for (let i = 0; i < channels.length; i++) {
    const messages = channels[i].messages;
    for (let j = 0; j < messages.length; j++) {
      if (messageId === messages[j].messageId) {
        return { sender: messages[j].uId, Id: channels[i].channelId, location: 'channels', message: messages[j].message };
      }
    }
  }

  const dms = data.dms;

  for (let i = 0; i < dms.length; i++) {
    const messages = dms[i].messages;
    for (let j = 0; j < messages.length; j++) {
      if (messageId === messages[j].messageId) {
        return { sender: messages[j].uId, Id: dms[i].dmId, location: 'dms', message: messages[j].message };
      }
    }
  }

  return {};
}

/**
  * Edits a message
  *
  * @param {string} message - the edited message
  * @param {number} messageId - the id of a message
  * @param {string} location - whether the message is in channels or dms
*/

export function editMessage(message: string, messageId: number, location: string): void {
  const data = getData();

  if (location === 'channels') {
    const channels = data.channels;
    const channelPlace = getMessageFromId(messageId).channelPlace;
    const messagePlace = getMessageFromId(messageId).messagePlace;
    if (message === '') {
      channels[channelPlace].messages.splice(messagePlace, 1);
    } else {
      channels[channelPlace].messages[messagePlace].message = message;
    }
  }

  if (location === 'dms') {
    const dms = data.dms;
    const dmPlace = getMessageFromId(messageId).dmPlace;
    const messagePlace = getMessageFromId(messageId).messagePlace;
    if (message === '') {
      dms[dmPlace].messages.splice(messagePlace, 1);
    } else {
      dms[dmPlace].messages[messagePlace].message = message;
    }
  }
  setData(data);
}

/**
  * Deletes a message in a channel
  *
  * @param {number} channelId - a channelId
  * @param {number} messageId - id of a message
*/

export function removeMessage(channelId: number, messageId: number): void {
  const data = getData();
  const channels = data.channels;
  const channelPlace = getChannelIdPlace(channelId);
  const messageIds = [...channels[channelPlace].messages.map(o => o.messageId)];
  const messagePlace = messageIds.indexOf(messageId);
  channels[channelPlace].messages.splice(messagePlace, 1);
  setData(data);
}

/**
  * Deletes a message in a dm
  *
  * @param {number} channelId - a channelId
  * @param {number} messageId - id of a message
*/

export function removeMessageDm(dmId: number, messageId: number): void {
  const data = getData();
  const dms = data.dms;
  const dmPlace = getMessageFromId(messageId).dmPlace;
  const messagePlace = getMessageFromId(messageId).messagePlace;
  dms[dmPlace].messages.splice(messagePlace, 1);
  setData(data);
}

/**
  * Returns a message given a messageId
  *
  * @param {number} messageId - id of a message
*/

export function getMessageFromId(messageId: number) {
  const data = getData();
  const messageInfo = getMessageInfo(messageId);
  let message;
  if (messageInfo.location === 'channels') {
    const channels = data.channels;
    const channelPlace = getChannelIdPlace(messageInfo.Id);
    const messageIds = [channels[channelPlace].messages.map(o => o.messageId)];
    const messagePlace = messageIds[0].indexOf(messageId);
    message = channels[channelPlace].messages[messagePlace];
    return { channelPlace: channelPlace, messagePlace: messagePlace };
  } else if (messageInfo.location === 'dms') {
    const dms = data.dms;
    const dmPlace = getDmIdPlace(messageInfo.Id);
    const messageIds = [dms[dmPlace].messages.map(o => o.messageId)];
    const messagePlace = messageIds[0].indexOf(messageId);
    message = dms[dmPlace].messages[messagePlace];
    return { dmPlace: dmPlace, messagePlace: messagePlace, sender: message.uId };
  }
}

/**
  * Returns whether or not a user has reacted
  *
  * @param {number} uId - id of a user
  * @param {number} messageId - id of a message
  *
  * @returns {boolean} - if the user has reacted or not
*/
export function hasReacted(uId: number, message: Message): boolean {
  if (message.reacts.length === 0) {
    return false;
  }
  const uIds = [...message.reacts[0].uIds];
  if ((uIds.find(element => element === uId)) === uId) {
    return true;
  } else {
    return false;
  }
}

/**
  * Returns a array of messages that contain the queryStr in the chanel/dm
  *
  * @param {number} channelPlace - where it is located in channels
  * @param {number} dmPlace - where it is located in the dms
  * @param {string} queryStr - string to search
  *
  * @returns {Message[]}
*/
export function findMessage(channelPlace: number, dmPlace: number, queryStr: string): Message[] {
  const data = getData();
  let messagelist;
  if (channelPlace === -1) {
    messagelist = data.dms[dmPlace].messages;
  } else {
    messagelist = data.channels[channelPlace].messages;
  }

  const list = [];
  for (let i = 0; i < messagelist.length; i++) {
    if (messagelist[i].message.includes(queryStr)) {
      list.push(messagelist[i]);
    }
  }
  return list;
}
