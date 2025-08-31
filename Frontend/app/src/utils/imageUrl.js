import { API_BASE_URL } from './api';

export const resolveImageUrl = (relativeOrAbsolutePath) => {
  if (!relativeOrAbsolutePath) return relativeOrAbsolutePath;

  const pathAsString = String(relativeOrAbsolutePath);

  const isAbsolute =
    pathAsString.startsWith('http://') ||
    pathAsString.startsWith('https://') ||
    pathAsString.startsWith('data:');

  if (isAbsolute) return pathAsString;

  if (pathAsString.startsWith('/')) return `${API_BASE_URL}${pathAsString}`;

  return `${API_BASE_URL}/${pathAsString}`;
};


