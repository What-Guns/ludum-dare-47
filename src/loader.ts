const images = new Map<string, Promise<HTMLImageElement>>();

export async function loadImage(src: string) {
  if(images.has(src)) return images.get(src)!;

  const req = new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.src = src;
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
  });

  images.set(src, req);

  showLoading(req, `Loading ${src}`);

  return req;
}

export async function loadJson(path: string) {
  const response = await showLoading(fetch(path), path);
  if(!response.ok) throw new Error(`Failed to load ${path}: ${response.statusText}`);
  return await response.json();
}

export async function loadAudioAsync(url: string, audioContext: AudioContext) {
  const response = await showLoading(fetch(url), url);
  if(response.status < 200 || response.status > 400) {
    const msg = `Error parsing ${url}`
    throw new Error(msg);
  }
  return await showLoading(parseAudio(audioContext, await response.arrayBuffer()), 'parsing');
}

function parseAudio(ctx: AudioContext, buffer: ArrayBuffer) {
  return new Promise<AudioBuffer>((resolve, reject) => {
    ctx.decodeAudioData(buffer, resolve, reject);
  });
}

function showLoading<T>(p: Promise<T>, txt: string): Promise<T> {
  const row = document.createElement('div');
  row.textContent = txt;
  document.getElementById('loadingbox')!.appendChild(row);
  p.then(() => row.remove());
  return p;
}
