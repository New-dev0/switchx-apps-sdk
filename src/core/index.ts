/**
 * Core SwitchX SDK - Universal APIs
 * Works on both client and server (uses fetch, no Node.js-specific APIs)
 * All READ operations that work with any valid token
 *
 * IMPORTANT: This client accepts USER tokens (from SwitchX WebApp)
 * For server-side operations with MINIAPPS_TOKEN, use @switchx/apps-sdk/server
 */

import type {
  CommunityInfo,
  Message,
  CommunityMember,
  UserInfo,
  Channel,
  Group,
  ChatHistory,
  PaginationOptions,
  SearchOptions
} from '../types';

// API Configuration
const SWITCH_API_BASE_URL = "https://gateway.switchx.org/swagger";
const SWITCH_CHAT_API_URL = "https://chat-api.switchx.org";
const SWITCH_UPLOAD_URL = "https://de.switchx.dev/upload/stream";

/**
 * Core SwitchX Client
 * Universal client that works on both client and server
 * Pass user token directly in constructor
 */
export class SwitchXCore {
  private authToken: string;

  /**
   * Create a new SwitchX client
   * @param token - User authentication token (from SwitchX WebApp)
   */
  constructor(token: string) {
    if (!token) {
      throw new Error('Token is required. Pass user token from SwitchX WebApp.');
    }
    this.authToken = token;
  }

  /**
   * Get the current token
   */
  getToken(): string {
    return this.authToken;
  }

