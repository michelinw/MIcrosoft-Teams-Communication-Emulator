import express, { json, Request, Response } from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import errorHandler from 'middleware-http-errors';

import { authLoginV3, authRegisterV3, authLogoutV2, authPasswordResetRequest, authPasswordReset } from './auth';
import {
  channelDetailsV3,
  channelJoinV3,
  channelInviteV3,
  channelMessagesV3,
  channelLeaveV2,
  channelAddOwnerV2,
  channelRemoveOwnerV2,
} from './channel';
import { channelsCreateV3, channelsListV3, channelsListAllV3 } from './channels';
import { userProfileV1, userSetname, userSetemail, userSethandle, userAll, uploadPhotoV1, userStatsV1, usersStatsV1 } from './users';
import { clearV1, search } from './other';
import {
  messageSendV2, messageEditV2, messageSendDmV2, messageRemoveV2, messageShare,
  messageReactV1, messageUnreactV1, messagePinV1, messageUnpinV1, messageSendLater, messageSendLaterDm
} from './message';
import { dmCreateV2, dmListV2, dmDetailsV2, dmRemoveV2, dmMessagesV2, dmLeaveV2 } from './dm';
import { standupStartV1, standupActiveV1, standupSendV1 } from './standup';
import { notificationsGetV1 } from './notifications';
import { adminUserRemoveV1, adminUserPermissionChangeV1 } from './admin';

// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests.
app.use(json());
// Use middleware that allows for access from other domains.
app.use(cors());
// store images in a seperate folder
app.use('/imgurl', express.static('images'));

// Example get request
app.get('/echo', (req: Request, res: Response, next) => {
  const data = req.query.echo as string;
  return res.json(echo(data));
});

app.post('/auth/login/v3', (req: Request, res: Response, next) => {
  const { email, password } = req.body;
  res.json(authLoginV3(email, password));
});

app.post('/auth/register/v3', (req: Request, res: Response, next) => {
  const { email, password, nameFirst, nameLast } = req.body;
  res.json(authRegisterV3(email, password, nameFirst, nameLast));
});

app.post('/channels/create/v3', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const { name, isPublic } = req.body;
  res.json(channelsCreateV3(token, name, isPublic));
});

app.get('/channels/list/v3', (req: Request, res: Response, next) => {
  const token = req.header('token');
  res.json(channelsListV3(token));
});

app.get('/channels/listAll/v3', (req: Request, res: Response, next) => {
  const token = req.header('token');
  res.json(channelsListAllV3(token));
});

app.get('/channel/details/v3', (req: Request, res: Response, next) => {
  const token = req.header('token') as string;
  const channelId = Number(req.query.channelId as string);
  res.json(channelDetailsV3(token, channelId));
});

app.post('/channel/join/v3', (req: Request, res: Response, next) => {
  const token = req.header('token') as string;
  const { channelId } = req.body;
  res.json(channelJoinV3(token, channelId));
});

app.post('/channel/invite/v3', (req: Request, res: Response, next) => {
  const token = req.header('token') as string;
  const { channelId, uId } = req.body;
  res.json(channelInviteV3(token, channelId, uId));
});

app.get('/channel/messages/v3', (req: Request, res: Response, next) => {
  const token = req.header('token') as string;
  const channelId = Number(req.query.channelId as string);
  const start = Number(req.query.start as string);
  res.json(channelMessagesV3(token, channelId, start));
});

app.get('/user/profile/v3', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const uId = Number(req.query.uId as string);
  res.json(userProfileV1(token, uId));
});

app.delete('/clear/v1', (req: Request, res: Response, next) => {
  res.json(clearV1());
});

app.post('/auth/logout/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  res.json(authLogoutV2(token));
});

app.post('/channel/leave/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const channelId = req.body.channelId;
  res.json(channelLeaveV2(token, channelId));
});

app.post('/channel/addowner/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const channelId = req.body.channelId;
  const uId = req.body.uId;
  res.json(channelAddOwnerV2(token, channelId, uId));
});

app.post('/channel/removeowner/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const channelId = req.body.channelId;
  const uId = req.body.uId;
  res.json(channelRemoveOwnerV2(token, channelId, uId));
});

app.post('/message/send/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const channelId = req.body.channelId;
  const message = req.body.message as string;
  const share = req.body.share as boolean;
  const messageId = req.body.messageId;
  res.json(messageSendV2(token, channelId, message, share, messageId));
});

app.put('/message/edit/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const messageId = parseInt(req.body.messageId as string);
  const message = req.body.message as string;
  res.json(messageEditV2(token, messageId, message));
});

app.post('/message/senddm/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const dmId = req.body.dmId as number;
  const message = req.body.message as string;
  const share = req.body.share as boolean;
  const messageId = req.body.messageId;
  res.json(messageSendDmV2(token, dmId, message, share, messageId));
});

