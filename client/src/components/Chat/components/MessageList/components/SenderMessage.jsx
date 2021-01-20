// @ts-check
import moment from "moment";
import React from "react";
import ClockIcon from "./ClockIcon";
import OnlineIndicator from "../../OnlineIndicator";

const SenderMessage = ({
  user,
  message = "Lorem ipsum dolor...",
  date,
  onUserClicked,
}) => (
  <div className="d-flex">
    <div style={{ width: "50%" }} className="text-left mb-4">
      <div
        className="conversation-list d-inline-block px-3 py-2"
        style={{ borderRadius: 12, backgroundColor: "rgba(85, 110, 230, 0.1)" }}
      >
        <div className="ctext-wrap">
          {user && (
            <div className="conversation-name text-primary d-flex align-items-center mb-1">
              <div
                className="mr-2"
                style={{
                  fontWeight: 600,
                  cursor: "pointer",
                }}
                onClick={onUserClicked}
              >
                {user.username}
              </div>
              <OnlineIndicator width={7} height={7} online={user.online} />
            </div>
          )}
          <p className="text-left">{message}</p>
          <p className="chat-time mb-0">
            <ClockIcon /> {moment.unix(date).format("LT")}{" "}
          </p>
        </div>
      </div>
    </div>
    <div style={{ flex: 1 }} />
  </div>
);

export default SenderMessage;
