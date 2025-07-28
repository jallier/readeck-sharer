import { getPreferences, type UserPreferences } from '../lib/preferences';
import type { LayoutLoad } from './$types';

export const ssr = false;

export const load: LayoutLoad = async () => {
  let preferences: UserPreferences | false;
  try {
    preferences = await getPreferences();
  } catch (error) {
    console.error('Error loading preferences:', error);
    preferences = false as const;
  }

  return {
    preferences,
  };
};
