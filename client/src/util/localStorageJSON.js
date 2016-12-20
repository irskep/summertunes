export default function localStorageJSON(key, defaultValue=null) {
  if (localStorage[key]) {
    try {
      return JSON.parse(localStorage[key]);
    } catch (e) {
      return defaultValue;
    }
  } else {
    return defaultValue;
  }
}