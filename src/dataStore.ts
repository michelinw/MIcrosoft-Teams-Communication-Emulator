import fs from 'fs';
type Users = {
  uId: number,
  nameFirst: string,
  nameLast: string,
  email: string,
  handleStr: string,
  password: string,
  permissionId: number,
  profileImageUrl: string,
  timeJoined: number
}
type JoinTime = {userId: number, timeStamp: number}
type Member = {
  uId: number,
  email: string,
  nameFirst: string,
  nameLast: string,
  handleStr: string,
  profileImageUrl: string
};
type Reacts = {reactId: number, uIds: any[], isThisUserReacted: boolean};
type Message = {
  messageId: number,
  uId: number,
  message: string,
  reacts: Reacts[],
  timeSent: number,
  isPinned: boolean
};
type Channels = {
  channelId: number,
  name: string,
  isPublic: boolean,
  ownerMembers: Member[],
  allMembers: Member[],
  messages: Message[],
  joinTime: JoinTime[]
}
type Dms = {
  dmId: number,
  name: string,
  members: Member[],
  messages: Message[],
  owner: number,
  createTime: number,
};
type Standups = {
  channelId: number,
  uId: number,
  timeStart: number,
  timeFinish: number,
  message: string
};

type Notifications = {
  channelId: number,
  dmId: number,
  notificationMessage: string,
  recipient: number
};

type ResetCodes = {
  resetCode: number,
  uId: number,
};

type Sessions = {
  uId: number,
  token: string
};
type datas = {
  users: Users[],
  channels: Channels[],
  sessions: Sessions[],
  dms: Dms[],
  standups: Standups[],
  notifs: Notifications[],
  resetCodes: ResetCodes[],
  deletedUsers: Users[],
};
// YOU SHOULD MODIFY THIS OBJECT BELOW
let data: datas = {
  users: [],
  channels: [],
  sessions: [],
  dms: [],
  standups: [],
  notifs: [],
  resetCodes: [],
  deletedUsers: []
};

// YOU SHOULDNT NEED TO MODIFY THE FUNCTIONS BELOW IN ITERATION 1

/*
Example usage
    let store = getData()
    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

    names = store.names

    names.pop()
    names.push('Jake')

    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
    setData(store)
*/

// Use get() to access the data
function getData(): datas {
  if (fs.existsSync('./database.json') === false) {
    setData(data);
  }

  const dbstr = fs.readFileSync('./database.json');
  data = JSON.parse(String(dbstr));
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
function setData(newData: datas): void {
  data = newData;
  const jsonstr = JSON.stringify(data);
  fs.writeFileSync('./database.json', jsonstr);
}

export { getData, setData };
