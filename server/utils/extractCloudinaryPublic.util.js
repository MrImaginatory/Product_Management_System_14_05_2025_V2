const extractCloudinaryPublicId = (url) => {
  const match = url.match(/\/([^/]+)\.\w+$/);
  return match ? `product_images/${match[1]}` : null;
};

export default extractCloudinaryPublicId;