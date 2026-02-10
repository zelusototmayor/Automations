// Utility to get avatar image by index
const AVATAR_IMAGES = [
  require('../../assets/avatars/avatar-1.jpg'),
  require('../../assets/avatars/avatar-2.jpg'),
  require('../../assets/avatars/avatar-3.jpg'),
  require('../../assets/avatars/avatar-4.jpg'),
  require('../../assets/avatars/avatar-5.jpg'),
];

export const AVATAR_COUNT = AVATAR_IMAGES.length;

export function getAvatarByIndex(index: number) {
  return AVATAR_IMAGES[index % AVATAR_COUNT];
}

export function getAvatarByHash(text: string) {
  const hash = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_IMAGES[hash % AVATAR_COUNT];
}

export { AVATAR_IMAGES };
