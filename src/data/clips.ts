export type ClipName = 'empty-requests' | 'confirmation' | 'services-header' | 'more-header' | 'about' | 'step-contact' | 'step-clarify' | 'step-quote' | 'step-done';

/** Atmosphere clips for otherwise plain screens. Set to true once public/video/<name>.mp4 and
 *  public/img/photos/<name>-poster.jpg exist; a false entry renders nothing. */
export const CLIPS: Record<ClipName, boolean> = {
  'empty-requests': true,
  confirmation: true,
  'services-header': true,
  'more-header': true,
  about: true,
  'step-contact': true,
  'step-clarify': true,
  'step-quote': true,
  'step-done': true,
};

/**
 * Clips illustrating the four "how it works" steps on Home. Until dedicated step clips exist
 * (step-contact … step-done), each step borrows the closest existing clip.
 */
export const STEP_CLIPS: string[] = ['empty-requests', 'confirmation', 'services-header', 'residential-cleaning'];

/** Services that have a "what's included" multi-shot clip at public/video/<id>-tasks.mp4 (+ -tasks-poster.jpg). */
export const TASK_CLIPS: Record<string, boolean> = {
  'residential-cleaning': true,
  'commercial-cleaning': true,
  'post-construction-cleaning': true,
  'window-cleaning': true,
  moving: false,
  'transport-delivery': false,
  'interior-painting': false,
};

