/**
 * Server-only SwitchX SDK
 * Uses Node.js specific APIs (Buffer, form-data)
 * For Next.js API routes, server actions, and backend services
 *
 * IMPORTANT: Uses MINIAPPS_TOKEN (server/bot token) not user tokens
 */

import axios from 'axios';
import FormData from 'form-data';
import { SwitchXCore } from '../core';
import type { NotificationOptions } from '../types';

const SWITCH_UPLOAD_URL = "https://de.switchx.dev/upload/stream";

/**
 * Server-side SwitchX Client
 * Extends core with server-only capabilities (file uploads, notifications)
 *
 * @example
 * import { SwitchXServer } from '@switchx/apps-sdk/server';
 * const client = new SwitchXServer(process.env.MINIAPPS_TOKEN);
 * const community = await client.getCommunity(communityId);
 * const imageUrl = await client.uploadImage(base64Data);
 */
export class SwitchXServer extends SwitchXCore {
  /**
   * Create server SDK instance with MINIAPPS_TOKEN
   * @param token - Server/bot token (MINIAPPS_TOKEN from env)
   * @param defaultCommunityId - Optional default community ID
   */
  constructor(token: string, defaultCommunityId?: string) {
    super(token, defaultCommunityId);
  }

  // ===== All core READ methods are inherited automatically! =====
  // - getCommunity()
  // - getMembers()
  // - getUser()
  // - getChannels()
  // - getGroups()
  // - getChannelMessages()
  // - getGroupMessages()
  // - searchMessages()
  // - isAdmin()

  // ===== Server-only methods =====

  /**
   * Upload an image from base64 data (Node.js only - uses Buffer)
   * @param base64Data - Base64 encoded image
   * @param mimeType - MIME type (default: image/png)
   */
  async uploadImage(base64Data: string, mimeType: string = 'image/png'): Promise<string> {
    try {
      const imageBuffer = Buffer.from(base64Data, 'base64');
      const formData = new FormData();
      const filename = `upload_${Date.now()}.png`;

      formData.append('files', imageBuffer, {
        filename,
        contentType: mimeType
      });

      const headers: any = {
        ...formData.getHeaders(),
        'Accept': '*/*',
        'Authorization': this.getToken()
      };

      const response = await axios.post(SWITCH_UPLOAD_URL, formData, {
        headers,
        timeout: 60000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });

      if (response.data?.files && response.data.files.length > 0) {
        return response.data.files[0].url;
      }

      throw new Error('No URL returned from upload');
    } catch (error: any) {
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  /**
   * Upload a file from Node.js buffer (server-only)
   * @param buffer - File buffer
   * @param filename - File name
   * @param mimeType - MIME type
   */
  async uploadFromBuffer(buffer: Buffer, filename: string, mimeType: string): Promise<string> {
    try {
      const formData = new FormData();

      formData.append('files', buffer, {
        filename,
        contentType: mimeType
      });

      const headers: any = {
        ...formData.getHeaders(),
        'Accept': '*/*',
        'Authorization': this.getToken()
      };

      const response = await axios.post(SWITCH_UPLOAD_URL, formData, {
        headers,
        timeout: 60000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });

      if (response.data?.files && response.data.files.length > 0) {
        return response.data.files[0].url;
      }

      throw new Error('No URL returned from upload');
    } catch (error: any) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Check if a user can receive notifications
   * Currently returns true always (API not implemented yet)
   *
   * @param userId - User ID to check
   * @returns boolean - true if can send, false otherwise
   *
   * @example
   * const canSend = await client.canSendNotification('12345');
   * if (canSend) {
   *   await client.sendNotification({ ... });
   * }
   */
  async canSendNotification(_userId: string): Promise<boolean> {
    // TODO: Implement API check when backend endpoint is ready
    return true;
  }

  /**
   * Send FCM notification to a user
   * Server-only operation requiring miniapp token
   *
   * @param options - Notification configuration
   * @throws Error if notification fails to send
   *
   * @example
   * await client.sendNotification({
   *   userId: '12345',
   *   notificationType: 'MINIAPP_ALERT',
   *   title: 'New Update',
   *   message: 'Check out the latest features!',
   *   communityId: 'community-id',
   *   image: 'https://example.com/icon.png',
   *   customData: { action: 'view_update' }
   * });
   */
  async sendNotification(options: NotificationOptions): Promise<void> {
    try {
      // Map camelCase to snake_case for backend API
      const payload = {
        user_id: options.userId,
        notification_type: options.notificationType,
        title: options.title,
        message: options.message,
        community_id: options.communityId,
        ...(options.image && { image: options.image }),
        ...(options.actionBy && { action_by: options.actionBy }),
        ...(options.actionByUsername && { action_by_username: options.actionByUsername }),
        ...(options.actionByImage && { action_by_image: options.actionByImage }),
        ...(options.customData && { custom_data: options.customData })
      };

      const response = await axios.post(
        'https://de.switchx.dev/api/miniapp/send-notification-fcm',
        payload,
        {
          headers: {
            'Authorization': this.getToken(),
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Failed to send notification');
      }
    } catch (error: any) {
      if (error.response) {
        const detail = error.response.data?.detail || error.response.statusText;
        throw new Error(`Failed to send notification: ${detail}`);
      }
      throw new Error(`Failed to send notification: ${error.message}`);
    }
  }

  /**
   * Get miniapp project information (basic metadata only)
   * Returns info about the current miniapp (requires miniapp token with project_id)
   *
   * @returns Basic project metadata
   *
   * @example
   * const appInfo = await client.getAppInfo();
   * console.log(appInfo.name, appInfo.description, appInfo.productionUrl);
   */
  async getAppInfo(): Promise<{
    name: string;
    description: string;
    emoji: any;
    createdBy: number;
    productionUrl: string | null;
  }> {
    try {
      const response = await axios.get(
        'https://de.switchx.dev/api/mcp/project',
        {
          headers: {
            'Authorization': this.getToken()
          },
          timeout: 10000
        }
      );

      const data = response.data;

      // Return only basic metadata
      return {
        name: data.name,
        description: data.description,
        emoji: data.emoji,
        createdBy: data.created_by,
        productionUrl: data.deployment_meta?.production_url || null
      };
    } catch (error: any) {
      if (error.response) {
        const detail = error.response.data?.detail || error.response.statusText;
        throw new Error(`Failed to get app info: ${detail}`);
      }
      throw new Error(`Failed to get app info: ${error.message}`);
    }
  }

  // ===== AI Operations are inherited from Core =====
  // - chatWithAI()
  // - generateImage()
}

/**
 * Helper to create a configured server instance from environment
 * Auto-loads token from SWITCHX_TOKEN or MINIAPPS_TOKEN env vars
 *
 * @example
 * // Auto-load from environment
 * import { createServerClient } from '@switchx/apps-sdk/server';
 * const client = createServerClient();
 *
 * // Or pass token explicitly
 * const client = createServerClient({
 *   token: process.env.MINIAPPS_TOKEN,
 *   communityId: 'community-id'
 * });
 */
export function createServerClient(config?: {
  token?: string;
  communityId?: string;
}): SwitchXServer {
  const token = config?.token || process.env.SWITCHX_TOKEN || process.env.MINIAPPS_TOKEN;
  const communityId = config?.communityId || process.env.SWITCHX_COMMUNITY_ID;

  if (!token) {
    throw new Error(
      'Token is required. Pass config.token or set SWITCHX_TOKEN/MINIAPPS_TOKEN env var.'
    );
  }

  return new SwitchXServer(token, communityId);
}

// Re-export core types
export * from '../types';
export { SwitchXCore } from '../core';
