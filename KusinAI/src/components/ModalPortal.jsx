import { createPortal } from "react-dom";
import { useEffect } from "react";

export default function ModalPortal({ children }) {
  if (typeof document === "undefined") return null;
  // lock scroll while any modal is mounted
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);
  return createPortal(children, document.body);
}
