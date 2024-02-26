import request from 'sync-request';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;

export function requestLogin(email: string, password: string) {
  const res = request(
    'POST',
    SERVER_URL + '/auth/login/v3',
    {
      json: {
        email,
        password
      }
    }
  );
  return { output: JSON.parse(res.body as string), statusCode: res.statusCode };
}

export function requestLogout(token: string) {
  const res = request(
    'POST',
    SERVER_URL + '/auth/logout/v2',
    {
      headers: {
        token
      },
      json: {
      }
    }
  );
  return { output: JSON.parse(res.body as string), statusCode: res.statusCode };
}

export function requestRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  const res = request(
    'POST',
    SERVER_URL + '/auth/register/v3',
    {
      json: {
        email,
        password,
        nameFirst,
        nameLast
      }
    }
  );
  return { output: JSON.parse(res.body as string), statusCode: res.statusCode };
}

export function requestAddOwner(token: string, channelId: number, uId: number) {
  const res = request(
    'POST',
    SERVER_URL + '/channel/addowner/v2',
    {
      headers: {
        token
      },
      json: {
        channelId,
        uId
      }
    }
  );
  return { output: JSON.parse(res.body as string), statusCode: res.statusCode };
}

export function requestDetails(token: string, channelId: number) {
  const res = request(
    'GET',
    SERVER_URL + '/channel/details/v3',
    {
      headers: {
        token
      },
      qs: {
        channelId
      }
    }
  );
  return { output: JSON.parse(res.body as string), statusCode: res.statusCode };
}

export function requestInvite(token: string, channelId: number, uId: number) {
  const res = request(
    'POST',
    SERVER_URL + '/channel/invite/v3',
    {
      headers: {
        token
      },
      json: {
        channelId,
        uId
      }
    }
  );
  return { output: JSON.parse(res.body as string), statusCode: res.statusCode };
}

export function requestJoin(token: string, channelId: number) {
  const res = request(
    'POST',
    SERVER_URL + '/channel/join/v3',
    {
      headers: {
        token
      },
      json: {
        channelId
      }
    }
  );
  return { output: JSON.parse(res.body as string), statusCode: res.statusCode };
}

export function requestLeave(token: string, channelId: number) {
  const res = request(
    'POST',
    SERVER_URL + '/channel/leave/v2',
    {
      headers: {
        token
      },
      json: {
        channelId
      }
    }
  );
  return { output: JSON.parse(res.body as string), statusCode: res.statusCode };
}

export function requestMessages(token: string, channelId: number, start: number) {
  const res = request(
    'GET',
    SERVER_URL + '/channel/messages/v3',
    {
      headers: {
        token
      },
      qs: {
        channelId,
        start
      }
    }
  );
  return { output: JSON.parse(res.body as string), statusCode: res.statusCode };
}

export function requestRemoveOwner(token: string, channelId: number, uId: number) {
  const res = request(
    'POST',
    SERVER_URL + '/channel/removeowner/v2',
    {
      headers: {
        token
      },
      json: {
        channelId,
        uId
      }
    }
  );
  return { output: JSON.parse(res.body as string), statusCode: res.statusCode };
}

export function requestCreate(token: string, name: string, isPublic: boolean) {
  const res = request(
    'POST',
    SERVER_URL + '/channels/create/v3',
    {
      headers: {
        token
      },
      json: {
        name,
        isPublic
      }
    }
  );
  return { output: JSON.parse(res.body as string), statusCode: res.statusCode };
}

export function requestListAll(token: string) {
  const res = request(
    'GET',
    SERVER_URL + '/channels/listAll/v3',
    {
      headers: {
        token
      },
      qs: {
      }
    }
  );
  return { output: JSON.parse(res.body as string), statusCode: res.statusCode };
}

export function requestList(token: string) {
  const res = request(
    'GET',
    SERVER_URL + '/channels/list/v3',
    {
      headers: {
        token
      },
      qs: {
      }
    }
  );
  return { output: JSON.parse(res.body as string), statusCode: res.statusCode };
}

export function requestClear() {
  const res = request(
    'DELETE',
    SERVER_URL + '/clear/v1',
    {
      qs: {
      }
    }
  );
  return { output: JSON.parse(res.body as string), statusCode: res.statusCode };
}

export function requestDmCreate(token: string, uIds: number[]) {
  const res = request(
    'POST',
    SERVER_URL + '/dm/create/v2',
    {
      headers: {
        token
      },
      json: {
        uIds
      }
    }
  );
  return { output: JSON.parse(res.body as string), statusCode: res.statusCode };
}

export function requestDmDetails(token: string, dmId: number) {
  const res = request(
    'GET',
    SERVER_URL + '/dm/details/v2',
    {
      headers: {
        token
      },
      qs: {
        dmId
      }
    }
  );
  return { output: JSON.parse(res.body as string), statusCode: res.statusCode };
}

export function requestDmList(token: string) {
  const res = request(
    'GET',
    SERVER_URL + '/dm/list/v2',
    {
      headers: {
        token
      },
      qs: {
      }
    }
  );
  return { output: JSON.parse(res.body as string), statusCode: res.statusCode };
}

