import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import api from '../lib/api';

const CommunitiesContext = createContext();

export function CommunitiesProvider({ children }) {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch communities from API
  const fetchCommunities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getCommunities();
      setCommunities(data.communities || data);
    } catch (err) {
      console.error('Failed to fetch communities:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  const addCommunity = useCallback(async (community) => {
    try {
      const newCommunity = await api.createCommunity(community);
      setCommunities(prev => [...prev, newCommunity]);
      return newCommunity;
    } catch (err) {
      console.error('Failed to add community:', err);
      throw err;
    }
  }, []);

  const updateCommunity = useCallback(async (id, updatedData) => {
    try {
      const updated = await api.updateCommunity(id, updatedData);
      setCommunities(prev => prev.map(c => c.id === id ? updated : c));
      return updated;
    } catch (err) {
      console.error('Failed to update community:', err);
      throw err;
    }
  }, []);

  const deleteCommunity = useCallback(async (id) => {
    try {
      await api.deleteCommunity(id);
      setCommunities(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Failed to delete community:', err);
      throw err;
    }
  }, []);

  const addMember = useCallback(async (communityId) => {
    try {
      await api.joinCommunity(communityId);
      // Refresh communities to get updated member count
      await fetchCommunities();
    } catch (err) {
      console.error('Failed to add member:', err);
      throw err;
    }
  }, [fetchCommunities]);

  const removeMember = useCallback(async (communityId, userId) => {
    // Optimistic update - update UI immediately
    setCommunities(prev => prev.map(community => {
      if (community.id === communityId) {
        return {
          ...community,
          members: community.members.filter(m => m.id !== userId),
          memberCount: community.memberCount - 1
        };
      }
      return community;
    }));

    try {
      await api.removeMemberFromCommunity(communityId, userId);
    } catch (err) {
      console.error('Failed to remove member:', err);
      // Revert on error
      await fetchCommunities();
      throw err;
    }
  }, [fetchCommunities]);

  const updateMemberRole = useCallback(async (communityId, userId, newRole) => {
    // Optimistic update - update UI immediately
    setCommunities(prev => prev.map(community => {
      if (community.id === communityId) {
        return {
          ...community,
          members: community.members.map(member => {
            if (member.id === userId) {
              return { ...member, role: newRole.toLowerCase() };
            }
            return member;
          })
        };
      }
      return community;
    }));

    try {
      await api.updateCommunityMemberRole(communityId, userId, newRole);
    } catch (err) {
      console.error('Failed to update member role:', err);
      // Revert on error
      await fetchCommunities();
      throw err;
    }
  }, [fetchCommunities]);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    communities,
    loading,
    error,
    addCommunity,
    updateCommunity,
    deleteCommunity,
    addMember,
    removeMember,
    updateMemberRole,
    refreshCommunities: fetchCommunities
  }), [communities, loading, error, addCommunity, updateCommunity, deleteCommunity, addMember, removeMember, updateMemberRole, fetchCommunities]);

  return (
    <CommunitiesContext.Provider value={value}>
      {children}
    </CommunitiesContext.Provider>
  );
}

export function useCommunities() {
  const context = useContext(CommunitiesContext);
  if (!context) {
    throw new Error('useCommunities must be used within CommunitiesProvider');
  }
  return context;
}
