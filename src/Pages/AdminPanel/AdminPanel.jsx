import React, { useState, useEffect, useRef } from 'react';
import { Users, Plus, Trash2, Edit2, Crown, User, Shield, Search, X, Calendar, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { useCommunities } from '../../contexts/CommunitiesContext';
import api from '../../lib/api';
import styles from './AdminPanel.module.scss';

function AdminPanel() {
  const { currentAdmin, logout, isAuthenticated, isLoading } = useAdminAuth();
  const { communities, addCommunity, updateCommunity, deleteCommunity, removeMember, updateMemberRole } = useCommunities();
  const navigate = useNavigate();
  
  // Restore active section from API preferences or default to 'communities'
  const [activeSection, setActiveSection] = useState('communities');
  
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [isAddingCommunity, setIsAddingCommunity] = useState(false);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const [newCommunity, setNewCommunity] = useState({
    name: '',
    description: '',
    avatar: '🎯',
    color: '#667eea'
  });

  const [newStudent, setNewStudent] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'student'
  });

  // Check authentication and load data
  useEffect(() => {
    // Wait for auth to finish loading before checking authentication
    if (!isLoading && !isAuthenticated) {
      navigate('/signin');
      return;
    }
    
    // Check if user has ADMIN role - only admins can access this panel
    if (!isLoading && isAuthenticated && currentAdmin) {
      const userRole = (currentAdmin.role || '').toString().toUpperCase();
      if (userRole !== 'ADMIN') {
        console.warn('Access denied: User does not have ADMIN role');
        navigate('/'); // Redirect non-admins to home page
        return;
      }
    }
    
    // Load students and preferences from API
    const fetchData = async () => {
      try {
        // Fetch students
        const studentsData = await api.getStudents();
        const studentsList = studentsData.students || studentsData || [];
        setStudents(Array.isArray(studentsList) ? studentsList : []);

        // Fetch admin preferences
        try {
          const preferences = await api.getAdminPreferences();
          if (preferences && preferences.activeSection) {
            setActiveSection(preferences.activeSection);
          }
        } catch (err) {
          // Preferences might not exist yet, that's okay
          console.log('No preferences found, using defaults');
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };

    if (isAuthenticated && currentAdmin?.role?.toUpperCase() === 'ADMIN') {
      fetchData();
    }
  }, [isAuthenticated, isLoading, navigate, currentAdmin]);

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#ffd16a'];
  const emojis = ['🎯', '🖥️', '🎨', '⚽', '📚', '🎵', '🎮', '🌟', '💡', '🚀'];

  const formatRole = (role) => {
    const r = (role || '').toString().toLowerCase();
    if (!r) return '';
    if (r === 'club_leader' || r === 'clubleader') return 'Club Leader';
    if (r === 'faculty_leader' || r === 'facultyleader') return 'Faculty Leader';
    if (r === 'dean_of_faculty' || r === 'deanoffaculty') return 'Dean of Faculty';
    if (r === 'deanship_of_student_affairs' || r === 'deanshipofstudentaffairs') return 'Deanship of Student Affairs';
    if (r === 'admin') return 'Admin';
    if (r === 'student') return 'Student';
    // Fallback: replace underscores and capitalize
    return r.replace(/_/g, ' ').replace(/(^|\s)\S/g, t => t.toUpperCase());
  };

  // Save active section to database whenever it changes
  const handleSectionChange = async (section) => {
    setActiveSection(section);
    try {
      await api.updateAdminPreferences({ activeSection: section });
    } catch (err) {
      console.error('Failed to save preference:', err);
      // Still update local state even if API call fails
    }
  };

  const handleAddCommunity = async () => {
    if (newCommunity.name && newCommunity.description) {
      try {
        await addCommunity(newCommunity);
        setNewCommunity({ name: '', description: '', avatar: '🎯', color: '#667eea' });
        setIsAddingCommunity(false);
      } catch (err) {
        alert('Failed to add community: ' + err.message);
      }
    }
  };

  const handleDeleteCommunity = async (id) => {
    if (window.confirm('Are you sure you want to delete this community?')) {
      try {
        await deleteCommunity(id);
        setSelectedCommunity(null);
      } catch (err) {
        alert('Failed to delete community: ' + err.message);
      }
    }
  };

  const handleRemoveMember = async (communityId, userId) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      try {
        await removeMember(communityId, userId);
      } catch (err) {
        alert('Failed to remove member: ' + err.message);
      }
    }
  };

  const handleChangeRole = async (communityId, userId, newRole) => {
    try {
      await updateMemberRole(communityId, userId, newRole);
    } catch (err) {
      alert('Failed to update role: ' + err.message);
    }
  };

  const handleAddStudent = async () => {
    if (newStudent.firstName && newStudent.lastName && newStudent.email && newStudent.password) {
      try {
        const roleMapping = {
          'student': 'STUDENT',
          'club_leader': 'CLUB_LEADER',
          'faculty_leader': 'FACULTY_LEADER',
          'dean_of_faculty': 'DEAN_OF_FACULTY',
          'deanship_of_student_affairs': 'DEANSHIP_OF_STUDENT_AFFAIRS',
          'admin': 'ADMIN'
        };

        const studentData = {
          firstName: newStudent.firstName,
          lastName: newStudent.lastName,
          email: newStudent.email,
          password: newStudent.password,
          role: roleMapping[newStudent.role] || 'STUDENT'
        };
        
        const response = await api.createStudent(studentData);
        const newStudentData = response.student || response;
        setStudents(prev => [...prev, newStudentData]);
        
        setNewStudent({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          role: 'student'
        });
        setIsAddingStudent(false);
      } catch (err) {
        alert('Failed to add student: ' + err.message);
      }
    }
  };

  const handleDeleteStudent = async (id) => {
    if (window.confirm('Are you sure you want to delete this student account?')) {
      try {
        await api.deleteStudent(id);
        setStudents(prev => prev.filter(s => s.id !== id));
      } catch (err) {
        alert('Failed to delete student: ' + err.message);
      }
    }
  };

  const handleUpdateStudentRole = async (id, newRole) => {
    try {
      const roleMapping = {
        'student': 'STUDENT',
        'moderator': 'MODERATOR',
        'clubLeader': 'CLUB_LEADER',
        'admin': 'ADMIN'
      };

      // normalize keys (some parts of the app pass values like 'club_leader')
      const key = (newRole || '').toString();
      const normalizedKey = key === 'club_leader' ? 'clubLeader' : key;

      await api.updateStudent(id, { role: roleMapping[normalizedKey] || newRole });
      setStudents(prev => prev.map(s => 
        s.id === id ? { ...s, role: roleMapping[normalizedKey] || newRole } : s
      ));
    } catch (err) {
      alert('Failed to update student role: ' + err.message);
    }
  };

  const filteredCommunities = Array.isArray(communities) ? communities.filter(c =>
    c && c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const filteredStudents = Array.isArray(students) ? students.filter(s => {
    const name = `${s.firstName || ''} ${s.lastName || ''}`.toLowerCase();
    const email = (s.email || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    const roleLower = (s.role || '').toLowerCase();

    const matchesSearch = name.includes(search) || email.includes(search);
    const matchesCategory = selectedCategory === 'all' ? true : roleLower === selectedCategory;

    return matchesSearch && matchesCategory;
  }) : [];

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  // Redirect if not authenticated or not an admin
  if (!isAuthenticated || !currentAdmin) {
    return null;
  }

  // Check admin role - only ADMIN users can access this panel
  const userRole = (currentAdmin.role || '').toString().toUpperCase();
  if (userRole !== 'ADMIN') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem', textAlign: 'center' }}>
        <h2 style={{ color: '#667eea', marginBottom: '1rem' }}>Access Denied</h2>
        <p style={{ marginBottom: '2rem', color: '#666' }}>You need administrator privileges to access this page.</p>
        <button 
          onClick={() => navigate('/')} 
          style={{ 
            padding: '0.75rem 2rem', 
            background: '#667eea', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Go to Home
        </button>
      </div>
    );
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
            onClick={() => handleSectionChange('communities')}
          >
            <Users size={20} />
            <span>Manage Communities</span>
          </button>

          {/* Placeholder for future sections */}
          <button
            className={`${styles.navItem} ${activeSection === 'events' ? styles.active : ''}`}
            onClick={() => {
              handleSectionChange('events');
              navigate('/plan-events');
            }}
          >
            <Calendar size={20} />
            <span>Manage Events</span>
          </button>

          <button
            className={`${styles.navItem} ${activeSection === 'users' ? styles.active : ''}`}
            onClick={() => handleSectionChange('users')}
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
            <h3>{communities.reduce((acc, c) => acc + (c.memberCount || 0), 0)}</h3>
            <p>Total Members</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#43e97b' }}>
            <Crown size={24} />
          </div>
          <div className={styles.statInfo}>
            <h3>{communities.reduce((acc, c) => acc + (c.members?.filter(m => m.role === 'admin').length || 0), 0)}</h3>
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

        {activeSection === 'users' && (
          <>
            <div className={styles.adminHeader}>
              <div>
                <h1>Manage Students</h1>
                <p>Register and manage student accounts with role assignments</p>
              </div>
              <button className={styles.addCommunityBtn} onClick={() => setIsAddingStudent(true)}>
                <Plus size={20} />
                Register Student
              </button>
            </div>

            <div className={styles.adminStats}>
              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: '#667eea' }}>
                  <Users size={24} />
                </div>
                <div className={styles.statInfo}>
                  <h3>{students.length}</h3>
                  <p>Total Students</p>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: '#43e97b' }}>
                  <User size={24} />
                </div>
                <div className={styles.statInfo}>
                    <h3>{students.filter(s => (s.role || '').toLowerCase() === 'student').length}</h3>
                    <p>Regular Students</p>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: '#fa709a' }}>
                  <Shield size={24} />
                </div>
                <div className={styles.statInfo}>
                    <h3>{students.filter(s => (s.role || '').toLowerCase() === 'club_leader').length}</h3>
                    <p>Club Leaders</p>
                </div>
              </div>
            </div>

              {/* Category filter */}
              <div className={styles.roleFilter}>
                {[
                  { key: 'all', label: 'All' },
                  { key: 'student', label: 'Students' },
                  { key: 'club_leader', label: 'Club Leaders' },
                  { key: 'faculty_leader', label: 'Faculty Leaders' },
                  { key: 'dean_of_faculty', label: 'Dean of Faculty' },
                  { key: 'deanship_of_student_affairs', label: 'Deanship of Student Affairs' },
                  { key: 'admin', label: 'Admins' }
                ].map(r => (
                  <button
                    key={r.key}
                    className={`${styles.roleBtn} ${selectedCategory === r.key ? styles.activeRole : ''}`}
                    onClick={() => setSelectedCategory(r.key)}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              <div className={styles.searchBar}>
              <Search className={styles.searchIcon} size={20} />
              <input
                type="text"
                placeholder="Search students by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className={styles.communitiesTable}>
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Registered</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map(student => (
                    <tr key={student.id} onClick={() => setSelectedStudent(student)} className={styles.clickableRow}>
                      <td>
                        <div className={styles.communityCell}>
                          <span className={styles.tableAvatar} style={{ background: '#667eea' }}>
                            {student.firstName[0]}{student.lastName[0]}
                          </span>
                          <div>
                            <strong>{`${student.firstName || ''} ${student.lastName || ''}`.trim()}</strong>
                          </div>
                        </div>
                      </td>
                      <td>{student.email}</td>
                      <td>
                        <span className={styles.roleText}>{formatRole(student.role)}</span>
                      </td>
                      <td>{new Date(student.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button 
                            className={`${styles.actionBtn} ${styles.delete}`}
                            onClick={(e) => { e.stopPropagation(); handleDeleteStudent(student.id); }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredStudents.length === 0 && (
                <div className={styles.emptyState}>
                  <User size={48} />
                  <p>No students registered yet</p>
                  <button className={styles.addCommunityBtn} onClick={() => setIsAddingStudent(true)}>
                    <Plus size={18} />
                    Register First Student
                  </button>
                </div>
              )}
            </div>

            {/* Add Student Modal */}
            {isAddingStudent && (
              <div className={styles.modalOverlay} onClick={() => setIsAddingStudent(false)}>
                <div className={`${styles.modalContent} ${styles.formModal}`} onClick={(e) => e.stopPropagation()}>
                  <h2>Register New Student</h2>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>First Name</label>
                      <input
                        type="text"
                        value={newStudent.firstName}
                        onChange={(e) => setNewStudent({ ...newStudent, firstName: e.target.value })}
                        placeholder="Enter first name"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Last Name</label>
                      <input
                        type="text"
                        value={newStudent.lastName}
                        onChange={(e) => setNewStudent({ ...newStudent, lastName: e.target.value })}
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={newStudent.email}
                      onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                      placeholder="student@univibe.edu"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Password</label>
                    <input
                      type="password"
                      value={newStudent.password}
                      onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                      placeholder="Enter password"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Role</label>
                    <select
                      value={newStudent.role}
                      onChange={(e) => setNewStudent({ ...newStudent, role: e.target.value })}
                      className={styles.roleSelectLarge}
                    >
                      <option value="student">Student</option>
                      <option value="club_leader">Club Leader</option>
                      <option value="faculty_leader">Faculty Leader</option>
                      <option value="dean_of_faculty">Dean of Faculty</option>
                      <option value="deanship_of_student_affairs">Deanship of Student Affairs</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className={styles.formActions}>
                    <button className={styles.cancelBtn} onClick={() => setIsAddingStudent(false)}>
                      Cancel
                    </button>
                    <button className={styles.submitBtn} onClick={handleAddStudent}>
                      Register Student
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* Edit Student Modal */}
            {selectedStudent && (
              <div className={styles.modalOverlay} onClick={() => setSelectedStudent(null)}>
                <div className={`${styles.modalContent} ${styles.formModal}`} onClick={(e) => e.stopPropagation()}>
                  <h2>Edit Student</h2>
                  <EditStudentForm
                    student={selectedStudent}
                    onCancel={() => setSelectedStudent(null)}
                    onSave={async (updates) => {
                      try {
                        await api.updateStudent(selectedStudent.id, updates);
                        setStudents(prev => prev.map(s => s.id === selectedStudent.id ? { ...s, ...updates } : s));
                        setSelectedStudent(null);
                      } catch (err) {
                        alert('Failed to update student: ' + err.message);
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Small form component to edit a student inside the modal
function EditStudentForm({ student, onCancel, onSave }) {
  const [form, setForm] = useState({
    firstName: student.firstName || '',
    lastName: student.lastName || '',
    email: student.email || '',
    role: (student.role || '').toLowerCase() === 'club_leader' ? 'club_leader' : (student.role || '').toLowerCase()
  });

  const handleSubmit = async () => {
    const roleMapping = {
      'student': 'STUDENT',
      'moderator': 'MODERATOR',
      'club_leader': 'CLUB_LEADER',
      'event_organizer': 'EVENT_ORGANIZER',
      'admin': 'ADMIN'
    };

    const updates = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      role: roleMapping[form.role] || form.role
    };

    await onSave(updates);
  };

  return (
    <div>
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label>First Name</label>
          <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
        </div>
        <div className={styles.formGroup}>
          <label>Last Name</label>
          <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
        </div>
      </div>
      <div className={styles.formGroup}>
        <label>Email</label>
        <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </div>
      <div className={styles.formGroup}>
        <label>Role</label>
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={styles.roleSelectLarge}>
          <option value="student">Student</option>
          <option value="club_leader">Club Leader</option>
          <option value="faculty_leader">Faculty Leader</option>
          <option value="dean_of_faculty">Dean of Faculty</option>
          <option value="deanship_of_student_affairs">Deanship of Student Affairs</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div className={styles.formActions}>
        <button className={styles.cancelBtn} onClick={onCancel}>Cancel</button>
        <button className={styles.submitBtn} onClick={handleSubmit}>Save Changes</button>
      </div>
    </div>
  );
}

export default AdminPanel;