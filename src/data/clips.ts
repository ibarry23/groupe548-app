export type ClipName = 'empty-requests' | 'confirmation' | 'services-header' | 'more-header' | 'about';

/** Atmosphere clips for otherwise plain screens. Set to true once public/video/<name>.mp4 and
 *  public/img/photos/<name>-poster.jpg exist; a false entry renders nothing. */
export const CLIPS: Record<ClipName, boolean> = {
  'empty-requests': true,
  confirmation: true,
  'services-header': true,
  'more-header': true,
  about: true,
};
