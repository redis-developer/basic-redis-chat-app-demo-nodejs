const OnlineIndicator = ({ online, hide = false, width = 8, height = 8 }) => {
  return (
    <div
      className={
        online ? "rounded-circle bg-success" : "rounded-circle bg-gray"
      }
      style={{ width, height, opacity: hide ? 0 : 1 }}
    ></div>
  );
};

export default OnlineIndicator;
