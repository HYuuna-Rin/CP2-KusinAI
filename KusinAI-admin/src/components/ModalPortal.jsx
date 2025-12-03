import { createPortal } from "react-dom";
import { useEffect } from "react";

export default function ModalPortal({ children }) {
  if (typeof document === "undefined") return null;
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);
  return createPortal(children, document.body);
}

export function ConfirmDialog({ open, title = "Confirm", message, confirmLabel = "Confirm", cancelLabel = "Cancel", onConfirm, onCancel, destructive = false }) {
  if (!open) return null;
  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[3000]">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-3 text-text">{title}</h2>
          <p className="text-sm text-gray-700 mb-5 whitespace-pre-line">{message}</p>
          <div className="flex justify-end gap-3">
            <button onClick={onCancel} className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-text text-sm font-medium">{cancelLabel}</button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 rounded-md text-sm font-medium text-white ${destructive ? 'bg-danger hover:bg-red-700' : 'bg-primary hover:bg-[#449d48]'}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
