// @ts-check
import { useEffect, useRef, useState } from "react";
import { getMe, login, logOut } from "./api";
import io from "socket.io-client";
import { parseRoomName } from "./utils";

/**
 * @param {import('./state').UserEntry} newUser
 */
const updateUser = (newUser, dispatch, infoMessage) => {
  dispatch({ type: "set user", payload: newUser });
  if (infoMessage !== undefined) {
    dispatch({
      type: "append message",
      payload: {
        id: "0",
        message: {
          /** Date isn't shown in the info message, so we only need a unique value */
          date: Math.random() * 10000,
          from: "info",
          message: infoMessage,
        },
      },
    });
  }
};

/** @returns {[SocketIOClient.Socket, boolean]} */
const useSocket = (user, dispatch) => {
  const [connected, setConnected] = useState(false);
  /** @type {React.MutableRefObject<SocketIOClient.Socket>} */
  const socketRef = useRef(null);
  const socket = socketRef.current;

  /** First of all it's necessary to handle the socket io connection */
  useEffect(() => {
    if (user === null) {
      if (socket !== null) {
        socket.disconnect();
      }
      setConnected(false);
    } else {
      if (socket !== null) {
        socket.connect();
      } else {
        socketRef.current = io();
      }
      setConnected(true);
    }
  }, [user, socket]);

  /**
   * Once we are sure the socket io object is initialized
   * Add event listeners.
   */
  useEffect(() => {
    if (connected && user) {
      socket.on("user.connected", (newUser) => {
        updateUser(newUser, dispatch, `${newUser.username} connected`);
      });
      socket.on("user.disconnected", (newUser) =>
        updateUser(newUser, dispatch, `${newUser.username} left`)
      );
      socket.on("show.room", (room) => {
        console.log({ user });
        dispatch({
          type: "add room",
          payload: {
            id: room.id,
            name: parseRoomName(room.names, user.username),
          },
        });
      });
      socket.on("message", (message) => {
        /** Set user online */
        dispatch({
          type: "make user online",
          payload: message.from,
        });
        dispatch({
          type: "append message",
          payload: { id: message.roomId === undefined ? "0" : message.roomId, message },
        });
      });
    } else {
      /** If there was a log out, we need to clear existing listeners on an active socket connection */
      if (socket) {
        socket.off("user.connected");
        socket.off("user.disconnected");
        socket.off("user.room");
        socket.off("message");
      }
    }
  }, [connected, user, dispatch, socket]);

  return [socket, connected];
};

/** User management hook. */
const useUser = (onUserLoaded = (user) => { }, dispatch) => {
  const [loading, setLoading] = useState(true);
  /** @type {[import('./state.js').UserEntry | null, React.Dispatch<import('./state.js').UserEntry>]} */
  const [user, setUser] = useState(null);
  /** Callback used in log in form. */
  const onLogIn = (
    username = "",
    password = "",
    onError = (val = null) => { },
    onLoading = (loading = false) => { }
  ) => {
    onError(null);
    onLoading(true);
    login(username, password)
      .then((x) => {
        setUser(x);
      })
      .catch((e) => onError(e.message))
      .finally(() => onLoading(false));
  };

  /** Log out form */
  const onLogOut = async () => {
    logOut().then(() => {
      setUser(null);
      /** This will clear the store, to completely re-initialize an app on the next login. */
      dispatch({ type: "clear" });
      setLoading(true);
    });
  };

  /** Runs once when the component is mounted to check if there's user stored in cookies */
  useEffect(() => {
    if (!loading) {
      return;
    }
    getMe().then((user) => {
      setUser(user);
      setLoading(false);
      onUserLoaded(user);
    });
  }, [onUserLoaded, loading]);

  return { user, onLogIn, onLogOut, loading };
};

export {
  updateUser,
  useSocket,
  useUser
};