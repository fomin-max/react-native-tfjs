import { isIOSPlatform } from '../../utils/helpers';

export const getTextureDimensions = (): Record<'height' | 'width', number> => {
  const isIOS = isIOSPlatform();

  if (isIOS) {
    return {
      height: 1920,
      width: 1080,
    };
  }

  return {
    height: 1200,
    width: 1600,
  };
};
