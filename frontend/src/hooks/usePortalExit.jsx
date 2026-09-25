import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PortalExitConfirmModal } from '../components/common/PortalExitConfirmModal';

export const usePortalExit = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handlePortalExit = useCallback((e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!user) {
      // Unauthenticated users just go to home
      navigate('/');
      return;
    }
    setIsOpen(true);
    setError(null);
  }, [user, navigate]);

  const onCancel = useCallback(() => {
    setIsOpen(false);
    setLoading(false);
    setError(null);
  }, []);

  const onConfirm = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await logout();
      setIsOpen(false);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to sign out. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [logout, navigate]);

  const Modal = useCallback(() => (
    <PortalExitConfirmModal
      isOpen={isOpen}
      onCancel={onCancel}
      onConfirm={onConfirm}
      loading={loading}
      error={error}
    />
  ), [isOpen, onCancel, onConfirm, loading, error]);

  return { handlePortalExit, Modal };
};
