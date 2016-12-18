/// pass {artist, album, id}
export default function queryString(obj2) {
  const obj = {
    albumartist: obj2.artist,
    album: obj2.album,
    id: obj2.id,
  };
  const components = [];
  for (const k of Object.keys(obj)) {
    if (obj[k] !== null && typeof(obj[k]) !== 'undefined') {
      components.push(`${k}=${encodeURIComponent(obj[k])}`);
    }
  }
  return components.join('&');
};