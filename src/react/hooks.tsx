/**
 * SwitchX React Hooks
 * These hooks use useAuth internally - no need to pass token!
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './auth';
import type {
  CommunityInfo,
  CommunityMember,
  UserInfo,
  Channel,
  Group,
  ChatHistory,
  Message,
  PaginationOptions,
  SearchOptions
} from '../types';

/**
 * Hook state interface
 */
interface UseQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  communityId?: string | null;
}

/**
 * Hook to get community information
 * Uses token from AuthContext automatically
 * If no communityId provided, uses communityId from auth context
 */
export function useCommunity(communityId?: string): UseQueryResult<CommunityInfo> {
  const { client, communityId: contextCommunityId } = useAuth();
  const effectiveCommunityId = communityId ?? contextCommunityId;

  const [data, setData] = useState<CommunityInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!client || !effectiveCommunityId) {
      setData(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await client.getCommunity(effectiveCommunityId);
      setData(result);
    } catch (err: any) {
      console.error('Failed to fetch community:', err);
      setError(err.message || 'Failed to fetch community');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [client, effectiveCommunityId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData, communityId: effectiveCommunityId };
}

/**
 * Hook to get community members
 * If no communityId provided, uses communityId from auth context
 */
export function useMembers(communityId?: string): UseQueryResult<CommunityMember[]> {
  const { client, communityId: contextCommunityId } = useAuth();
  const effectiveCommunityId = communityId ?? contextCommunityId;

  const [data, setData] = useState<CommunityMember[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!client || !effectiveCommunityId) {
      setData(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await client.getMembers(effectiveCommunityId);
      setData(result);
    } catch (err: any) {
      console.error('Failed to fetch members:', err);
      setError(err.message || 'Failed to fetch members');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [client, effectiveCommunityId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to get user information
 */
export function useUser(userId?: string): UseQueryResult<UserInfo> {
  const { client } = useAuth();
  const [data, setData] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!client || !userId) {
      setData(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await client.getUser(userId);
      setData(result);
    } catch (err: any) {
      console.error('Failed to fetch user:', err);
      setError(err.message || 'Failed to fetch user');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [client, userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to get channels
 * If no communityId provided, uses communityId from auth context
 */
export function useChannels(communityId?: string): UseQueryResult<Channel[]> {
  const { client, communityId: contextCommunityId } = useAuth();
  const effectiveCommunityId = communityId ?? contextCommunityId;

  const [data, setData] = useState<Channel[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!client || !effectiveCommunityId) {
      setData(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await client.getChannels(effectiveCommunityId);
      setData(result);
    } catch (err: any) {
      console.error('Failed to fetch channels:', err);
      setError(err.message || 'Failed to fetch channels');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [client, effectiveCommunityId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to get groups
 * If no communityId provided, uses communityId from auth context
 */
export function useGroups(communityId?: string): UseQueryResult<Group[]> {
  const { client, communityId: contextCommunityId } = useAuth();
  const effectiveCommunityId = communityId ?? contextCommunityId;

  const [data, setData] = useState<Group[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!client || !effectiveCommunityId) {
      setData(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await client.getGroups(effectiveCommunityId);
      setData(result);
    } catch (err: any) {
      console.error('Failed to fetch groups:', err);
      setError(err.message || 'Failed to fetch groups');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [client, effectiveCommunityId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to get channel messages
 * Requires both channelId and communityId
 */
export function useChannelMessages(
  channelId: string | undefined,
  communityId: string,
  options?: PaginationOptions
): UseQueryResult<ChatHistory> {
  const { client } = useAuth();
  const [data, setData] = useState<ChatHistory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!client || !channelId || !communityId) {
      setData(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await client.getChannelMessages(channelId, communityId, options);
      setData(result);
    } catch (err: any) {
      console.error('Failed to fetch channel messages:', err);
      setError(err.message || 'Failed to fetch channel messages');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [client, channelId, communityId, JSON.stringify(options)]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to get group messages
 * Requires both groupId and communityId
 */
export function useGroupMessages(
  groupId: string | undefined,
  communityId: string,
  options?: PaginationOptions
): UseQueryResult<ChatHistory> {
  const { client } = useAuth();
  const [data, setData] = useState<ChatHistory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!client || !groupId || !communityId) {
      setData(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await client.getGroupMessages(groupId, communityId, options);
      setData(result);
    } catch (err: any) {
      console.error('Failed to fetch group messages:', err);
      setError(err.message || 'Failed to fetch group messages');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [client, groupId, communityId, JSON.stringify(options)]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to search messages
 * Requires both searchString and communityId
 */
export function useSearchMessages(
  searchString: string | undefined,
  communityId: string,
  options?: SearchOptions
): UseQueryResult<Message[]> {
  const { client } = useAuth();
  const [data, setData] = useState<Message[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!client || !searchString || !communityId) {
      setData(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await client.searchMessages(searchString, communityId, options);
      setData(result);
    } catch (err: any) {
      console.error('Failed to search messages:', err);
      setError(err.message || 'Failed to search messages');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [client, searchString, communityId, JSON.stringify(options)]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to check if a user is admin
 * Requires both userId and communityId
 */
export function useIsAdmin(
  userId: string | undefined,
  communityId: string
): UseQueryResult<boolean> {
  const { client } = useAuth();
  const [data, setData] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!client || !userId || !communityId) {
      setData(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await client.isAdmin(userId, communityId);
      setData(result);
    } catch (err: any) {
      console.error('Failed to check admin status:', err);
      setError(err.message || 'Failed to check admin status');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [client, userId, communityId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
