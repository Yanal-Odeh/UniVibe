import React, { useState } from 'react';
import { Users, Search, X, Crown, Shield } from 'lucide-react';
import { useCommunities } from '../../contexts/CommunitiesContext';
import styles from './Communities.module.scss';

function Communities() {
  const { communities, loading, error } = useCommunities();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState(null);

  const filteredCommunities = communities.filter(comm =>
    comm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comm.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className={styles.communitiesView}>
        <div className={styles.communitiesHeader}>
          <h1>Our Communities</h1>
          <p>Loading communities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.communitiesView}>
        <div className={styles.communitiesHeader}>
          <h1>Our Communities</h1>
          <p style={{ color: 'red' }}>Error loading communities: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.communitiesView}>
      <div className={styles.communitiesHeader}>
        <h1>Our Communities</h1>
        <p>Join vibrant communities and connect with like-minded students</p>
      </div>

      <div className={styles.searchBar}>
        <Search className={styles.searchIcon} size={20} />
        <input
          type="text"
          placeholder="Search communities..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className={styles.communitiesGrid}>
        {filteredCommunities.map(community => (
          <div 
            key={community.id} 
            className={styles.communityCard}
            onClick={() => setSelectedCommunity(community)}
          >
            <div className={styles.cardHeader} style={{ background: community.color }}>
              <span className={styles.avatar}>{community.avatar}</span>
            </div>
            <div className={styles.cardBody}>
              <h3>{community.name}</h3>
              <p>{community.description}</p>
              
              {/* Display club leaders */}
              {community.members.filter(m => m.role === 'club_leader' || m.role === 'admin').length > 0 && (
                <div className={styles.keyMembers}>
                  <h4 className={styles.keyMembersTitle}>Community Leaders</h4>
                  <div className={styles.keyMembersList}>
                    {community.members
                      .filter(m => m.role === 'club_leader' || m.role === 'admin')
                      .slice(0, 3)
                      .map(member => (
                        <div key={member.id} className={styles.keyMemberBadge}>
                          <div className={styles.keyMemberAvatar}>
                            {member.name[0]}
                          </div>
                          <div className={styles.keyMemberInfo}>
                            <span className={styles.keyMemberName}>{member.name}</span>
                            <span className={`${styles.keyMemberRole} ${styles[member.role]}`}>
                              <Crown size={12} />
                              {member.role === 'club_leader' ? 'Leader' : member.role}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
              
              <div className={styles.cardFooter}>
                <div className={styles.memberCount}>
                  <Users size={16} />
                  <span>{community.memberCount} members</span>
                </div>
                <button className={styles.joinBtn} onClick={(e) => {
                  e.stopPropagation();
                  alert('Join functionality coming soon!');
                }}>
                  Join
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedCommunity && (
        <div className={styles.modalOverlay} onClick={() => setSelectedCommunity(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setSelectedCommunity(null)}>
              <X size={24} />
            </button>
            <div className={styles.modalHeader} style={{ background: selectedCommunity.color }}>
              <span className={styles.modalAvatar}>{selectedCommunity.avatar}</span>
              <h2>{selectedCommunity.name}</h2>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.modalDescription}>{selectedCommunity.description}</p>
              
              {/* Community Leaders Section */}
              {selectedCommunity.members.filter(m => m.role === 'club_leader' || m.role === 'admin').length > 0 && (
                <div className={styles.membersSection}>
                  <h3>
                    <Crown size={20} />
                    Community Leaders
                  </h3>
                  <div className={styles.membersList}>
                    {selectedCommunity.members.filter(m => m.role === 'club_leader' || m.role === 'admin').map(member => (
                      <div key={member.id} className={styles.memberItem}>
                        <div className={styles.memberInfo}>
                          <div className={styles.memberAvatar}>{member.name[0]}</div>
                          <div>
                            <h4>{member.name}</h4>
                            <span className={styles.memberEmail}>{member.email}</span>
                          </div>
                        </div>
                        <span className={`${styles.roleBadge} ${styles[member.role]}`}>
                          <Crown size={14} />
                          {member.role === 'club_leader' ? 'Leader' : member.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All Members Section - Including moderators and regular members */}
              <div className={styles.membersSection}>
                <h3>
                  <Users size={20} />
                  All Members ({selectedCommunity.members.filter(m => m.role !== 'club_leader' && m.role !== 'admin').length})
                </h3>
                <div className={styles.membersList}>
                  {selectedCommunity.members.filter(m => m.role !== 'club_leader' && m.role !== 'admin').map(member => (
                    <div key={member.id} className={styles.memberItem}>
                      <div className={styles.memberInfo}>
                        <div className={styles.memberAvatar}>{member.name[0]}</div>
                        <div>
                          <h4>{member.name}</h4>
                          <span className={styles.memberEmail}>{member.email}</span>
                        </div>
                      </div>
                      <span className={`${styles.roleBadge} ${styles[member.role]}`}>
                        {member.role === 'moderator' ? <Shield size={14} /> : <Users size={14} />}
                        {member.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Communities;