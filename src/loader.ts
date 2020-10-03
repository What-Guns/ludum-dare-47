export async function loadImage(src: string) {
  const image = new Image();
  image.src = src;
  await new Promise((resolve, reject) => {
    image.addEventListener('load', resolve);
    image.addEventListener('error', reject);
  });
  return image;
}

export async function loadJson(path: string) {
  const response = await fetch(path);
  if(!response.ok) throw new Error(`Failed to load ${path}: ${response.statusText}`);
  return await response.json();
}
