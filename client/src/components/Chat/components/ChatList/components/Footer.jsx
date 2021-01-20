// @ts-check

import React from "react";
import { Power } from "react-bootstrap-icons";
import OnlineIndicator from "../../OnlineIndicator";
import AvatarImage from "./AvatarImage";

const Footer = ({ user, onLogOut }) => (
  <div
    className="row no-gutters align-items-center pl-4 pr-2 pb-3"
    style={{ height: "inherit", flex: 0, minHeight: 50 }}
  >
    {true ? (
      <>
        <UserInfo user={user} col={8} />
        <LogoutButton onLogOut={onLogOut} col={4} />
      </>
    ) : (
      <>
        <LogoutButton noinfo onLogOut={onLogOut} col={8} />
        <UserInfo noinfo user={user} col={4} />
      </>
    )}
  </div>
);

const LogoutButton = ({ onLogOut, col = 5, noinfo = false }) => (
  <div
    onClick={onLogOut}
    style={{ cursor: "pointer" }}
    className={`col-${col} text-danger ${!noinfo ? "text-right" : ""}`}
  >
    <Power /> Log out
  </div>
);

const UserInfo = ({ user, col = 7, noinfo = false }) => (
  <div
    className={`col-${col} d-flex align-items-center ${
      noinfo ? "justify-content-end" : ""
    }`}
  >
    <div className={`align-self-center ${noinfo ? "" : "mr-3"}`}>
      <AvatarImage name={user.username} id={user.id} />
    </div>
    {!noinfo && (
      <div className="media-body">
        <h5 className="font-size-14 mt-0 mb-1">{user.username}</h5>
        <div className="d-flex align-items-center">
          <OnlineIndicator online={true} />
          <p className="ml-2 text-muted mb-0">Active</p>
        </div>
      </div>
    )}
  </div>
);

export default Footer;
