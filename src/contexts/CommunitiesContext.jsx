import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const CommunitiesContext = createContext();

export function CommunitiesProvider({ children }) {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch communities from API
  const fetchCommunities = async () => {
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
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  const addCommunity = async (community) => {
    try {
      const newCommunity = await api.createCommunity(community);
      setCommunities(prev => [...prev, newCommunity]);
      return newCommunity;
    } catch (err) {
      console.error('Failed to add community:', err);
      throw err;
    }
  };

  const updateCommunity = async (id, updatedData) => {
    try {
      const updated = await api.updateCommunity(id, updatedData);
      setCommunities(prev => prev.map(c => c.id === id ? updated : c));
      return updated;
    } catch (err) {
      console.error('Failed to update community:', err);
      throw err;
    }
  };

  const deleteCommunity = async (id) => {
    try {
      await api.deleteCommunity(id);
      setCommunities(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Failed to delete community:', err);
      throw err;
    }
  };

  const addMember = async (communityId) => {
    try {
      await api.joinCommunity(communityId);
      // Refresh communities to get updated member count
      await fetchCommunities();
    } catch (err) {
      console.error('Failed to add member:', err);
      throw err;
    }
  };

  const removeMember = async (communityId, userId) => {
    try {
      await api.removeMemberFromCommunity(communityId, userId);
      // Refresh communities to get updated member count
      await fetchCommunities();
    } catch (err) {
      console.error('Failed to remove member:', err);
      throw err;
    }
  };

  const updateMemberRole = async (communityId, userId, newRole) => {
    try {
      await api.updateCommunityMemberRole(communityId, userId, newRole);
      // Refresh communities to get updated data
      await fetchCommunities();
    } catch (err) {
      console.error('Failed to update member role:', err);
      throw err;
    }
  };

  const value = {
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
  };

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
