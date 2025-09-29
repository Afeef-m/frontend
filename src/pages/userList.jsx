import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './userList.css';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (status = '') => {
    try {
      const token = localStorage.getItem('token');
      const companyId = localStorage.getItem('company_id');

      if (!token || !companyId) {
        navigate('/login');
        return;
      }

      let url = 'http://127.0.0.1:8000/api/user';
      if (status !== '') {
        url += `?status=${status}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'company_id': companyId
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status && data.data) {
          setUsers(data.data);
        }
      } else if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setMessage('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search and status
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.first_name} ${user.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === '' || 
      (statusFilter === 'active' && user.status) ||
      (statusFilter === 'inactive' && !user.status);
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const companyId = localStorage.getItem('company_id');

      const response = await fetch(`http://127.0.0.1:8000/api/user/${userId}/status`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'company_id': companyId
        },
        body: JSON.stringify({
          status: currentStatus ? 0 : 1
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status) {
          setMessage('Status updated successfully');
          // Update local state
          setUsers(users.map(user => 
            user.id === userId ? { ...user, status: !currentStatus } : user
          ));
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setMessage('Failed to update status');
    }
  };

  const handleEdit = (userId) => {
    navigate(`/user/edit/${userId}`);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      const token = localStorage.getItem('token');
      const companyId = localStorage.getItem('company_id');

      const response = await fetch(`http://127.0.0.1:8000/api/user/${userToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'company_id': companyId
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status) {
          setMessage('User deleted successfully');
          // Remove user from local state
          setUsers(users.filter(user => user.id !== userToDelete.id));
        }
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setMessage('Failed to delete user');
    } finally {
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const handleAddUser = () => {
    navigate('/user/add');
  };

  // Clear message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (loading) {
    return (
      <div className="user-list-container">
        <div className="loading">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="user-list-container">
      <div className="user-list-header">
        <h1>Users</h1>
        <button className="add-user-btn" onClick={handleAddUser}>
          + Add User
        </button>
      </div>

      {message && (
        <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="filters-container">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="status-filter">
          <select value={statusFilter} onChange={handleStatusFilter}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Name</th>
              <th>Email</th>
              <th>Initials</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Status</th>
              <th>Title</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.length > 0 ? (
              currentUsers.map((user, index) => (
                <tr key={user.id}>
                  <td>{indexOfFirstUser + index + 1}</td>
                  <td>
                    <div className="user-name">
                      {user.profile_image_url && (
                        <img 
                          src={user.profile_image_url} 
                          alt={user.first_name}
                          className="user-avatar"
                        />
                      )}
                      {user.first_name} {user.last_name || ''}
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.initials || 'N/A'}</td>
                  <td>{user.phone || 'N/A'}</td>
                  <td>
                    <span className={`role-badge role-${user.role?.title?.toLowerCase().replace(' ', '-')}`}>
                      {user.role?.title || 'No Role'}
                    </span>
                  </td>
                  <td>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={user.status}
                        onChange={() => handleStatusToggle(user.id, user.status)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </td>
                  <td>{user.title || 'N/A'}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="edit-btn"
                        onClick={() => handleEdit(user.id)}
                        title="Edit User"
                      >
                        ✏️
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteClick(user)}
                        title="Delete User"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="no-data">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={currentPage === page ? 'active' : ''}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Delete</h3>
            <p>
              Are you sure you want to delete user{" "}
              <strong>{userToDelete.first_name} {userToDelete.last_name || ''}</strong>?
              This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={handleDeleteCancel}>
                Cancel
              </button>
              <button className="confirm-delete-btn" onClick={handleDeleteConfirm}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;