  /**
   * Internal fetch helper
   */
  private async fetch<T>(url: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Accept': '*/*',
        'Authorization': this.authToken,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Get community information
   * @param communityId - Community ID (required)
   */
  async getCommunity(communityId: string): Promise<CommunityInfo> {
    if (!communityId) {
      throw new Error('Community ID is required.');
    }

    const data = await this.fetch<any>(
      `${SWITCH_API_BASE_URL}/community/v1/community?communityId=${communityId}`
    );

    return {
      id: data.result.communityId,
      name: data.result.communityName,
      description: data.result.communityDescription,
      imageUrl: data.result.communityProfileUrl,
      memberCount: data.result.member,
      username: data.result.communityUsername,
      link: data.result.link,
    };
  }

  /**
   * Get all members of the community
   * @param communityId - Community ID (required)
   */
  async getMembers(communityId: string): Promise<CommunityMember[]> {
    if (!communityId) {
      throw new Error('Community ID is required');
    }

    const data = await this.fetch<any>(
      `${SWITCH_API_BASE_URL}/community/v1/community/users?communityId=${communityId}`
    );

    return data.result.userInfoList.map((user: any) => ({
      userId: user.id,
      name: user.name,
      imageUrl: user.imageUrl,
      bot: user.bot
    }));
  }

  /**
   * Get information about a specific user
   * @param userId - User ID to fetch
   */
  async getUser(userId: string): Promise<UserInfo> {
    const data = await this.fetch<any>(
      `${SWITCH_CHAT_API_URL}/user/info?userId=${userId}`
    );

    return {
      userId: data.id,
      name: data.name,
      imageUrl: data.imageUrl,
      username: data.username,
      bio: data.bio || '',
      bot: data.bot || false
    };
  }

  /**
   * Get all channels in the community
   * @param communityId - Community ID (required)
   */
  async getChannels(communityId: string): Promise<Channel[]> {
    if (!communityId) {
      throw new Error('Community ID is required');
    }

    const data = await this.fetch<any>(
      `${SWITCH_API_BASE_URL}/community/v1/community/channel/all?communityId=${communityId}`
    );

    return data.result.map((channel: any) => ({
      id: channel.channelId,
      name: channel.channelName,
      emoji: channel.icon
    }));
  }

  /**
   * Get all groups in the community
   * @param communityId - Community ID (required)
   */
  async getGroups(communityId: string): Promise<Group[]> {
    if (!communityId) {
      throw new Error('Community ID is required');
    }

    const data = await this.fetch<any>(
      `${SWITCH_API_BASE_URL}/community/v1/community/group/all?communityId=${communityId}`
    );

    return data.result.map((group: any) => ({
      id: group.groupId,
      name: group.groupName,
      emoji: group.icon
    }));
  }

  /**
   * Get chat history from a channel
   * @param channelId - Channel ID
   * @param communityId - Community ID (required)
   * @param options - Pagination options
   */
  async getChannelMessages(
    channelId: string,
    communityId: string,
    options: PaginationOptions = {}
  ): Promise<ChatHistory> {
    if (!communityId) {
      throw new Error('Community ID is required');
    }

    const params = new URLSearchParams({
      communityId,
      channelId,
      pageLimit: (options.limit || 100).toString(),
      pageOffset: (options.offset || 0).toString()
    });

    const data = await this.fetch<any>(
      `${SWITCH_CHAT_API_URL}/v1/message/community-messages?${params}`
    );

    return {
      messages: (data.messages || []).map((msg: any) => ({
        id: msg.id,
        message: msg.message || '',
        userId: msg.userId,
        sentDate: msg.sentDate,
        mediaUrl: msg.mediaLink || msg.media_link || '',
        isMedia: Boolean(msg.mediaLink || msg.media_link)
      })),
      totalCount: data.totalCount || 0,
      hasMore: data.hasMore || false
    };
  }

  /**
   * Get chat history from a group
   * @param groupId - Group ID
   * @param communityId - Community ID (required)
   * @param options - Pagination options
   */
  async getGroupMessages(
    groupId: string,
    communityId: string,
    options: PaginationOptions = {}
  ): Promise<ChatHistory> {
    if (!communityId) {
      throw new Error('Community ID is required');
    }

    const params = new URLSearchParams({
      communityId,
      groupId,
      limit: (options.limit || 100).toString(),
      offset: (options.offset || 0).toString()
    });

    const data = await this.fetch<any>(
      `${SWITCH_CHAT_API_URL}/v1/message/community-messages?${params}`
    );

    return {
      messages: (data.messages || []).map((msg: any) => ({
        id: msg.id,
        message: msg.message || '',
        userId: msg.userId,
        sentDate: msg.sentDate,
        mediaUrl: msg.mediaLink || msg.media_link || '',
        isMedia: Boolean(msg.mediaLink || msg.media_link)
      })),
      totalCount: data.totalCount || 0,
      hasMore: data.hasMore || false
    };
  }

  /**
   * Search messages in the community
   * @param searchString - Text to search for
   * @param communityId - Community ID (required)
   * @param options - Search options
   */
  async searchMessages(
    searchString: string,
    communityId: string,
    options: SearchOptions = {}
  ): Promise<Message[]> {
    if (!communityId) {
      throw new Error('Community ID is required');
    }

    const params = new URLSearchParams({
      communityId,
      item: 'MESSAGE',
      limit: (options.limit || 10).toString(),
      page: (options.page || 0).toString(),
      searchString
    });

    const data = await this.fetch<any[]>(
      `${SWITCH_CHAT_API_URL}/v1/search/community-data?${params}`
    );

    return data.map((item: any) => ({
      id: item.id,
      message: item.message,
      userId: item.userId,
      sentDate: item.sentDate,
      mediaUrl: item.media_link || '',
      isMedia: Boolean(item.media_link)
    }));
  }

  /**
   * Check if a user is an admin
   * @param userId - User ID to check
   * @param communityId - Community ID (required)
   */
  async isAdmin(userId: string, communityId: string): Promise<boolean> {
    if (!communityId) {
      throw new Error('Community ID is required');
    }

    const data = await this.fetch<any>(
      `${SWITCH_API_BASE_URL}/community/v1/community/user?communityId=${communityId}&userId=${userId}`
    );

    return data.result?.admin || false;
  }

  /**
   * Get headings for a community
   * @param communityId - Community ID (required)
   * @param additional - Whether to fetch additional information
   */
  async getHeadings(communityId: string, additional = false): Promise<any[]> {
    if (!communityId) {
      throw new Error('Community ID is required');
    }

    const params = new URLSearchParams({
      communityId,
      additional: additional.toString()
    });

    const data = await this.fetch<any[]>(
      `${SWITCH_CHAT_API_URL}/headings?${params}`
    );

    return data;
  }

  /**
   * Get user's friends list
   * @param userId - User ID to get friends for
   */
  async getFriends(userId: string): Promise<any[]> {
    const data = await this.fetch<any[]>(
      `https://gateway.switchx.org/user-service/api/users/friends/getFriendsByUserId?userId=${userId}`
    );

    return data.map((friend: any) => ({
      userId: friend.id,
      username: friend.user_name,
      name: friend.name,
      email: friend.email,
      profileColour: friend.profile_colour,
      imageUrl: friend.imageurl,
      status: friend.status
    }));
  }

  /**
   * Get all friends of the authenticated user
   */
  async getAllFriends(): Promise<any[]> {
    const data = await this.fetch<any[]>(
      `https://gateway.switchx.org/user-service/api/users/friends/getAllFriends`
    );

    return data.map((friend: any) => ({
      userId: friend.id,
      username: friend.user_name,
      name: friend.name,
      email: friend.email,
      profileColour: friend.profile_colour,
      imageUrl: friend.imageurl,
      status: friend.status
    }));
  }

  /**
   * Get the number of friends for the authenticated user
   */
  async getFriendsCount(): Promise<number> {
    const data = await this.fetch<{ count: number }>(
      `https://gateway.switchx.org/user-service/api/users/friends/getNumberOfFriends`
    );
    return data.count || 0;
  }

  /**
   * Send a friend request to another user
   * @param userId - User ID to send friend request to
   */
  async sendFriendRequest(userId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `https://gateway.switchx.org/user-service/api/users/friends/connectFriend`,
        {
          method: 'POST',
          headers: {
            'Authorization': this.authToken,
            'Content-Type': 'application/json',
            'accept': '*/*'
          },
          body: JSON.stringify({ friend_id: userId })
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Error sending friend request:', error);
      return false;
    }
  }

  /**
   * Accept a friend request from another user
   * @param userId - User ID whose friend request to accept
   */
  async acceptFriendRequest(userId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `https://gateway.switchx.org/user-service/api/users/friends/acceptFriendRequest`,
        {
          method: 'POST',
          headers: {
            'Authorization': this.authToken,
            'Content-Type': 'application/json',
            'accept': '*/*'
          },
          body: JSON.stringify({
            friend_id: userId,
            decline: false
          })
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Error accepting friend request:', error);
      return false;
    }
  }

  /**
   * Reject/unfriend a user
   * @param userId - User ID to reject/unfriend
   */
  async rejectFriend(userId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `https://gateway.switchx.org/user-service/api/users/friends/unfriend/${userId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': this.authToken,
            'Content-Type': 'application/json',
            'accept': '*/*'
          }
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Error rejecting friend:', error);
      return false;
    }
  }

  /**
   * Unsend a friend request or remove a friend
   * @param userId - User ID to unsend request to or unfriend
   */
  async unsentFriendRequest(userId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `https://gateway.switchx.org/user-service/api/users/friends/unsentFriendRequest`,
        {
          method: 'POST',
          headers: {
            'Authorization': this.authToken,
            'Content-Type': 'application/json',
            'accept': '*/*'
          },
          body: JSON.stringify({ friend_id: userId })
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Error unsending friend request:', error);
      return false;
    }
  }

  /**
   * Block a user
   * @param userId - User ID to block
   */
  async blockUser(userId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `https://gateway.switchx.org/user-service/api/users/friends/block`,
        {
          method: 'POST',
          headers: {
            'Authorization': this.authToken,
            'Content-Type': 'application/json',
            'accept': '*/*'
          },
          body: JSON.stringify({ friend_id: userId })
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Error blocking user:', error);
      return false;
    }
  }

  /**
   * Send a message to a channel (uses user token)
   * @param channelId - Channel ID
   * @param message - Message text
   * @param communityId - Community ID (required)
   * @param options - Optional media link, media info, and status
   */
  async sendMessage(
    channelId: string,
    message: string,
    communityId: string,
    options?: {
      mediaLink?: string;
      mediaInfo?: Record<string, any>;
      status?: number; // 1=IMAGE, 2=VIDEO, 3=AUDIO, 7=DOCUMENT, 200=STICKER
    }
  ): Promise<any> {
    if (!communityId) {
      throw new Error('Community ID is required');
    }

    const messageData: any = {
      communityId,
      channelId,
      message
    };

    if (options?.mediaLink) messageData.mediaLink = options.mediaLink;
    if (options?.status) messageData.status = options.status;
    if (options?.mediaInfo) messageData.mediaInfo = options.mediaInfo;

    const response = await fetch(`${SWITCH_CHAT_API_URL}/v1/message/create`, {
      method: 'POST',
      headers: {
        'Authorization': this.authToken,
        'Content-Type': 'application/json',
        'accept': '*/*'
      },
      body: JSON.stringify(messageData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.message || 'Failed to send message');
      } catch {
        throw new Error('Failed to send message');
      }
    }

    return response.json() as Promise<any[]>;
  }

  /**
   * Create a new channel
   * @param name - Channel name
   * @param communityId - Community ID (required)
   * @param options - Optional settings
   */
  async createChannel(
    name: string,
    communityId: string,
    options?: {
      icon?: string;
      link?: string;
      miniAppLink?: string;
      isPublic?: boolean;
      enabledFree?: boolean;
      enabledPublic?: boolean;
    }
  ): Promise<any> {
    if (!communityId) {
      throw new Error('Community ID is required');
    }

    const channelData: any = {
      communityId,
      channelName: name,
      isPublic: options?.isPublic !== false,
      enabledFree: options?.enabledFree !== false,
      enabledPublic: options?.enabledPublic !== false,
    };

    if (options?.icon) channelData.icon = options.icon;
    if (options?.link) {
      channelData.link = options.link;
      channelData.linkBased = true;
    }
    if (options?.miniAppLink) channelData.miniAppLink = options.miniAppLink;

    const response = await fetch(`${SWITCH_API_BASE_URL}/community/v1/community/channel`, {
      method: 'POST',
      headers: {
        'Authorization': this.authToken,
        'Content-Type': 'application/json',
        'accept': '*/*'
      },
      body: JSON.stringify(channelData)
    });

    if (!response.ok) {
      throw new Error(`Failed to create channel: ${response.status}`);
    }

    const result: any = await response.json();
    return result.result || result;
  }

  /**
   * Delete a channel
   * @param channelId - Channel ID to delete
   * @param communityId - Community ID (required)
   */
  async deleteChannel(channelId: string, communityId: string): Promise<any> {
    if (!communityId) {
      throw new Error('Community ID is required');
    }

    const params = new URLSearchParams({
      communityId,
      channelId
    });

    const response = await fetch(`${SWITCH_API_BASE_URL}/community/v1/community/channel?${params}`, {
      method: 'DELETE',
      headers: {
        'Authorization': this.authToken,
        'accept': '*/*'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to delete channel: ${response.status}`);
    }

    const result: any = await response.json();
    return result.result || result;
  }

  /**
   * Create a new group
   * @param name - Group name
   * @param communityId - Community ID (required)
   * @param options - Optional settings
   */
  async createGroup(
    name: string,
    communityId: string,
    options?: {
      icon?: string;
      isPublic?: boolean;
      enabledFree?: boolean;
      enabledPublic?: boolean;
    }
  ): Promise<any> {
    if (!communityId) {
      throw new Error('Community ID is required');
    }

    const groupData: any = {
      communityId,
      groupName: name,
      isPublic: options?.isPublic !== false,
      enabledFree: options?.enabledFree !== false,
      enabledPublic: options?.enabledPublic !== false,
    };

    if (options?.icon) groupData.icon = options.icon;

    const response = await fetch(`${SWITCH_API_BASE_URL}/community/v1/community/group`, {
      method: 'POST',
      headers: {
        'Authorization': this.authToken,
        'Content-Type': 'application/json',
        'accept': '*/*'
      },
      body: JSON.stringify(groupData)
    });

    if (!response.ok) {
      throw new Error(`Failed to create group: ${response.status}`);
    }

    const result: any = await response.json();
    return result.result || result;
  }

  /**
   * Delete a group
   * @param groupId - Group ID to delete
   * @param communityId - Community ID (required)
   */
  async deleteGroup(groupId: string, communityId: string): Promise<any> {
    if (!communityId) {
      throw new Error('Community ID is required');
    }

    const params = new URLSearchParams({
      communityId,
      groupId
    });

    const response = await fetch(`${SWITCH_API_BASE_URL}/community/v1/community/group?${params}`, {
      method: 'DELETE',
      headers: {
        'Authorization': this.authToken,
        'accept': '*/*'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to delete group: ${response.status}`);
    }

    const result: any = await response.json();
    return result.result || result;
  }

  /**
   * Update community information
   * @param communityId - Community ID (required)
   * @param updates - Fields to update
   */
  async updateCommunity(
    communityId: string,
    updates: {
      communityName?: string;
      communityDescription?: string;
      communityUsername?: string;
      communityType?: 'PRIVATE' | 'PUBLIC';
      communityProfileUrl?: string;
      communityCoverUrl?: string;
      communityCategory?: string;
      communityGuidelines?: string;
      communityGuidelinesEnabled?: boolean;
      verified?: boolean;
      public?: boolean;
      free?: boolean;
      showIcon?: boolean;
      hideAdmin?: boolean;
      websiteUrl?: string;
      email?: string;
      twitterHandle?: string;
      instagramHandle?: string;
      facebookHandle?: string;
      hashtags?: string[];
      emoji?: string[];
      icon?: string;
      aiData?: Record<string, any>;
      commands?: Array<Record<string, any>>;
    }
  ): Promise<any> {
    if (!communityId) {
      throw new Error('Community ID is required');
    }

    // First get current data
    const currentData = await this.getCommunity(communityId);

    // Merge with updates
    const body = { ...currentData, communityId, ...updates };

    const response = await fetch(`${SWITCH_API_BASE_URL}/community/v1/community`, {
      method: 'PUT',
      headers: {
        'Authorization': this.authToken,
        'Content-Type': 'application/json',
        'accept': '*/*'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`Failed to update community: ${response.status}`);
    }

    const result: any = await response.json();
    return result.result || result;
  }

  /**
   * Add a member to community
   * @param userId - User ID to add
   * @param communityId - Community ID (required)
   * @param options - Optional settings
   */
  async addMember(
    userId: string,
    communityId: string,
    options?: {
      admin?: boolean;
    }
  ): Promise<any> {
    if (!communityId) {
      throw new Error('Community ID is required');
    }

    const body = {
      communityMembers: [
        {
          communityId,
          userId,
          admin: options?.admin || false
        }
      ]
    };

    const response = await fetch(`${SWITCH_API_BASE_URL}/community/v1/community/users`, {
      method: 'POST',
      headers: {
        'Authorization': this.authToken,
        'Content-Type': 'application/json',
        'accept': '*/*'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`Failed to add member: ${response.status}`);
    }

    const result: any = await response.json();
    return result.result || result;
  }

  /**
   * Create a role in community
   * @param name - Role name
   * @param communityId - Community ID (required)
   * @param options - Optional settings
   */
  async createRole(
    name: string,
    communityId: string,
    options?: {
      colour?: string;
    }
  ): Promise<any> {
    if (!communityId) {
      throw new Error('Community ID is required');
    }

    const body = {
      communityId,
      roleName: name,
      roleColour: options?.colour || '#808080'
    };

    const response = await fetch(
      `${SWITCH_API_BASE_URL}/community/v1/community/roles/add?communityId=${communityId}`,
      {
        method: 'POST',
        headers: {
          'Authorization': this.authToken,
          'Content-Type': 'application/json',
          'accept': '*/*'
        },
        body: JSON.stringify(body)
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create role: ${response.status}`);
    }

    const result: any = await response.json();
    return result.result || result;
  }

  // ===== Message Operations =====

  /**
   * Create a reaction on a message
   * @param messageId - Message ID to react to
   * @param emoji - Emoji to react with
   * @param communityId - Community ID (required)
   */
  async createReaction(messageId: string, emoji: string, communityId: string): Promise<void> {
    if (!communityId) {
      throw new Error('Community ID is required');
    }

    const response = await fetch(`${SWITCH_CHAT_API_URL}/chat/v1/react/create`, {
      method: 'POST',
      headers: {
        'Authorization': this.authToken,
        'Content-Type': 'application/json',
        'accept': '*/*'
      },
      body: JSON.stringify({
        messageId,
        emoji,
        communityId
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to create reaction: ${response.status}`);
    }
  }

  /**
   * Delete a reaction from a message
   * @param messageId - Message ID to remove reaction from
   * @param emoji - Emoji to remove
   * @param communityId - Community ID (required)
   */
  async deleteReaction(messageId: string, emoji: string, communityId: string): Promise<void> {
    if (!communityId) {
      throw new Error('Community ID is required');
    }

    const response = await fetch(`${SWITCH_CHAT_API_URL}/chat/v1/react/delete`, {
      method: 'DELETE',
      headers: {
        'Authorization': this.authToken,
        'Content-Type': 'application/json',
        'accept': '*/*'
      },
      body: JSON.stringify({
        messageId,
        emoji,
        communityId
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to delete reaction: ${response.status}`);
    }
  }

  /**
   * Delete a message
   * @param messageId - Message ID to delete
   */
  async deleteMessage(messageId: string): Promise<void> {
    const response = await fetch(`${SWITCH_CHAT_API_URL}/v1/message/${messageId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': this.authToken,
        'accept': '*/*'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to delete message: ${response.status}`);
    }
  }

  /**
   * Edit a message
   * @param messageId - Message ID to edit
   * @param newContent - New message content
   */
  async editMessage(messageId: string, newContent: string): Promise<any> {
    const response = await fetch(`https://gateway.switchx.org/v1/message/?id=${messageId}`, {
      method: 'PUT',
      headers: {
        'Authorization': this.authToken,
        'Content-Type': 'application/json',
        'accept': '*/*'
      },
      body: JSON.stringify({
        message: newContent,
        id: messageId
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to edit message: ${response.status}`);
    }

    return response.json() as Promise<any[]>;
  }

  /**
   * Pin/unpin a message
   * @param messageId - Message ID to pin
   * @param communityId - Community ID (required)
   */
  async pinMessage(messageId: string, communityId: string): Promise<void> {
    if (!communityId) {
      throw new Error('Community ID is required');
    }

    const response = await fetch(`${SWITCH_CHAT_API_URL}/chat/v1/pin`, {
      method: 'POST',
      headers: {
        'Authorization': this.authToken,
        'Content-Type': 'application/json',
        'accept': '*/*'
      },
      body: JSON.stringify({
        messageId,
        communityId
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to pin message: ${response.status}`);
    }
  }

  /**
   * Forward a message to another channel/group or user
   * @param messageId - Message ID(s) to forward (can be single or array)
   * @param options - Target groupChannelId or receiverId
   */
  async forwardMessage(
    messageId: string | string[],
    options: {
      groupChannelId?: string;
      receiverId?: string;
    }
  ): Promise<any> {
    const messageIdStr = Array.isArray(messageId) ? messageId.join(',') : messageId;
    const queryParams = [];

    if (options.groupChannelId) {
      queryParams.push(`groupChannelId=${options.groupChannelId}`);
    }
    if (options.receiverId) {
      queryParams.push(`receiverId=${options.receiverId}`);
    }

    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

    const response = await fetch(
      `https://gateway.switchx.org/v1/message/forward/${messageIdStr}${queryString}`,
      {
        method: 'POST',
        headers: {
          'Authorization': this.authToken,
          'accept': '*/*'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to forward message: ${response.status}`);
    }

    return response.json() as Promise<any[]>;
  }

  // ===== User & Community Operations =====

  /**
   * Get current user details
   */
  async getCurrentUser(): Promise<any> {
    const data = await this.fetch<any>(
      `https://gateway.switchx.org/user-service/api/user`
    );
    return data;
  }

  /**
   * Join a community
   * @param communityId - Community ID to join
   * @param userId - User ID
   * @param groupId - Optional group ID to join
   * @param referredByUserId - Optional referrer user ID
   */
  async joinCommunity(
    communityId: string,
    userId: string,
    groupId?: string,
    referredByUserId?: string
  ): Promise<boolean> {
    const queryParams = new URLSearchParams({
      communityId,
      userId
    });

    if (groupId) queryParams.append('groupId', groupId);
    if (referredByUserId) queryParams.append('referredByUserId', referredByUserId);

    const response = await fetch(
      `https://gateway.switchx.org/v1/community/joinCommunity?${queryParams}`,
      {
        method: 'POST',
        headers: {
          'Authorization': this.authToken,
          'accept': '*/*'
        }
      }
    );

    return response.ok;
  }

  /**
   * Get detailed community information
   * @param communityId - Community ID (required)
   */
  async getCommunityDetails(communityId: string): Promise<any> {
    if (!communityId) {
      throw new Error('Community ID is required');
    }

    const data = await this.fetch<any>(
      `${SWITCH_API_BASE_URL}/community/v1/community?communityId=${communityId}`
    );
    return data;
  }

  /**
   * Get user notifications
   * @param userId - User ID
   * @param limit - Number of notifications to fetch
   * @param offset - Offset for pagination
   */
  async getNotifications(
    userId: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<any> {
    const data = await this.fetch<any>(
      `${SWITCH_CHAT_API_URL}/notification?limit=${limit}&offset=${offset}&userId=${userId}`
    );
    return data;
  }

  /**
   * Mark all notifications as read
   * @param userId - User ID
   */
  async markAllNotificationsAsRead(userId: string): Promise<void> {
    const response = await fetch(
      `${SWITCH_CHAT_API_URL}/notification/mark-all-read?userId=${userId}`,
      {
        method: 'POST',
        headers: {
          'Authorization': this.authToken,
          'accept': '*/*'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to mark notifications as read: ${response.status}`);
    }
  }

  // ===== Channel & Group Operations =====

  /**
   * Update channel information
   * @param channel - Channel object with updated fields
   */
  async updateChannel(channel: {
    channelId: string;
    channelName: string;
    communityId: string;
    enabledFree?: boolean;
    enabledPublic?: boolean;
    defaultChannel?: boolean;
    allowMemberToJoin?: boolean;
    icon?: string;
    allowedContent?: string[];
    contentMediaBased?: boolean;
    contentSeriesBased?: boolean;
    muted?: boolean;
    xpBased?: boolean;
    isComments?: boolean;
    visible?: boolean;
    disappearingMessages?: string;
    nfsw?: boolean;
    textbox?: boolean;
    linkBased?: boolean;
    link?: string;
  }): Promise<any> {
    const response = await fetch(`${SWITCH_API_BASE_URL}/community/v1/community/channel`, {
      method: 'PUT',
      headers: {
        'Authorization': this.authToken,
        'Content-Type': 'application/json',
        'accept': '*/*'
      },
      body: JSON.stringify(channel)
    });

    if (!response.ok) {
      throw new Error(`Failed to update channel: ${response.status}`);
    }

    return response.json() as Promise<any[]>;
  }

  /**
   * Update group information
   * @param groupId - Group ID to update
   * @param groupName - Group name
   * @param communityId - Community ID
   * @param options - Optional group settings
   */
  async updateGroup(
    groupId: string,
    groupName: string,
    communityId: string,
    options?: {
      enabledPublic?: boolean;
      allowMemberToJoin?: boolean;
      icon?: string;
      allowedContent?: string[];
      allowedContentEnabledForUsers?: string[];
      disappearingMessages?: string;
      thread?: boolean;
    }
  ): Promise<any> {
    const requestBody = {
      groupId,
      groupName,
      communityId,
      enabledPublic: options?.enabledPublic !== undefined ? options.enabledPublic : true,
      allowMemberToJoin: options?.allowMemberToJoin !== undefined ? options.allowMemberToJoin : true,
      icon: options?.icon || '👥',
      allowedContent: options?.allowedContent || ['GIFS', 'LOCATION', 'WEBLINKS', 'MEDIA', 'FILES'],
      allowedContentEnabledForUsers: options?.allowedContentEnabledForUsers || ['MEDIA', 'FILES', 'LOCATION', 'GIFS', 'WEBLINKS'],
      disappearingMessages: options?.disappearingMessages || 'OFF',
      thread: options?.thread !== undefined ? options.thread : true
    };

    const response = await fetch(`${SWITCH_API_BASE_URL}/community/v1/community/group`, {
      method: 'PUT',
      headers: {
        'Authorization': this.authToken,
        'Content-Type': 'application/json',
        'accept': '*/*'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Failed to update group: ${response.status}`);
    }

    return response.json() as Promise<any[]>;
  }

  /**
   * Mark channel as read
   * @param communityId - Community ID
   * @param channelId - Channel ID
   */
  async markChannelAsRead(communityId: string, channelId: string): Promise<boolean> {
    const response = await fetch(
      `${SWITCH_CHAT_API_URL}/v1/message/reset/unread-stat?communityId=${communityId}&channelId=${channelId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': this.authToken,
          'accept': '*/*'
        }
      }
    );

    return response.ok;
  }

  /**
   * Mark group as read
   * @param communityId - Community ID
   * @param groupId - Group ID
   */
  async markGroupAsRead(communityId: string, groupId: string): Promise<boolean> {
    const response = await fetch(
      `${SWITCH_CHAT_API_URL}/v1/message/reset/unread-stat?communityId=${communityId}&groupId=${groupId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': this.authToken,
          'accept': '*/*'
        }
      }
    );

    return response.ok;
  }

  // ===== AI Operations =====

  /**
   * Chat with Gemini AI
   * @param messages - Array of message objects with role and content
   * @param options - Optional settings (model, temperature, etc.)
   */
  async chatWithAI(
    messages: Array<{ role: string; content: string }>,
    options?: {
      model?: string;
      temperature?: number;
      max_tokens?: number;
      stream?: boolean;
      thinking_budget?: number;
    }
  ): Promise<any> {
    const response = await fetch('https://de.switchx.dev/ai/completions', {
      method: 'POST',
      headers: {
        'Authorization': this.authToken,
        'Content-Type': 'application/json',
        'accept': '*/*'
      },
      body: JSON.stringify({
        model: options?.model || 'gemini-2.5-flash',
        messages,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.max_tokens,
        stream: options?.stream || false,
        thinking_budget: options?.thinking_budget || 250
      })
    });

    if (!response.ok) {
      throw new Error(`AI chat failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Generate image with Gemini AI
   * @param prompt - Text prompt for image generation
   * @param options - Optional settings
   */
  async generateImage(
    prompt: string,
    options?: {
      response_modalities?: string[];
      images_base64?: Array<{ data: string; mime_type?: string }>;
    }
  ): Promise<any> {
    const response = await fetch('https://de.switchx.dev/ai/generate-image', {
      method: 'POST',
      headers: {
        'Authorization': this.authToken,
        'Content-Type': 'application/json',
        'accept': '*/*'
      },
      body: JSON.stringify({
        prompt,
        response_modalities: options?.response_modalities || ['TEXT', 'IMAGE'],
        images_base64: options?.images_base64
      })
    });

    if (!response.ok) {
      throw new Error(`Image generation failed: ${response.status}`);
    }

    return response.json();
  }

  // ===== File Upload APIs =====

  /**
   * Upload a file (browser-compatible, works with File/Blob)
   * @param file - File or Blob to upload
   * @param filename - Optional filename (auto-generated if not provided)
   */
  async uploadFile(file: File | Blob, filename?: string): Promise<string> {
    try {
      const formData = new FormData();
      const name = filename || `upload_${Date.now()}.${file.type.split('/')[1] || 'file'}`;

      formData.append('files', file, name);

      const response = await fetch(SWITCH_UPLOAD_URL, {
        method: 'POST',
        headers: {
          'Authorization': this.authToken,
          'Accept': '*/*'
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const data: any = await response.json();

      if (data?.files && data.files.length > 0) {
        return data.files[0].url;
      }

      throw new Error('No URL returned from upload');
    } catch (error: any) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  // ===== Sticker Pack APIs =====

  /**
   * Get stickers installed in a community
   * @param communityId - Community ID (required)
   */
  async getInstalledStickerPacks(communityId: string): Promise<any[]> {
    if (!communityId) {
      throw new Error('Community ID is required');
    }

    const params = new URLSearchParams({ communityId });

    const response = await fetch(`${SWITCH_CHAT_API_URL}/v1/sticker/pack/installed?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': this.authToken,
        'accept': '*/*'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get installed sticker packs: ${response.status}`);
    }

    return response.json() as Promise<any[]>;
  }

  /**
   * Install a sticker pack to a community
   * @param stickerPackId - Sticker pack ID to install
   * @param communityId - Community ID (required)
   */
  async installStickerPack(stickerPackId: string, communityId: string): Promise<any> {
    if (!communityId) {
      throw new Error('Community ID is required');
    }

    const params = new URLSearchParams({
      stickerPackId,
      communityId
    });

    const response = await fetch(`${SWITCH_CHAT_API_URL}/v1/sticker/pack/install?${params}`, {
      method: 'POST',
      headers: {
        'Authorization': this.authToken,
        'accept': '*/*'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to install sticker pack: ${response.status}`);
    }

    return response.json() as Promise<any[]>;
  }

  /**
   * Uninstall a sticker pack
   * @param stickerPackId - Sticker pack ID to uninstall
   */
  async uninstallStickerPack(stickerPackId: string): Promise<any> {
    const params = new URLSearchParams({ stickerPackId });

    const response = await fetch(`${SWITCH_CHAT_API_URL}/v1/sticker/pack/uninstall?${params}`, {
      method: 'POST',
      headers: {
        'Authorization': this.authToken,
        'accept': '*/*'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to uninstall sticker pack: ${response.status}`);
    }

    return response.json() as Promise<any[]>;
  }

  /**
   * Search for available sticker packs
   * @param query - Search query string
   * @param options - Search options (limit, offset, packType)
   */
  async searchStickerPacks(
    query: string,
    options?: {
      limit?: number;
      offset?: number;
      packType?: string;
    }
  ): Promise<any[]> {
    const params = new URLSearchParams({
      query,
      limit: (options?.limit || 20).toString(),
      offset: (options?.offset || 0).toString()
    });

    if (options?.packType) {
      params.append('packType', options.packType);
    }

    const response = await fetch(`${SWITCH_CHAT_API_URL}/v1/sticker/pack/search?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': this.authToken,
        'accept': '*/*'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to search sticker packs: ${response.status}`);
    }

    return response.json() as Promise<any[]>;
  }

  /**
   * Get stickers from a sticker pack
   * @param stickerPackId - Sticker pack ID
   * @param options - Pagination options (limit, offset)
   */
  async getStickersFromPack(
    stickerPackId: string,
    options?: {
      limit?: number;
      offset?: number;
    }
  ): Promise<any[]> {
    const params = new URLSearchParams({
      stickerPackId,
      limit: (options?.limit || 50).toString(),
      offset: (options?.offset || 0).toString()
    });

    const response = await fetch(`${SWITCH_CHAT_API_URL}/v1/sticker?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': this.authToken,
        'accept': '*/*'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get stickers from pack: ${response.status}`);
    }

    return response.json() as Promise<any[]>;
  }

  /**
   * Get all available sticker packs
   * @param options - Pagination options (limit, offset)
   */
  async getStickerPacks(options?: {
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const params = new URLSearchParams({
      limit: (options?.limit || 50).toString(),
      offset: (options?.offset || 0).toString()
    });

    const response = await fetch(`${SWITCH_CHAT_API_URL}/v1/sticker/pack?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': this.authToken,
        'accept': '*/*'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get sticker packs: ${response.status}`);
    }

    return response.json() as Promise<any[]>;
  }

  /**
   * Create a custom sticker pack
   * @param data - Sticker pack data (FormData)
   */
  async createStickerPack(data: FormData): Promise<any> {
    const response = await fetch(`${SWITCH_CHAT_API_URL}/v1/sticker/pack`, {
      method: 'POST',
      headers: {
        'Authorization': this.authToken,
        'accept': '*/*'
      },
      body: data
    });

    if (!response.ok) {
      throw new Error(`Failed to create sticker pack: ${response.status}`);
    }

    return response.json() as Promise<any[]>;
  }

  /**
   * Delete a sticker pack
   * @param id - Sticker pack ID to delete
   */
  async deleteStickerPack(id: string): Promise<any> {
    const params = new URLSearchParams({ id });

    const response = await fetch(`${SWITCH_CHAT_API_URL}/v1/sticker/pack?${params}`, {
      method: 'DELETE',
      headers: {
        'Authorization': this.authToken,
        'accept': '*/*'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to delete sticker pack: ${response.status}`);
    }

    return response.json() as Promise<any[]>;
  }
}

// Export types
export * from '../types';
