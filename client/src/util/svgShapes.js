import React from 'react';

function play(post, flip, size=22, color="#666") {
  const twoPi = Math.PI  * 2;
  const angles = [0, twoPi / 3, twoPi / 3 * 2];
  const numbers = [];
  const radius = size * 0.3;
  const xOffset = -2;

  const transform = flip ? "scale(-1, 1)" : "";

  for (const angle of angles) {
    numbers.push(
      Math.cos(angle) * radius + xOffset,
      Math.sin(angle) * radius);
  }
  const [x1, y1, x2, y2, x3, y3] = numbers;  // eslint-disable-line no-unused-vars
  return (
    <svg width={size} height={size} version="1.1" xmlns="http://www.w3.org/2000/svg">
      <g transform={`translate(${size/2}, ${size/2}) ${transform}`}>
        <polygon points={numbers.join(' ')} fill={color} strokeWidth="0"/>
        {post && <line x1={x1 + 1} y1={y2} x2={x1 + 1} y2={y3} strokeWidth="1" stroke={color} />}
      </g>
    </svg>
  );
}

function pause(size=22, color="#666") {
  const w = size * 0.2;
  const h = size * 0.5;

  return (
    <svg width={size} height={size} version="1.1" xmlns="http://www.w3.org/2000/svg">
      <g transform={`translate(${size/2}, ${size/2})`}>
        <rect x={-w - 2} y={-h / 2} width={w} height={h} fill={color} strokeWidth="0"/>
        <rect x={2} y={-h / 2} width={w} height={h} fill={color} strokeWidth="0"/>
      </g>
    </svg>
  );
}

function uiConfigIconLarge(size=30, color="#666") {
  return (
    <svg width={size} height={size} version="1.1" xmlns="http://www.w3.org/2000/svg">
        <rect x={0} y={0} width={size} height={size} fill="none" stroke={color} strokeWidth="1"/>
        <line x1={size / 4} y1={0} x2={size / 4} y2={size} strokeWidth="1" stroke={color} />
        <line x1={size / 2} y1={0} x2={size / 2} y2={size} strokeWidth="1" stroke={color} />
    </svg>
  )
}

function uiConfigIconMedium(size=30, color="#666") {
  return (
    <svg width={size} height={size} version="1.1" xmlns="http://www.w3.org/2000/svg">
        <rect x={0} y={0} width={size} height={size} fill="none" stroke={color} strokeWidth="1"/>
        <line x1={size / 2} y1={0} x2={size / 2} y2={size / 2} strokeWidth="1" stroke={color} />
        <line x1={0} y1={size / 2} x2={size} y2={size / 2} strokeWidth="1" stroke={color} />
    </svg>
  )
}

export {
  play,
  pause,
  uiConfigIconLarge,
  uiConfigIconMedium,
}
