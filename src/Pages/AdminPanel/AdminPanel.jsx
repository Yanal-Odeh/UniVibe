import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Edit2, Crown, User, Shield, Search, X, Calendar, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { useCommunities } from '../../contexts/CommunitiesContext';
import styles from './AdminPanel.module.scss';

function AdminPanel() {
  const { currentAdmin, logout, isAuthenticated } = useAdminAuth();
  const { communities, addCommunity, updateCommunity, deleteCommunity, removeMember, updateMemberRole } = useCommunities();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('communities');
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [isAddingCommunity, setIsAddingCommunity] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [newCommunity, setNewCommunity] = useState({
    name: '',
    description: '',
    avatar: '🎯',
    color: '#667eea'
  });

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#ffd16a'];
  const emojis = ['🎯', '🖥️', '🎨', '⚽', '📚', '🎵', '🎮', '🌟', '💡', '🚀'];

  const handleAddCommunity = () => {
    if (newCommunity.name && newCommunity.description) {
      addCommunity(newCommunity);
      setNewCommunity({ name: '', description: '', avatar: '🎯', color: '#667eea' });
      setIsAddingCommunity(false);
    }
  };

  const handleDeleteCommunity = (id) => {
    if (window.confirm('Are you sure you want to delete this community?')) {
      deleteCommunity(id);
      setSelectedCommunity(null);
    }
  };

  const handleRemoveMember = (communityId, memberId) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      removeMember(communityId, memberId);
    }
  };

  const handleChangeRole = (communityId, memberId, newRole) => {
    updateMemberRole(communityId, memberId, newRole);
  };

  const filteredCommunities = communities.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAuthenticated || !currentAdmin) {
    return null;
  }

  return (
    <div className={styles.adminPanel}>
      {/* Sidebar Navigation */}
      <aside className={styles.sidebar}>
        <h2 className={styles.sidebarTitle}>Admin Panel</h2>
        
        {/* Admin Info */}
        <div className={styles.adminInfo}>
          <div className={styles.adminAvatar}>
            {currentAdmin.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className={styles.adminDetails}>
            <h3>{currentAdmin.name}</h3>
            <p>{currentAdmin.role}</p>
          </div>
        </div>

        <nav className={styles.sidebarNav}>
          <button
            className={`${styles.navItem} ${activeSection === 'communities' ? styles.active : ''}`}
            onClick={() => setActiveSection('communities')}
          >
            <Users size={20} />
            <span>Manage Communities</span>
          </button>
          {/* Placeholder for future sections */}
          <button
            className={`${styles.navItem} ${styles.disabled}`}
            disabled
          >
            <Calendar size={20} />
            <span>Manage Events</span>
          </button>
          <button
            className={`${styles.navItem} ${styles.disabled}`}
            disabled
          >
            <User size={20} />
            <span>Manage Users</span>
          </button>
          <button
            className={`${styles.navItem} ${styles.disabled}`}
            disabled
          >
            <Settings size={20} />
            <span>Settings</span>
          </button>
        </nav>

        {/* Logout Button */}
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <div className={styles.mainContent}>
        {activeSection === 'communities' && (
          <>
            <div className={styles.adminHeader}>
              <div>
                <h1>Manage Communities</h1>
                <p>Create, edit, and manage all university communities</p>
              </div>
              <button className={styles.addCommunityBtn} onClick={() => setIsAddingCommunity(true)}>
                <Plus size={20} />
                New Community
              </button>
            </div>

      <div className={styles.adminStats}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#667eea' }}>
            <Users size={24} />
          </div>
          <div className={styles.statInfo}>
            <h3>{communities.length}</h3>
            <p>Total Communities</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#4facfe' }}>
            <User size={24} />
          </div>
          <div className={styles.statInfo}>
            <h3>{communities.reduce((acc, c) => acc + c.memberCount, 0)}</h3>
            <p>Total Members</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#43e97b' }}>
            <Crown size={24} />
          </div>
          <div className={styles.statInfo}>
            <h3>{communities.reduce((acc, c) => acc + c.members.filter(m => m.role === 'admin').length, 0)}</h3>
            <p>Community Admins</p>
          </div>
        </div>
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

      <div className={styles.communitiesTable}>
        <table>
          <thead>
            <tr>
              <th>Community</th>
              <th>Members</th>
              <th>Admins</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCommunities.map(community => (
              <tr key={community.id}>
                <td>
                  <div className={styles.communityCell}>
                    <span className={styles.tableAvatar} style={{ background: community.color }}>
                      {community.avatar}
                    </span>
                    <div>
                      <strong>{community.name}</strong>
                      <p>{community.description}</p>
                    </div>
                  </div>
                </td>
                <td>{community.memberCount}</td>
                <td>{community.members.filter(m => m.role === 'admin').length}</td>
                <td>
                  <div className={styles.actionButtons}>
                    <button 
                      className={`${styles.actionBtn} ${styles.view}`}
                      onClick={() => setSelectedCommunity(community)}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      className={`${styles.actionBtn} ${styles.delete}`}
                      onClick={() => handleDeleteCommunity(community.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Community Modal */}
      {isAddingCommunity && (
        <div className={styles.modalOverlay} onClick={() => setIsAddingCommunity(false)}>
          <div className={`${styles.modalContent} ${styles.formModal}`} onClick={(e) => e.stopPropagation()}>
            <h2>Create New Community</h2>
            <div className={styles.formGroup}>
              <label>Community Name</label>
              <input
                type="text"
                value={newCommunity.name}
                onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
                placeholder="Enter community name"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Description</label>
              <textarea
                value={newCommunity.description}
                onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
                placeholder="Enter community description"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Avatar</label>
              <div className={styles.emojiSelector}>
                {emojis.map(emoji => (
                  <button
                    key={emoji}
                    className={`${styles.emojiBtn} ${newCommunity.avatar === emoji ? styles.active : ''}`}
                    onClick={() => setNewCommunity({ ...newCommunity, avatar: emoji })}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.formGroup}>
              <label>Color Theme</label>
              <div className={styles.colorSelector}>
                {colors.map(color => (
                  <button
                    key={color}
                    className={`${styles.colorBtn} ${newCommunity.color === color ? styles.active : ''}`}
                    style={{ background: color }}
                    onClick={() => setNewCommunity({ ...newCommunity, color })}
                  />
                ))}
              </div>
            </div>
            <div className={styles.formActions}>
              <button className={styles.cancelBtn} onClick={() => setIsAddingCommunity(false)}>
                Cancel
              </button>
              <button className={styles.submitBtn} onClick={handleAddCommunity}>
                Create Community
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Community Modal */}
      {selectedCommunity && (
        <div className={styles.modalOverlay} onClick={() => setSelectedCommunity(null)}>
          <div className={`${styles.modalContent} ${styles.wideModal}`} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setSelectedCommunity(null)}>
              <X size={24} />
            </button>
            <div className={styles.modalHeader} style={{ background: selectedCommunity.color }}>
              <span className={styles.modalAvatar}>{selectedCommunity.avatar}</span>
              <h2>{selectedCommunity.name}</h2>
            </div>
            <div className={styles.modalBody}>
              <h3>Members ({selectedCommunity.members.length})</h3>
              <div className={styles.membersTable}>
                {selectedCommunity.members.map(member => (
                  <div key={member.id} className={styles.memberRow}>
                    <div className={styles.memberInfo}>
                      <div className={styles.memberAvatar}>{member.name[0]}</div>
                      <div>
                        <h4>{member.name}</h4>
                        <span className={styles.memberEmail}>{member.email}</span>
                        <span className={styles.memberDate}>Joined {member.joinDate}</span>
                      </div>
                    </div>
                    <div className={styles.memberActions}>
                      <select
                        value={member.role}
                        onChange={(e) => handleChangeRole(selectedCommunity.id, member.id, e.target.value)}
                        className={styles.roleSelect}
                      >
                        <option value="member">Member</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button
                        className={styles.removeBtn}
                        onClick={() => handleRemoveMember(selectedCommunity.id, member.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
          </>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;