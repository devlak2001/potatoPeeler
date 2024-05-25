export const preloadImages = (images: Array<string>) => {
  images.forEach((src: string) => {
    const img = new Image();
    img.src = src;
  });
};
