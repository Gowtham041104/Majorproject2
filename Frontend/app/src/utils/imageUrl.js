export const resolveImageUrl = (relativeOrAbsolutePath) => {
  if (!relativeOrAbsolutePath) return relativeOrAbsolutePath;

  const pathAsString = String(relativeOrAbsolutePath);

  const isAbsolute =
    pathAsString.startsWith('http://') ||
    pathAsString.startsWith('https://') ||
    pathAsString.startsWith('data:');

  if (isAbsolute) return pathAsString;

  const apiBase = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

  if (pathAsString.startsWith('/')) return `${apiBase}${pathAsString}`;

  return `${apiBase}/${pathAsString}`;
};


