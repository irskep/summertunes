export default function makeURLQuery(items) {
  return (
    '?' +
    Object.keys(items)
      .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(items[k])}`)
      .join('&')
  );
}