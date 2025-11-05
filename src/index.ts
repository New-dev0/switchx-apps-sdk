/**
 * Main entry point for @switchx/apps-sdk
 *
 * IMPORTANT: This exports the core client only.
 * For specific environments, use subpath imports:
 *
 * - Universal (client + server): import { SwitchXCore } from '@switchx/apps-sdk/core'
 * - Server-only (MINIAPPS_TOKEN): import { switchx } from '@switchx/apps-sdk/server'
 * - React (hooks + auth): import { useAuth, useCommunity } from '@switchx/apps-sdk/react'
 */

// Export core SDK (works everywhere with user token)
export { SwitchXCore } from './core';

// Export all types
export * from './types';