export function requestDmRemove(token: string, dmId: number) {
  const res = request(
    'DELETE',
    SERVER_URL + '/dm/remove/v2',
    {
      headers: {
        token
      },
      qs: {
        dmId
      }
    }
  );
  return { output: JSON.parse(res.body as string), statusCode: res.statusCode };
}

export function requestEdit(token: string, messageId: number, message: string) {
  const res = request(
    'PUT',
    SERVER_URL + '/message/edit/v2',
    {
      headers: {
        token
      },
      json: {
        messageId,
        message
      }
    }
  );
  return { output: JSON.parse(res.body as string), statusCode: res.statusCode };
}

export function requestDmSend(token: string, dmId: number, message: string, share?: boolean, messageId?: number) {
  const res = request(
    'POST',
    SERVER_URL + '/message/senddm/v2',
    {
      headers: {
        token
      },
      json: {
        dmId,
        message,
        share,
        messageId
      }
    }
  );
  return { output: JSON.parse(res.body as string), statusCode: res.statusCode };
}

export function requestSend(token: string, channelId: number, message: string, share?: boolean, messageId?: number) {
  const res = request(
    'POST',
    SERVER_URL + '/message/send/v2',
    {
      headers: {
        token
      },
      json: {
        channelId,
        message,
        share,
        messageId
      }
    }
  );
  return { output: JSON.parse(res.body as string), statusCode: res.statusCode };
}

export function getUserAll(token: string) {
  const res = request(
    'GET',
    SERVER_URL + '/users/all/v2',
    {
      headers: {
        token
      },
      qs: {
      }
    }
  );
  return { output: JSON.parse(res.body as string), statusCode: res.statusCode };
}

export function requestProfile(token:string, uId: number) {
  const res = request(
    'GET',
    SERVER_URL + '/user/profile/v3',
    {
      headers: {
        token
      },
      qs: {
        uId
      }
    }
  );
  return { output: JSON.parse(res.body as string), statusCode: res.statusCode };
}

export function setEmail(token: string, email: string) {
  const res = request(
    'PUT',
    SERVER_URL + '/user/profile/setemail/v2',
    {
      headers: {
        token
      },
      json: {
        email
      }
    }
  );
  return { output: JSON.parse(res.body as string), statusCode: res.statusCode };
}

export function setHandle(token: string, handleStr: string) {
  const res = request(
    'PUT',
    SERVER_URL + '/user/profile/sethandle/v2',
    {
      headers: {
        token
      },
      json: {
        handleStr
      }
    }
  );
  return { output: JSON.parse(res.body as string), statusCode: res.statusCode };
}

export function setName(token: string, nameFirst: string, nameLast: string) {
  const res = request(
    'PUT',
    SERVER_URL + '/user/profile/setname/v2',
    {
      headers: {
        token
      },
      json: {
        nameFirst,
        nameLast
      }
    }
  );
  return { output: JSON.parse(res.body as string), statusCode: res.statusCode };
}

export function requestDmLeave(token: string, dmId: number) {
  const res = request(
    'POST',
    SERVER_URL + '/dm/leave/v2',
    {
      headers: {
        token
      },
      json: {
        dmId
      }
    }
  );
  return { output: JSON.parse(res.body as string), statusCode: res.statusCode };
}

export function requestRemoveMessage(token: string, messageId: number) {
  const res = request(
    'DELETE',
    SERVER_URL + '/message/remove/v2',
    {
      headers: {
        token
      },
      qs: {
        messageId
      }
    }
  );
  return { output: JSON.parse(res.body as string), statusCode: res.statusCode };
}

export function requestDmMessages(token: string, dmId: number, start: number) {
  const res = request(
    'GET',
    SERVER_URL + '/dm/messages/v2',
    {
      headers: {
        token
      },
      qs: {
        dmId,
        start
      }
    }
  );
  return { output: JSON.parse(res.body as string), statusCode: res.statusCode };
}

export function requestStandupStart(token: string, channelId: number, length: number) {
  const res = request(
    'POST',
    SERVER_URL + '/standup/start/v1',
    {
      headers: {
        token
      },
      json: {
        channelId,
        length
      }
    }
  );
  return { output: JSON.parse(res.body as string), statusCode: res.statusCode };
}

export function requestStandupActive(token: string, channelId: number) {
  const res = request(
    'GET',
    SERVER_URL + '/standup/active/v1',
    {
      headers: {
        token
      },
      qs: {
        channelId
      }
    }
  );
  return { output: JSON.parse(res.body as string), statusCode: res.statusCode };
}

export function requestStandupSend(token: string, channelId: number, message: string) {
  const res = request(
    'POST',
    SERVER_URL + '/standup/send/v1',
    {
      headers: {
        token
      },
      json: {
        channelId,
        message
      }
    }
  );
  return { output: JSON.parse(res.body as string), statusCode: res.statusCode };
}

export function requestNotifications(token: string) {
  const res = request(
    'GET',
    SERVER_URL + '/notifications/get/v1',
    {
      headers: {
        token
      },
      qs: {
      }
    }
  );
  return { output: JSON.parse(res.body as string), statusCode: res.statusCode };
}

