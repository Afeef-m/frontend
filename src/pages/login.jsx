import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    ip_address: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const getIPAddress = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        setFormData(prev => ({ ...prev, ip_address: data.ip }));
      } catch (error) {
        console.log('Could not fetch IP address');
        setFormData(prev => ({ ...prev, ip_address: '127.0.0.1' }));
      }
    };
    
    getIPAddress();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    if (error) {
      setError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('https://127.0.0.1:8000/api/login', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: createFormData(formData)
      });

      const data = await response.json();

      if (response.ok) {
        handleLoginSuccess(data);
      } else {
        // Handle API errors
        handleLoginError(data);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const createFormData = (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key]) {
        formData.append(key, data[key]);
      }
    });
    return formData;
  };

  const handleLoginSuccess = (data) => {
    if (data.otp || data.isExpired) {
      localStorage.setItem('temp_user_id', data.user_id);
      localStorage.setItem('user_email', data.email);
      navigate('/verify-otp');
      return;
    }

    if (data.access_token) {
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('user', JSON.stringify(data));
      
      if (data.companies && Array.isArray(data.companies) && data.companies.length > 1) {
        navigate('/select-company');
      } else {
        const companyId = data.companies?.id || (Array.isArray(data.companies) ? data.companies[0]?.id : null);
        if (companyId) {
          localStorage.setItem('company_id', companyId);
        }
        
        navigate('/userList');
      }
    }
  };

  const handleLoginError = (data) => {
    if (data.errors) {
      // Validation errors from API
      const apiErrors = {};
      Object.keys(data.errors).forEach(key => {
        apiErrors[key] = data.errors[key][0];
      });
      setErrors(apiErrors);
    } else if (data.message) {
      setError(data.message);
    }
  };

  const isFormValid = formData.email.trim() && formData.password;

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Welcome Back</h1>
          <p>Please sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message general-error">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              placeholder="Enter your email"
              disabled={isLoading}
            />
            {errors.email && (
              <span className="error-text">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              placeholder="Enter your password"
              disabled={isLoading}
            />
            {errors.password && (
              <span className="error-text">{errors.password}</span>
            )}
          </div>

          <button
            type="submit"
            className={`login-button ${!isFormValid || isLoading ? 'disabled' : ''}`}
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? (
              <>
                <div className="spinner"></div>
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;