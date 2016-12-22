const {hostname, protocol} = window.location;

const SERVER_URL = `${protocol}//${hostname}:5000`;
const MPV_URL = `${protocol}//${hostname}:3001`;
export {
  SERVER_URL,
  MPV_URL,
};
