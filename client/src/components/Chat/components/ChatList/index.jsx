// @ts-check
import React, { useMemo } from "react";
import ChatListItem from "./components/ChatListItem";
import Footer from "./components/Footer";

const ChatList = ({ rooms, dispatch, user, currentRoom, onLogOut }) => {
  const processedRooms = useMemo(() => {
    const roomsList = Object.values(rooms);
    const main = roomsList.filter((x) => x.id === "0");
    let other = roomsList.filter((x) => x.id !== "0");
    other = other.sort(
      (a, b) => +a.id.split(":").pop() - +b.id.split(":").pop()
    );
    return [...(main ? main : []), ...other];
  }, [rooms]);
  return (
    <>
      <div className="chat-list-container flex-column d-flex pr-4">
        <div className="py-2">
          <p className="h5 mb-0 py-1 chats-title">Chats</p>
        </div>
        <div className="messages-box flex flex-1">
          <div className="list-group rounded-0">
            {processedRooms.map((room) => (
              <ChatListItem
                key={room.id}
                onClick={() =>
                  dispatch({ type: "set current room", payload: room.id })
                }
                active={currentRoom === room.id}
                room={room}
              />
            ))}
          </div>
        </div>
        <Footer user={user} onLogOut={onLogOut} />
      </div>
    </>
  );
};

export default ChatList;
