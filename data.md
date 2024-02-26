```javascript
let data = {
  users: [
    {uId: 1, nameFirst: 'User', nameLast: '1', email: 'user1@gmail.com', handleStr: 'user1', password: 'password' permissionId: 1, profileImageUrl: 'http://randomimage.com'},
  ],
  channels: [
    {channelId: 1, name: 'channel1', isPublic: true, ownerMembers: [], allMembers: [], 
    messages: [messageId: 1, uId: 1, message: 'hello world', reacts: [{reactId:1, uId: 1}, timeSent: 1582426788], isPinned: false], joinTime: [{userId: 1, timestamp: 3213213123}]},
  ],
  dms: [
    {dmId: 1, members: [uId: 1, email: 'user1@gmail.com', nameFirst: 'user', nameLast: '1', handleStr: 'user1'], messages: [messageId: 1, uId: 1, message: 'hello world', reacts: [{reactId:1, uId: 1}, timeSent: 1582426788], owner: 1, name: 'dm', createTime: 3213213123},
  ],
  standups: [
    {channelId: channelId, uId: authUserId, timeStart: timeStart, timeFinish: timeFinish, message: message}
  ],
  notifications: [
    {channelId: 1, dmId: 1, notificationMessage: "someonebody messaged", recipient: 1};
  ],
  resetCodes: [
    {resetCode: 12345, uId: 1},
  ],
}:
```

[Optional] short description: 