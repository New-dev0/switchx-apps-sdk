/**
 * React SDK for SwitchX
 * Client-side only
 *
 * All hooks use useAuth() internally - no need to pass token manually!
 */

'use client';

// Export auth components
export {
  SwitchXAuthProvider,
  useAuth,
  useUserInfo,
  SwitchXAuthContext
} from './auth';

// Export all hooks
export {
  useCommunity,
  useMembers,
  useUser,
  useChannels,
  useGroups,
  useChannelMessages,
  useGroupMessages,
  useSearchMessages,
  useIsAdmin
} from './hooks';

// Re-export types
export * from '../types';
export { SwitchXCore } from '../core';
