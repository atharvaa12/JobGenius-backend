const { StreamChat } = require('stream-chat');
require('dotenv').config();

const key = process.env.STREAM_API_KEY;
const secret = process.env.STREAM_API_SECRET;

if (!key || !secret) {
  console.error('Stream info missing');
}

const streamClient = StreamChat.getInstance(key, secret);

const upsertStreamUser = async (userData) => {
  try {
    await streamClient.upsertUsers([userData]);
    return userData;
  } catch (error) {
    console.log('error in registering user to stream:', error);
  }
};

const generateStreamToken = (userId) => {
  try {
    const userIdStr = userId.toString();
    return streamClient.createToken(userIdStr);
  } catch (error) {
    console.error('Error generating Stream token:', error);
  }
};

module.exports = {
  upsertStreamUser,
  generateStreamToken,
};
