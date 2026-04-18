import React from 'react';
import { useModal } from '../context/ModalContext';
import UserFormModal from './UserFormModal';
import { RecordPaymentModal } from './FinancialRecordEditor';
import ClientForm from './ClientForm';
import LeadForm from './LeadForm';
import { CommentModal } from './leads/CommentModal';
import DocumentPickupModal from './DocumentPickupModal';
import CSVImportWizard from './CSVImportWizard';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { RequestModal } from './leave/RequestModal';
import { DetailModal } from './leave/DetailModal';
import { ComposeModal } from './mailing/ComposeModal';
import { ImageLightbox } from './support/ImageLightbox';
import { AccountStatementModal } from './financials/AccountStatementModal';
import { ArchivePropertyModal } from './archive/ArchivePropertyModal';
import { RefundRequestModal } from './account/RefundRequestModal';
import { RefundPaymentModal } from './account/RefundPaymentModal';

export const MODAL_TYPES = {
  USER_FORM: 'USER_FORM',
  RECORD_PAYMENT: 'RECORD_PAYMENT',
  CLIENT_FORM: 'CLIENT_FORM',
  LEAD_FORM: 'LEAD_FORM',
  COMMENT: 'COMMENT',
  DOCUMENT_PICKUP: 'DOCUMENT_PICKUP',
  CSV_IMPORT: 'CSV_IMPORT',
  DELETE_CONFIRMATION: 'DELETE_CONFIRMATION',
  LEAVE_REQUEST: 'LEAVE_REQUEST',
  LEAVE_DETAIL: 'LEAVE_DETAIL',
  MAIL_COMPOSE: 'MAIL_COMPOSE',
  IMAGE_LIGHTBOX: 'IMAGE_LIGHTBOX',
  ACCOUNT_STATEMENT: 'ACCOUNT_STATEMENT',
  ARCHIVE_PROPERTY: 'ARCHIVE_PROPERTY',
  REFUND_REQUEST: 'REFUND_REQUEST',
  REFUND_PAYMENT: 'REFUND_PAYMENT'
};

export const ModalManager: React.FC = () => {
  const { modalType, modalProps, closeModal } = useModal();

  if (!modalType) return null;

  const commonProps = {
    isOpen: true,
    onClose: closeModal,
    ...modalProps
  };

  switch (modalType) {
    case MODAL_TYPES.USER_FORM:
      return <UserFormModal {...commonProps} />;
    case MODAL_TYPES.RECORD_PAYMENT:
      return <RecordPaymentModal {...commonProps} />;
    case MODAL_TYPES.CLIENT_FORM:
      return <ClientForm {...commonProps} />;
    case MODAL_TYPES.LEAD_FORM:
      return <LeadForm {...commonProps} />;
    case MODAL_TYPES.COMMENT:
      return <CommentModal {...commonProps} />;
    case MODAL_TYPES.DOCUMENT_PICKUP:
      return <DocumentPickupModal {...commonProps} />;
    case MODAL_TYPES.CSV_IMPORT:
      return <CSVImportWizard {...commonProps} />;
    case MODAL_TYPES.DELETE_CONFIRMATION:
      return <DeleteConfirmationModal {...commonProps} />;
    case MODAL_TYPES.LEAVE_REQUEST:
      return <RequestModal {...commonProps} />;
    case MODAL_TYPES.LEAVE_DETAIL:
      return <DetailModal {...commonProps} />;
    case MODAL_TYPES.MAIL_COMPOSE:
      return <ComposeModal {...commonProps} />;
    case MODAL_TYPES.IMAGE_LIGHTBOX:
      return <ImageLightbox {...commonProps} />;
    case MODAL_TYPES.ACCOUNT_STATEMENT:
      return <AccountStatementModal {...commonProps} />;
    case MODAL_TYPES.ARCHIVE_PROPERTY:
      return <ArchivePropertyModal {...commonProps} />;
    case MODAL_TYPES.REFUND_REQUEST:
      return <RefundRequestModal {...commonProps} />;
    case MODAL_TYPES.REFUND_PAYMENT:
      return <RefundPaymentModal {...commonProps} />;
    default:
      return null;
  }
};