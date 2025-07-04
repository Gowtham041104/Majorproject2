import React, { useEffect } from "react";
import { Alert } from "react-bootstrap";

function Message({ variant, children, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof onClose === "function") {
        onClose();
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <Alert
      variant={variant}
      dismissible={!!onClose}
      onClose={typeof onClose === "function" ? onClose : undefined}
    >
      {children}
    </Alert>
  );
}

export default Message;
