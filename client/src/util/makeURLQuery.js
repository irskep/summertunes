export default function makeURLQuery(items) {
  return (
    '?' +
    Object.keys(items)
      .filter((k) => items[k] !== null)
      .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(items[k])}`)
      .join('&')
  );
}