export function requestShare(token: string, ogMessageId: number, message: string, channelId: number, dmId: number) {
  const res = request(
    'POST',
    SERVER_URL + '/message/share/v1',
    {
      headers: {
        token
      },
      json: {
        ogMessageId,
        message,
        channelId,
        dmId
      }
    }
  );
  return { output: JSON.parse(res.body as string), statusCode: res.statusCode };
}

export function userRemove(token: string, uId: number) {
  const res = request(
    'DELETE',
    SERVER_URL + '/admin/user/remove/v1',
    {
      headers: {
        token
      },
      qs: {
        uId
      }
    }
  );
  return { output: JSON.parse(res.body as string), statusCode: res.statusCode };
}

export function userPermissionChange(token: string, uId: number, permissionId: number) {
  const res = request(
    'POST',
    SERVER_URL + '/admin/userpermission/change/v1',
    {
      headers: {
        token
      },
      json: {
        uId,
        permissionId
      }
    }
  );
  return { output: JSON.parse(res.body as string), statusCode: res.statusCode };
}

export function requestPasswordResetRequest(email: string) {
  const res = request(
    'POST',
    SERVER_URL + '/auth/passwordreset/request/v1',
    {
      json: {
        email
      }
    }
  );
  return { output: JSON.parse(res.body as string), statusCode: res.statusCode };
}

export function requestReact(token: string, messageId: number, reactId: number) {
  const res = request(
    'POST',
    SERVER_URL + '/message/react/v1',
    {
      headers: {
        token
      },
      json: {
        messageId,
        reactId
      }
    }
  );
  return { output: JSON.parse(res.body as string), statusCode: res.statusCode };
}

export function requestPasswordReset(resetCode: number, newPassword: string) {
  const res = request(
    'POST',
    SERVER_URL + '/auth/passwordreset/reset/v1',
    {
      json: {
        resetCode,
        newPassword
      }
    }
  );
  return { output: JSON.parse(res.body as string), statusCode: res.statusCode };
}

export function requestUnreact(token: string, messageId: number, reactId: number) {
  const res = request(
    'POST',
    SERVER_URL + '/message/unreact/v1',
    {
      headers: {
        token
      },
      json: {
        messageId,
        reactId
      }
    }
  );
  return { output: JSON.parse(res.body as string), statusCode: res.statusCode };
}

export function requestUploadPicture(token: string, imgUrl: string, xStart: number, yStart: number, xEnd: number, yEnd: number) {
  const res = request(
    'POST',
    SERVER_URL + '/user/profile/uploadphoto/v1',
    {
      headers: {
        token
      },
      json: {
        imgUrl,
        xStart,
        yStart,
        xEnd,
        yEnd
      }
    }
  );
  return { output: JSON.parse(res.body as string), statusCode: res.statusCode };
}

export function requestPin(token: string, messageId: number) {
  const res = request(
    'POST',
    SERVER_URL + '/message/pin/v1',
    {
      headers: {
        token
      },
      json: {
        messageId
      }
    }
  );
  return { output: JSON.parse(res.body as string), statusCode: res.statusCode };
}

export function requestUnpin(token: string, messageId: number) {
  const res = request(
    'POST',
    SERVER_URL + '/message/unpin/v1',
    {
      headers: {
        token
      },
      json: {
        messageId
      }
    }
  );
  return { output: JSON.parse(res.body as string), statusCode: res.statusCode };
}

export function requestSendLater(token: string, channelId: number, message: string, timeSent: number) {
  const res = request(
    'POST',
    SERVER_URL + '/message/sendlater/v1',
    {
      headers: {
        token
      },
      json: {
        channelId,
        message,
        timeSent
      }
    }
  );
  return { output: JSON.parse(res.body as string), statusCode: res.statusCode };
}

export function requestSendLaterDm(token: string, dmId: number, message: string, timeSent: number) {
  const res = request(
    'POST',
    SERVER_URL + '/message/sendlaterdm/v1',
    {
      headers: {
        token
      },
      json: {
        dmId,
        message,
        timeSent
      }
    }
  );
  return { output: JSON.parse(res.body as string), statusCode: res.statusCode };
}

export function requestSearch(token: string, queryStr: string) {
  const res = request(
    'GET',
    SERVER_URL + '/search/v1',
    {
      headers: {
        token
      },
      qs: {
        queryStr
      }
    }
  );
  return { output: JSON.parse(res.body as string), statusCode: res.statusCode };
}

export function requestUserStats(token: string) {
  const res = request(
    'GET',
    SERVER_URL + '/user/stats/v1',
    {
      headers: {
        token
      },
      qs: {
      }
    }
  );
  return { output: JSON.parse(res.body as string), statusCode: res.statusCode };
}

export function requestUsersStats(token: string) {
  const res = request(
    'GET',
    SERVER_URL + '/users/stats/v1',
    {
      headers: {
        token
      },
      qs: {
      }
    }
  );
  return { output: JSON.parse(res.body as string), statusCode: res.statusCode };
}
