// @ts-check

/** Get default port argument. */
let DEFAULT_PORT = 4000;
try {
  const newPort = parseInt(process.argv[2]);
  DEFAULT_PORT = isNaN(newPort) ? DEFAULT_PORT : newPort;
} catch (e) {
}

const PORT = process.env.PORT || DEFAULT_PORT;

const ipAddress = require('ip').address();

const SERVER_ID = `${ipAddress}:${PORT}`;

module.exports = { PORT, SERVER_ID };
