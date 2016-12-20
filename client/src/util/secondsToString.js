function pad(num, size) {
    let s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
}

const MINUTE = 60;
const HOUR = MINUTE * 60;

export default function secondsToString(seconds) {
    seconds = Math.round(seconds);

    const hours = Math.floor(seconds / HOUR);
    seconds -= hours * HOUR;

    const minutes = Math.floor(seconds / MINUTE);
    seconds -= minutes * MINUTE;

    if (hours) {
        return `${pad(hours)}:${pad(minutes, 2)}:${pad(seconds, 2)}`;
    } else {
        return `${pad(minutes, 2)}:${pad(seconds, 2)}`;
    }
}