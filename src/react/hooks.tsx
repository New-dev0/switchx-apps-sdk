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
}

/**
 * Hook to get community information
 * Uses token from AuthContext automatically
 */
export function useCommunity(communityId?: string): UseQueryResult<CommunityInfo> {
  const { client } = useAuth();
  const [data, setData] = useState<CommunityInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!client) {
      setData(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await client.getCommunity(communityId);
      setData(result);
    } catch (err: any) {
      console.error('Failed to fetch community:', err);
      setError(err.message || 'Failed to fetch community');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [client, communityId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to get community members
 */
export function useMembers(communityId?: string): UseQueryResult<CommunityMember[]> {
  const { client } = useAuth();
  const [data, setData] = useState<CommunityMember[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!client) {
      setData(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await client.getMembers(communityId);
      setData(result);
    } catch (err: any) {
      console.error('Failed to fetch members:', err);
      setError(err.message || 'Failed to fetch members');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [client, communityId]);

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
 */
export function useChannels(communityId?: string): UseQueryResult<Channel[]> {
  const { client } = useAuth();
  const [data, setData] = useState<Channel[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!client) {
      setData(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await client.getChannels(communityId);
      setData(result);
    } catch (err: any) {
      console.error('Failed to fetch channels:', err);
      setError(err.message || 'Failed to fetch channels');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [client, communityId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to get groups
 */
export function useGroups(communityId?: string): UseQueryResult<Group[]> {
  const { client } = useAuth();
  const [data, setData] = useState<Group[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!client) {
      setData(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await client.getGroups(communityId);
      setData(result);
    } catch (err: any) {
      console.error('Failed to fetch groups:', err);
      setError(err.message || 'Failed to fetch groups');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [client, communityId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to get channel messages
 */
export function useChannelMessages(
  channelId: string | undefined,
  options?: PaginationOptions & { communityId?: string }
): UseQueryResult<ChatHistory> {
  const { client } = useAuth();
  const [data, setData] = useState<ChatHistory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!client || !channelId) {
      setData(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await client.getChannelMessages(channelId, options);
      setData(result);
    } catch (err: any) {
      console.error('Failed to fetch channel messages:', err);
      setError(err.message || 'Failed to fetch channel messages');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [client, channelId, JSON.stringify(options)]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to get group messages
 */
export function useGroupMessages(
  groupId: string | undefined,
  options?: PaginationOptions & { communityId?: string }
): UseQueryResult<ChatHistory> {
  const { client } = useAuth();
  const [data, setData] = useState<ChatHistory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!client || !groupId) {
      setData(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await client.getGroupMessages(groupId, options);
      setData(result);
    } catch (err: any) {
      console.error('Failed to fetch group messages:', err);
      setError(err.message || 'Failed to fetch group messages');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [client, groupId, JSON.stringify(options)]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to search messages
 */
export function useSearchMessages(
  searchString: string | undefined,
  options?: SearchOptions & { communityId?: string }
): UseQueryResult<Message[]> {
  const { client } = useAuth();
  const [data, setData] = useState<Message[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!client || !searchString) {
      setData(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await client.searchMessages(searchString, options);
      setData(result);
    } catch (err: any) {
      console.error('Failed to search messages:', err);
      setError(err.message || 'Failed to search messages');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [client, searchString, JSON.stringify(options)]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to check if a user is admin
 */
export function useIsAdmin(
  userId: string | undefined,
  communityId?: string
): UseQueryResult<boolean> {
  const { client } = useAuth();
  const [data, setData] = useState<boolean | null>(null);
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
