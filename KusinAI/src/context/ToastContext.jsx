import React, { createContext, useContext, useState, useCallback } from 'react';
import Toasts from '../components/Toasts';

const ToastContext = createContext(null);

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [confirms, setConfirms] = useState([]);

  const showToast = useCallback(({ message, type = 'info', duration = 4000 }) => {
    const id = Date.now() + Math.random();
    setToasts((s) => [...s, { id, message, type }]);
    setTimeout(() => setToasts((s) => s.filter(t => t.id !== id)), duration);
  }, []);

  const showConfirm = useCallback(({ title = 'Confirm', message = 'Are you sure?', confirmText = 'Yes', cancelText = 'Cancel', duration = 0 }) => {
    // returns a promise that resolves to true/false
    return new Promise((resolve) => {
      const id = Date.now() + Math.random();
      const onResolve = (val) => {
        setConfirms((c) => c.filter(x => x.id !== id));
        resolve(val);
      };
      setConfirms((c) => [...c, { id, title, message, confirmText, cancelText, onResolve }]);
      if (duration > 0) setTimeout(() => onResolve(false), duration);
    });
  }, []);

  const value = {
    showToast,
    showConfirm,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toasts toasts={toasts} confirms={confirms} />
    </ToastContext.Provider>
  );
};

export default ToastContext;
