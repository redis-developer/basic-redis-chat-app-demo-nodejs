// @ts-check
const bcrypt = require('bcrypt');
const { incr, set, hmset, sadd, hmget, exists,
  client: redisClient,
} = require('./redis');

/** Redis key for the username (for getting the user id) */
const makeUsernameKey = (username) => {
  const usernameKey = `username:${username}`;
  return usernameKey;
};

/**
 * Creates a user and adds default chat rooms
 * @param {string} username 
 * @param {string} password 
 */
const createUser = async (username, password) => {
  const usernameKey = makeUsernameKey(username);
  /** Create user */
  const hashedPassword = await bcrypt.hash(password, 10);
  const nextId = await incr("total_users");
  const userKey = `user:${nextId}`;
  await set(usernameKey, userKey);
  await hmset(userKey, ["username", username, "password", hashedPassword]);

  /**
   * Each user has a set of rooms he is in
   * let's define the default ones
   */
  await sadd(`user:${nextId}:rooms`, `${0}`); // Main room

  /** This one should go to the session */
  return { id: nextId, username };
};

const getPrivateRoomId = (user1, user2) => {
  if (isNaN(user1) || isNaN(user2) || user1 === user2) {
    return null;
  }
  const minUserId = user1 > user2 ? user2 : user1;
  const maxUserId = user1 > user2 ? user1 : user2;
  return `${minUserId}:${maxUserId}`;
};

/**
 * Create a private room and add users to it
 * @returns {Promise<[{
 *  id: string;
 *  names: any[];
 * }, boolean]>}
 */
const createPrivateRoom = async (user1, user2) => {
  const roomId = getPrivateRoomId(user1, user2);

  if (roomId === null) {
    return [null, true];
  }

  /** Add rooms to those users */
  await sadd(`user:${user1}:rooms`, `${roomId}`);
  await sadd(`user:${user2}:rooms`, `${roomId}`);

  return [{
    id: roomId,
    names: [
      await hmget(`user:${user1}`, "username"),
      await hmget(`user:${user2}`, "username"),
    ],
  }, false];
};


const getMessages = async (roomId = "0", offset = 0, size = 50) => {
  /**
   * Logic:
   * 1. Check if room with id exists
   * 2. Fetch messages from last hour
   **/
  const roomKey = `room:${roomId}`;
  const roomExists = await exists(roomKey);
  if (!roomExists) {
    return [];
  } else {
    return new Promise((resolve, reject) => {
      redisClient.zrevrange(roomKey, offset, offset + size, (err, values) => {
        if (err) {
          reject(err);
        }
        resolve(values.map((val) => JSON.parse(val)));
      });
    });
  }
};

const sanitise = (text) => {
  let sanitisedText = text;

  if (text.indexOf('<') > -1 || text.indexOf('>') > -1) {
    sanitisedText = text.replace(/</g, '&lt').replace(/>/g, '&gt');
  }

  return sanitisedText;
};

module.exports = {
  getMessages,
  sanitise,
  createUser,
  makeUsernameKey,
  createPrivateRoom,
  getPrivateRoomId
};