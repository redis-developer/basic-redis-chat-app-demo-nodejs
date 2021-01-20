// @ts-check
const InfoMessage = ({ message }) => {
  return (
    <p
      className="mb-2 fs-6 fw-light fst-italic text-black-50 text-center"
      style={{ opacity: 0.8, fontSize: 14 }}
    >
      {message}
    </p>
  );
};

export default InfoMessage;
