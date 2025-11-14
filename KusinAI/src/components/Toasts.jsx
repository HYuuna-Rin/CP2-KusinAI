/*
  File: src/components/Toasts.jsx
  Purpose: Reusable toast/notification component.
  Responsibilities:
  - Display transient messages for success, errors, and info.
  - Integrate with Toast context for global usage.
  Notes: Keep accessible (ARIA roles) and non-blocking.
*/
import React from 'react';

const ToastItem = ({ t }) => {
  const color = t.type === 'error' ? 'bg-red-500' : t.type === 'success' ? 'bg-green-600' : 'bg-gray-800';
  return (
    <div className={`text-white px-4 py-2 rounded shadow ${color} mb-2 animate-slide-up`}>
      {t.message}
    </div>
  );
};

const ConfirmItem = ({ c }) => {
  return (
    <div className="bg-white p-4 rounded shadow w-full max-w-sm border">
      <div className="font-semibold mb-2">{c.title}</div>
      <div className="text-sm mb-3">{c.message}</div>
      <div className="flex justify-end gap-2">
        <button onClick={() => c.onResolve(false)} className="px-3 py-1 bg-gray-200 rounded">{c.cancelText}</button>
        <button onClick={() => c.onResolve(true)} className="px-3 py-1 bg-yellow-500 text-white rounded">{c.confirmText}</button>
      </div>
    </div>
  );
};

const Toasts = ({ toasts = [], confirms = [] }) => {
  return (
    <div>
      <div className="fixed top-6 right-6 z-50 flex flex-col items-end">
        {toasts.map((t) => <ToastItem key={t.id} t={t} />)}
      </div>

      {confirms.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          {confirms.map((c) => (
            <ConfirmItem key={c.id} c={c} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Toasts;
