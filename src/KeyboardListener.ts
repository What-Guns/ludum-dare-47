const pressedKeys: {[key in string]: boolean} = {};

(window as Window).addEventListener('keydown', ev => {
  pressedKeys[ev.code] = true;
});

(window as Window).addEventListener('keyup', ev => {
  pressedKeys[ev.code] = false;
});

export function isKeyPressed(code: string) {
  return !!pressedKeys[code];
}