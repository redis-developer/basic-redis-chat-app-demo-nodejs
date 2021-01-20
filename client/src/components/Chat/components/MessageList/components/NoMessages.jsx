// @ts-check
import React from "react";
import { CardText } from "react-bootstrap-icons";

const NoMessages = () => {
  return (
    <div className="no-messages flex-column d-flex flex-row justify-content-center align-items-center text-muted text-center">
      <CardText size={96} />
      <p>No messages</p>
    </div>
  );
};

export default NoMessages;
