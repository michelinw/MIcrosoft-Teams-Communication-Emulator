Mark the first 6 please :) Thank you

- Assume that channelsList and channelsListAllV1 will return object { error: expect.any(String) } when given an invalid authUserId
- Assume that you do not need to call authLoginV1 to use the other functions (using the authUserId from authRegister is valid)
- Assume that emails are case insensitive, so authRegister will return an error if the same email is used but in capital/mixed letters
- Assume that channelDetails does not have to list out the users in order that they join the channel in
- Assume that channelsListAll does not have to print out the channels in the order they were created in
- Assume that ownerMembers is always a subset of allMembers
- Assume that a channel must have at least one member to be a valid channel
- The initial state of the database is empty
- Assume that there is no global owner after the initial global owner is removed