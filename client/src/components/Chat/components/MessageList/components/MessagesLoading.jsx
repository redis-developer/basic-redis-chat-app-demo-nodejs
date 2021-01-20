// @ts-check
import React from "react";

const MessagesLoading = () => {
  return (
    <div className="no-messages flex-column d-flex flex-row justify-content-center align-items-center text-muted text-center">
      <div className="spinner-border" role="status">
        <span className="visually-hidden" />
      </div>
    </div>
  );
};

export default MessagesLoading;
