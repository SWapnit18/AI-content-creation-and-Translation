import React, { useState, useEffect } from 'react';
import { 
  Users, MessageSquare, Cpu, ShieldCheck, Search, Trash2, 
  UserCheck, UserX, RefreshCw, BarChart2, Calendar, Mail, 
  ChevronLeft, ChevronRight, AlertTriangle
} from 'lucide-react';
import { 
  getAdminStats, getAdminUsers, updateUserRole, deleteUser, 
  getAdminContacts, deleteContact 
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'users', 'contacts'

  // Overview Stats
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Users State
  const [usersList, setUsersList] = useState([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [usersSearch, setUsersSearch] = useState('');
  const [usersLoading, setUsersLoading] = useState(false);

  // Contacts State
  const [contactsList, setContactsList] = useState([]);
  const [contactsPage, setContactsPage] = useState(1);
  const [contactsTotalPages, setContactsTotalPages] = useState(1);
  const [contactsSearch, setContactsSearch] = useState('');
  const [contactsLoading, setContactsLoading] = useState(false);

  // Modal confirm action
  const [confirmModal, setConfirmModal] = useState(null); // { type: 'deleteUser'|'deleteContact'|'changeRole', targetId, name, newRole }

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
  }, [activeTab, usersPage, usersSearch]);

  useEffect(() => {
    if (activeTab === 'contacts') fetchContacts();
  }, [activeTab, contactsPage, contactsSearch]);

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const res = await getAdminStats();
      if (res.success) {
        setStats(res.stats);
      }
    } catch (err) {
      toast.error('Failed to load admin stats: ' + err.message);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await getAdminUsers({ page: usersPage, limit: 8, search: usersSearch });
      if (res.success) {
        setUsersList(res.users);
        setUsersTotalPages(res.pagination.pages || 1);
      }
    } catch (err) {
      toast.error('Failed to load users: ' + err.message);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchContacts = async () => {
    setContactsLoading(true);
    try {
      const res = await getAdminContacts({ page: contactsPage, limit: 8, search: contactsSearch });
      if (res.success) {
        setContactsList(res.contacts);
        setContactsTotalPages(res.pagination.pages || 1);
      }
    } catch (err) {
      toast.error('Failed to load contacts: ' + err.message);
    } finally {
      setContactsLoading(false);
    }
  };

  const handleRoleToggle = async (userId, currentRole) => {
    const targetRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const res = await updateUserRole(userId, targetRole);
      if (res.success) {
        toast.success(res.message);
        fetchUsers();
        fetchStats();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update role');
    } finally {
      setConfirmModal(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const res = await deleteUser(userId);
      if (res.success) {
        toast.success(res.message);
        fetchUsers();
        fetchStats();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete user');
    } finally {
      setConfirmModal(null);
    }
  };

  const handleDeleteContact = async (contactId) => {
    try {
      const res = await deleteContact(contactId);
      if (res.success) {
        toast.success(res.message);
        fetchContacts();
        fetchStats();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete message');
    } finally {
      setConfirmModal(null);
    }
  };

  return (
    <div style={{ padding: '2.5rem 0', minHeight: '80vh' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(124, 58, 237, 0.12) 100%)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: '2rem 2.5rem',
        marginBottom: '2.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)', padding: '4px 12px', borderRadius: 20, fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem' }}>
            <ShieldCheck size={16} /> Admin Portal
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>
            System Administration
          </h1>
          <p style={{ color: 'var(--text-body)', margin: '0.4rem 0 0 0', fontSize: '0.95rem' }}>
            Manage registered users, inspect client contact messages, and monitor platform performance.
          </p>
        </div>

        <button
          onClick={fetchStats}
          disabled={statsLoading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: 10,
            border: '1px solid var(--border)',
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-heading)',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          <RefreshCw size={16} className={statsLoading ? 'spin' : ''} />
          Refresh Stats
        </button>
      </div>

      {/* Admin Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
        <button
          onClick={() => setActiveTab('overview')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: 10,
            border: 'none',
            backgroundColor: activeTab === 'overview' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'overview' ? '#fff' : 'var(--text-body)',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.95rem',
            transition: 'all 0.2s',
          }}
        >
          <BarChart2 size={18} /> Overview & Analytics
        </button>

        <button
          onClick={() => setActiveTab('users')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: 10,
            border: 'none',
            backgroundColor: activeTab === 'users' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'users' ? '#fff' : 'var(--text-body)',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.95rem',
            transition: 'all 0.2s',
          }}
        >
          <Users size={18} /> User Accounts
        </button>

        <button
          onClick={() => setActiveTab('contacts')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: 10,
            border: 'none',
            backgroundColor: activeTab === 'contacts' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'contacts' ? '#fff' : 'var(--text-body)',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.95rem',
            transition: 'all 0.2s',
          }}
        >
          <MessageSquare size={18} /> Contact Submissions
        </button>
      </div>

      {/* ─── TAB 1: OVERVIEW & ANALYTICS ─── */}
      {activeTab === 'overview' && (
        <>
          {/* Top Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-body)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Registered Users</span>
                <div style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={20} />
                </div>
              </div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                {statsLoading ? '...' : stats?.totalUsers || 0}
              </div>
              <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-body)' }}>Total platform accounts</p>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-body)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Generations</span>
                <div style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Cpu size={20} />
                </div>
              </div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                {statsLoading ? '...' : stats?.totalGenerations || 0}
              </div>
              <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-body)' }}>Translations & creative copies</p>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-body)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact Inquiries</span>
                <div style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageSquare size={20} />
                </div>
              </div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                {statsLoading ? '...' : stats?.totalContacts || 0}
              </div>
              <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-body)' }}>Feedback & support entries</p>
            </div>
          </div>

          {/* Detailed Breakdown & Recent Activity */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
            {/* AI Generation Breakdown */}
            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '1.25rem' }}>
                AI Generation Breakdown
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {Object.entries(stats?.typeBreakdown || {}).map(([type, count]) => {
                  const total = stats?.totalGenerations || 1;
                  const pct = Math.round((count / total) * 100);
                  const colors = {
                    translation: '#6366f1',
                    creative: '#ec4899',
                    improve: '#10b981',
                    quote: '#f59e0b',
                  };
                  const color = colors[type] || 'var(--primary)';
                  return (
                    <div key={type}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '6px', color: 'var(--text-heading)' }}>
                        <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{type}</span>
                        <span style={{ color: 'var(--text-body)' }}>{count} ({pct}%)</span>
                      </div>
                      <div style={{ width: '100%', height: 8, backgroundColor: 'var(--bg-alt)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: color, transition: 'width 0.4s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Registered Users */}
            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '1.25rem' }}>
                Recent User Registrations
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {stats?.recentUsers?.map(u => (
                  <div key={u._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 10, backgroundColor: 'var(--bg-alt)' }}>
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-heading)' }}>{u.name}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-body)' }}>{u.email}</div>
                    </div>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: 12,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: u.role === 'admin' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.06)',
                      color: u.role === 'admin' ? 'var(--primary)' : 'var(--text-body)',
                    }}>
                      {u.role.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ─── TAB 2: USER MANAGEMENT ─── */}
      {activeTab === 'users' && (
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>
              Registered User Accounts
            </h3>
            {/* Search Bar */}
            <div style={{ position: 'relative', width: 280 }}>
              <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-body)' }} />
              <input
                type="text"
                placeholder="Search user name or email..."
                value={usersSearch}
                onChange={e => { setUsersSearch(e.target.value); setUsersPage(1); }}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 38px',
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--bg-alt)',
                  color: 'var(--text-heading)',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Users Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-body)', fontSize: '0.85rem' }}>
                  <th style={{ padding: '12px 16px' }}>User Details</th>
                  <th style={{ padding: '12px 16px' }}>Role</th>
                  <th style={{ padding: '12px 16px' }}>Joined Date</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersLoading ? (
                  <tr>
                    <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-body)' }}>Loading users list...</td>
                  </tr>
                ) : usersList.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-body)' }}>No users found matching filter.</td>
                  </tr>
                ) : (
                  usersList.map(u => (
                    <tr key={u._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{u.name}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-body)' }}>{u.email}</div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 10px',
                          borderRadius: 20,
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: u.role === 'admin' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                          color: u.role === 'admin' ? 'var(--primary)' : 'var(--text-body)',
                          border: u.role === 'admin' ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid var(--border)'
                        }}>
                          {u.role === 'admin' && <ShieldCheck size={13} />}
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-body)', fontSize: '0.85rem' }}>
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          {/* Role Toggle Button */}
                          <button
                            title={u.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                            onClick={() => setConfirmModal({
                              type: 'changeRole',
                              targetId: u._id,
                              name: u.name,
                              newRole: u.role === 'admin' ? 'user' : 'admin'
                            })}
                            disabled={u._id === user?.id}
                            style={{
                              padding: '6px 12px',
                              borderRadius: 8,
                              border: '1px solid var(--border)',
                              backgroundColor: 'var(--bg-alt)',
                              color: u.role === 'admin' ? '#f59e0b' : '#10b981',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              cursor: u._id === user?.id ? 'not-allowed' : 'pointer',
                              opacity: u._id === user?.id ? 0.5 : 1,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            {u.role === 'admin' ? <UserX size={14} /> : <UserCheck size={14} />}
                            {u.role === 'admin' ? 'Demote' : 'Promote'}
                          </button>

                          {/* Delete Button */}
                          <button
                            title="Delete User"
                            onClick={() => setConfirmModal({
                              type: 'deleteUser',
                              targetId: u._id,
                              name: u.name
                            })}
                            disabled={u._id === user?.id}
                            style={{
                              padding: '6px 10px',
                              borderRadius: 8,
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              backgroundColor: 'rgba(239, 68, 68, 0.1)',
                              color: '#ef4444',
                              cursor: u._id === user?.id ? 'not-allowed' : 'pointer',
                              opacity: u._id === user?.id ? 0.5 : 1,
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {usersTotalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                disabled={usersPage === 1}
                onClick={() => setUsersPage(p => p - 1)}
                style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)', backgroundColor: 'var(--bg-alt)', color: 'var(--text-heading)', cursor: usersPage === 1 ? 'not-allowed' : 'pointer' }}
              >
                <ChevronLeft size={16} />
              </button>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-body)' }}>Page {usersPage} of {usersTotalPages}</span>
              <button
                disabled={usersPage === usersTotalPages}
                onClick={() => setUsersPage(p => p + 1)}
                style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)', backgroundColor: 'var(--bg-alt)', color: 'var(--text-heading)', cursor: usersPage === usersTotalPages ? 'not-allowed' : 'pointer' }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 3: CONTACT SUBMISSIONS ─── */}
      {activeTab === 'contacts' && (
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>
              Submitted Contact Messages
            </h3>
            {/* Search Bar */}
            <div style={{ position: 'relative', width: 280 }}>
              <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-body)' }} />
              <input
                type="text"
                placeholder="Search contact entries..."
                value={contactsSearch}
                onChange={e => { setContactsSearch(e.target.value); setContactsPage(1); }}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 38px',
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--bg-alt)',
                  color: 'var(--text-heading)',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Contacts List */}
          {contactsLoading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-body)' }}>Loading messages...</div>
          ) : contactsList.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-body)' }}>No contact submissions found.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {contactsList.map(c => (
                <div key={c._id} style={{ backgroundColor: 'var(--bg-alt)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-heading)' }}>
                        {c.subject || 'General Inquiry'}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-body)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span><strong>From:</strong> {c.name} ({c.email})</span>
                        <span>•</span>
                        <span><Calendar size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />{new Date(c.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setConfirmModal({ type: 'deleteContact', targetId: c._id, name: c.subject || c.name })}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 8,
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-heading)', backgroundColor: 'var(--bg-card)', padding: '1rem', borderRadius: 8, border: '1px solid var(--border)', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                    {c.message}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {contactsTotalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                disabled={contactsPage === 1}
                onClick={() => setContactsPage(p => p - 1)}
                style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)', backgroundColor: 'var(--bg-alt)', color: 'var(--text-heading)', cursor: contactsPage === 1 ? 'not-allowed' : 'pointer' }}
              >
                <ChevronLeft size={16} />
              </button>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-body)' }}>Page {contactsPage} of {contactsTotalPages}</span>
              <button
                disabled={contactsPage === contactsTotalPages}
                onClick={() => setContactsPage(p => p + 1)}
                style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)', backgroundColor: 'var(--bg-alt)', color: 'var(--text-heading)', cursor: contactsPage === contactsTotalPages ? 'not-allowed' : 'pointer' }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(5, 8, 16, 0.8)', backdropFilter: 'blur(8px)',
          zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem'
        }}>
          <div style={{
            width: '100%', maxWidth: 420, backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)', borderRadius: 16, padding: '2rem', textAlign: 'center'
          }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
              <AlertTriangle size={24} />
            </div>
            <h3 style={{ color: 'var(--text-heading)', marginBottom: '0.5rem', fontWeight: 700 }}>Confirm Admin Action</h3>
            <p style={{ color: 'var(--text-body)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              {confirmModal.type === 'deleteUser' && `Are you sure you want to delete the user account for "${confirmModal.name}"? This action cannot be undone.`}
              {confirmModal.type === 'deleteContact' && `Are you sure you want to delete this contact message ("${confirmModal.name}")?`}
              {confirmModal.type === 'changeRole' && `Are you sure you want to change "${confirmModal.name}" role to ${confirmModal.newRole.toUpperCase()}?`}
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setConfirmModal(null)}
                style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid var(--border)', backgroundColor: 'transparent', color: 'var(--text-heading)', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmModal.type === 'deleteUser') handleDeleteUser(confirmModal.targetId);
                  if (confirmModal.type === 'deleteContact') handleDeleteContact(confirmModal.targetId);
                  if (confirmModal.type === 'changeRole') handleRoleToggle(confirmModal.targetId, confirmModal.newRole === 'admin' ? 'user' : 'admin');
                }}
                style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', backgroundColor: '#ef4444', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
