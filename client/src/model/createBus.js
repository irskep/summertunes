import K from "kefir";


export default function createBus(label) {
  let outerEmitter;
  const stream = K.stream((emitter) => {
    outerEmitter = emitter.emit;
    return () => {
    }
  });
  const push = (...args) => {
    if (!outerEmitter) return;
    return outerEmitter(...args);
  };

  return [push, stream];
}