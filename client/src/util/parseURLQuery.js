export default function parseURLQuery(query) {
  const result = {};
  for (const segment of query.split('&')) {
    const equalIndex = segment.indexOf("=");
    if (equalIndex > -1) {
      const key = segment.slice(0, equalIndex);
      const value = segment.slice(equalIndex + 1);
      result[decodeURIComponent(key)] = decodeURIComponent(value);
    }
  }
  return result;
}