/**
 * Shared TypeScript types for SwitchX SDK
 * These types are used across all SDK modules
 */

export interface CommunityInfo {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  memberCount: number;
  username: string;
  link: string;
}

export interface Message {
  id: string;
  message: string;
  userId: string;
  sentDate: string;
  mediaUrl?: string;
  isMedia: boolean;
}

export interface CommunityMember {
  userId: string;
  name: string;
  imageUrl: string;
  bot: boolean;
}

export interface UserInfo {
  userId: string;
  name: string;
  imageUrl: string;
  username: string;
  bio: string;
  bot: boolean;
}

export interface Channel {
  id: string;
  name: string;
  emoji: string;
}

export interface Group {
  id: string;
  name: string;
  emoji: string;
}

export interface ChatHistory {
  messages: Message[];
  totalCount: number;
  hasMore: boolean;
}

export interface NotificationOptions {
  title: string;
  message: string;
  channelId?: string;
  groupId?: string;
  userIds?: string[];
  imageUrl?: string;
}

export interface PaginationOptions {
  limit?: number;
  offset?: number;
}

export interface SearchOptions {
  limit?: number;
  page?: number;
}
