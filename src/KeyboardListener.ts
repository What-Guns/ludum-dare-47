const pressedKeys: {[key in string]: boolean} = {};

window.addEventListener('keydown', ev => {
  pressedKeys[ev.code] = true;
});

window.addEventListener('keyup', ev => {
  pressedKeys[ev.code] = false;
});

export function isKeyPressed(code: string) {
  return !!pressedKeys[code];
}
