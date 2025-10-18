import React, { createContext, useContext, useState, useEffect } from 'react';
import communitiesData from '../data/communities';

const CommunitiesContext = createContext();

export function CommunitiesProvider({ children }) {
  const [communities, setCommunities] = useState([]);

  useEffect(() => {
    // Load communities from localStorage or use default data
    const storedCommunities = localStorage.getItem('communities');
    if (storedCommunities) {
      setCommunities(JSON.parse(storedCommunities));
    } else {
      // Convert getter properties to actual values for storage
      const communitiesWithCounts = communitiesData.map(c => ({
        ...c,
        memberCount: c.members.length
      }));
      setCommunities(communitiesWithCounts);
      localStorage.setItem('communities', JSON.stringify(communitiesWithCounts));
    }
  }, []);

  const addCommunity = (community) => {
    const newCommunity = {
      ...community,
      id: Date.now(),
      members: community.members || [],
      memberCount: community.members?.length || 0
    };
    const updatedCommunities = [...communities, newCommunity];
    setCommunities(updatedCommunities);
    localStorage.setItem('communities', JSON.stringify(updatedCommunities));
  };

  const updateCommunity = (id, updatedData) => {
    const updatedCommunities = communities.map(c => {
      if (c.id === id) {
        const updated = { ...c, ...updatedData };
        // Update memberCount if members array changed
        if (updatedData.members) {
          updated.memberCount = updatedData.members.length;
        }
        return updated;
      }
      return c;
    });
    setCommunities(updatedCommunities);
    localStorage.setItem('communities', JSON.stringify(updatedCommunities));
  };

  const deleteCommunity = (id) => {
    const updatedCommunities = communities.filter(c => c.id !== id);
    setCommunities(updatedCommunities);
    localStorage.setItem('communities', JSON.stringify(updatedCommunities));
  };

  const addMember = (communityId, member) => {
    const updatedCommunities = communities.map(c => {
      if (c.id === communityId) {
        const newMembers = [...c.members, member];
        return { ...c, members: newMembers, memberCount: newMembers.length };
      }
      return c;
    });
    setCommunities(updatedCommunities);
    localStorage.setItem('communities', JSON.stringify(updatedCommunities));
  };

  const removeMember = (communityId, memberId) => {
    const updatedCommunities = communities.map(c => {
      if (c.id === communityId) {
        const newMembers = c.members.filter(m => m.id !== memberId);
        return { ...c, members: newMembers, memberCount: newMembers.length };
      }
      return c;
    });
    setCommunities(updatedCommunities);
    localStorage.setItem('communities', JSON.stringify(updatedCommunities));
  };

  const updateMemberRole = (communityId, memberId, newRole) => {
    const updatedCommunities = communities.map(c => {
      if (c.id === communityId) {
        const newMembers = c.members.map(m =>
          m.id === memberId ? { ...m, role: newRole } : m
        );
        return { ...c, members: newMembers };
      }
      return c;
    });
    setCommunities(updatedCommunities);
    localStorage.setItem('communities', JSON.stringify(updatedCommunities));
  };

  const value = {
    communities,
    addCommunity,
    updateCommunity,
    deleteCommunity,
    addMember,
    removeMember,
    updateMemberRole
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
