// @ts-check

import { getUsers } from "./api";

/**
 * @param {string[]} names
 * @param {string} username
 */
export const parseRoomName = (names, username) => {
  for (let name of names) {
    if (typeof name !== 'string') {
      name = name[0];
    }
    if (name !== username) {
      return name;
    }
  }
  return names[0];
};

/** Get an avatar for a room or a user */
export const getAvatarByUserAndRoomId = (roomId = "1") => {
  const TOTAL_IMAGES = 13;
  const seed1 = 654;
  const seed2 = 531;

  const uidParsed = +roomId.split(":").pop();
  let roomIdParsed = +roomId.split(":").reverse().pop();
  if (roomIdParsed < 0) {
    roomIdParsed += 3555;
  }

  const theId = (uidParsed * seed1 + roomIdParsed * seed2) % TOTAL_IMAGES;

  return `${process.env.PUBLIC_URL}/avatars/${theId}.jpg`;
};

const jdenticon = require("jdenticon");

const avatars = {};
export const getAvatar = (username) => {
  let av = avatars[username];
  if (av === undefined) {
    av =
      "data:image/svg+xml;base64," + window.btoa(jdenticon.toSvg(username, 50));
    avatars[username] = av;
  }
  return av;
};

export const populateUsersFromLoadedMessages = async (users, dispatch, messages) => {
  const userIds = {};
  messages.forEach((message) => {
    userIds[message.from] = 1;
  });

  const ids = Object.keys(userIds).filter(
    (id) => users[id] === undefined
  );

  if (ids.length !== 0) {
    /** We need to fetch users first */
    const newUsers = await getUsers(ids);
    dispatch({
      type: "append users",
      payload: newUsers,
    });
  }

};