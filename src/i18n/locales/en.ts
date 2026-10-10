export const en = {
  tagline: 'Local alerts. Your language.', languageTitle: 'Choose your language',
  languageDescription: 'Receive nearby emergency information in the language you understand best.',
  continue: 'Continue', locationTitle: 'Stay informed nearby',
  locationDescription: 'GudTour is for tourists in India. Share your current location to see nearby hazards and listed shelters.',
  locationAction: 'Use my current location', locationPrivacy: 'Your precise location is private. Other tourists cannot see it.',
  retry: 'Try again', loading: 'Loading…', errorTitle: 'Something went wrong',
  errorMessage: 'We could not load this information. Please try again.',
  emptyTitle: 'No information available', offline: 'You are offline. Previously saved information may be out of date.',
  stale: 'Information may be out of date.', settings: 'Open settings',
  permissionDenied: 'Location access is required to use GudTour in India.',
  outsideIndia: 'GudTour is currently available only in India.',
  uncertainLocation: 'We could not confirm your location inside India. Move to an open area and try again.',
  inaccurateLocation: 'Your location is not accurate enough yet. Move to an open area and try again.',
  serviceUnavailable: 'This service is temporarily unavailable. Please try again.',
  selected: 'Selected', saveError: 'We could not save your preference. Please try again.',
};
export type Translation = Record<keyof typeof en, string>;