app.delete('/message/remove/v2', (req: Request, res: Response, next) => {
  const token = req.header('token') as string;
  const messageId = Number(req.query.messageId as string);
  res.json(messageRemoveV2(token, messageId));
});

app.put('/user/profile/setemail/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const email = req.body.email as string;
  res.json(userSetemail(token, email));
});

app.put('/user/profile/setname/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const nameFirst = req.body.nameFirst as string;
  const nameLast = req.body.nameLast as string;
  res.json(userSetname(token, nameFirst, nameLast));
});

app.put('/user/profile/sethandle/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const handleStr = req.body.handleStr as string;
  res.json(userSethandle(token, handleStr));
});

app.get('/users/all/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  res.json(userAll(token));
});

app.post('/dm/create/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const uIds = req.body.uIds as number[];
  res.json(dmCreateV2(token, uIds));
});

app.get('/dm/list/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  res.json(dmListV2(token));
});

app.delete('/dm/remove/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const dmId = Number(req.query.dmId as string);
  res.json(dmRemoveV2(token, dmId));
});

app.get('/dm/details/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const dmId = Number(req.query.dmId as string);
  res.json(dmDetailsV2(token, dmId));
});

app.get('/dm/messages/v2', (req: Request, res: Response, next) => {
  const token = req.header('token') as string;
  const dmId = Number(req.query.dmId as string);
  const start = Number(req.query.start as string);
  res.json(dmMessagesV2(token, dmId, start));
});

app.post('/dm/leave/v2', (req: Request, res: Response, next) => {
  const token = req.header('token') as string;
  const dmId = req.body.dmId;
  res.json(dmLeaveV2(token, dmId));
});

app.post('/standup/start/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const channelId = req.body.channelId;
  const length = req.body.length;
  res.json(standupStartV1(token, channelId, length));
});

app.get('/standup/active/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const channelId = Number(req.query.channelId);
  res.json(standupActiveV1(token, channelId));
});

app.post('/standup/send/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const channelId = req.body.channelId;
  const message = req.body.message as string;
  res.json(standupSendV1(token, channelId, message));
});

app.get('/notifications/get/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  res.json(notificationsGetV1(token));
});

app.post('/message/share/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const ogMessageId = req.body.ogMessageId;
  const message = req.body.message as string;
  const channelId = req.body.channelId;
  const dmId = req.body.dmId;
  res.json(messageShare(token, ogMessageId, message, channelId, dmId));
});

app.delete('/admin/user/remove/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const uId = Number(req.query.uId);
  res.json(adminUserRemoveV1(token, uId));
});

app.post('/admin/userpermission/change/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const uId = Number(req.body.uId);
  const permissionId = req.body.permissionId;
  res.json(adminUserPermissionChangeV1(token, uId, permissionId));
});

app.post('/auth/passwordreset/request/v1', (req: Request, res: Response, next) => {
  const email = req.body.email;
  res.json(authPasswordResetRequest(email));
});

app.post('/message/react/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const messageId = req.body.messageId;
  const reactId = req.body.reactId;
  res.json(messageReactV1(token, messageId, reactId));
});

app.post('/auth/passwordreset/reset/v1', (req: Request, res: Response, next) => {
  const resetCode = Number(req.body.resetCode);
  const newPassword = req.body.newPassword;
  res.json(authPasswordReset(resetCode, newPassword));
});

app.post('/message/unreact/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const messageId = req.body.messageId;
  const reactId = req.body.reactId;
  res.json(messageUnreactV1(token, messageId, reactId));
});

app.post('/user/profile/uploadphoto/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const imgUrl = req.body.imgUrl as string;
  const { xStart, yStart, xEnd, yEnd } = req.body;
  res.json(uploadPhotoV1(token, imgUrl, xStart, yStart, xEnd, yEnd));
});

app.post('/message/pin/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const messageId = req.body.messageId;
  res.json(messagePinV1(token, messageId));
});

app.post('/message/unpin/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const messageId = req.body.messageId;
  res.json(messageUnpinV1(token, messageId));
});

app.post('/message/sendlater/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const channelId = req.body.channelId;
  const message = req.body.message as string;
  const timeSent = req.body.timeSent;
  res.json(messageSendLater(token, channelId, message, timeSent));
});

app.post('/message/sendlaterdm/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const dmId = req.body.dmId;
  const message = req.body.message as string;
  const timeSent = req.body.timeSent;
  res.json(messageSendLaterDm(token, dmId, message, timeSent));
});

app.get('/search/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const queryStr = req.query.queryStr as string;
  res.json(search(token, queryStr));
});

app.get('/users/stats/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  res.json(usersStatsV1(token));
});

app.get('/user/stats/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  res.json(userStatsV1(token));
});

// handles errors nicely
app.use(errorHandler());

// for logging errors (print to terminal)
app.use(morgan('dev'));

// start server
const server = app.listen(parseInt(process.env.PORT || config.port), process.env.IP, () => {
  console.log(`⚡️ Server listening on port ${process.env.PORT || config.port}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});
