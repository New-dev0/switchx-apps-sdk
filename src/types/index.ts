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
  userId: string | number;
  notificationType: string;  // e.g., "AI_MESSAGE", "MINIAPP_ALERT", "SYSTEM_NOTIFICATION"
  title: string;
  message: string;
  communityId: string;
  image?: string;
  actionBy?: string;
  actionByUsername?: string;
  actionByImage?: string;
  customData?: Record<string, any>;
}

export interface PaginationOptions {
  limit?: number;
  offset?: number;
}

export interface SearchOptions {
  limit?: number;
  page?: number;
}

export type SwitchXDatabaseScope = 'app' | 'app-community';

export type SwitchXDatabaseValue =
  | string
  | number
  | boolean
  | null
  | SwitchXDatabaseValue[]
  | { [key: string]: SwitchXDatabaseValue };

export type SwitchXDatabaseFilter = Record<
  string,
  | SwitchXDatabaseValue
  | {
      eq?: SwitchXDatabaseValue;
      ne?: SwitchXDatabaseValue;
      gt?: number;
      gte?: number;
      lt?: number;
      lte?: number;
      in?: SwitchXDatabaseValue[];
      like?: string;
      exists?: boolean;
    }
>;

export type SwitchXDatabaseRecord<T> = T & {
  id: string;
  createdAt?: string;
  updatedAt?: string;
};

export interface SwitchXDatabaseQueryInput<T = Record<string, any>> {
  table: string;
  filter?: SwitchXDatabaseFilter;
  select?: Array<keyof T | string>;
  limit?: number;
  offset?: number;
  orderBy?: keyof T | string;
  order?: 'asc' | 'desc';
  scope?: SwitchXDatabaseScope;
  communityId?: string;
}

export interface SwitchXDatabaseGetInput {
  table: string;
  id: string;
  scope?: SwitchXDatabaseScope;
  communityId?: string;
}

export interface SwitchXDatabaseInsertInput<T = Record<string, any>> {
  table: string;
  values: T | T[];
  scope?: SwitchXDatabaseScope;
  communityId?: string;
}

export interface SwitchXDatabaseUpdateInput<T = Record<string, any>> {
  table: string;
  filter: SwitchXDatabaseFilter;
  values: Partial<T>;
  limit?: number;
  scope?: SwitchXDatabaseScope;
  communityId?: string;
}

export interface SwitchXDatabaseDeleteInput {
  table: string;
  filter: SwitchXDatabaseFilter;
  limit?: number;
  scope?: SwitchXDatabaseScope;
  communityId?: string;
}
