import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FaExclamationTriangle } from 'react-icons/fa';

/**
 * Reusable Confirmation Dialog Component
 * @param {Object} props
 * @param {boolean} props.show - Whether dialog is visible
 * @param {string} props.title - Dialog title
 * @param {string} props.message - Dialog message/body
 * @param {string} props.confirmText - Confirm button text (default: 'Delete')
 * @param {string} props.cancelText - Cancel button text (default: 'Cancel')
 * @param {string} props.variant - Danger/warning/info (default: 'danger')
 * @param {function} props.onConfirm - Callback when user confirms
 * @param {function} props.onCancel - Callback when user cancels
 */
const ConfirmDialog = ({
  show,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel
}) => {
  return (
    <Modal show={show} onHide={onCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center gap-2">
          <FaExclamationTriangle className={`text-${variant}`} />
          {title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{message}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onCancel} className="rounded-pill">
          {cancelText}
        </Button>
        <Button variant={variant} onClick={onConfirm} className="rounded-pill">
          {confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmDialog;
