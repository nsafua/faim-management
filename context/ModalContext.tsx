
import React, { createContext, useContext, useState, useCallback } from 'react';

export type ModalType = string | null;

interface ModalContextType {
  isOpen: boolean;
  modalType: ModalType;
  modalProps: any;
  openModal: <T = any>(type: string, props?: T) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modalType, setModalType] = useState<ModalType>(null);
  const [modalProps, setModalProps] = useState<any>({});

  const openModal = useCallback((type: string, props: any = {}) => {
    setModalProps(props);
    setModalType(type);
  }, []);

  const closeModal = useCallback(() => {
    setModalType(null);
    setModalProps({});
  }, []);

  return (
    <ModalContext.Provider value={{ isOpen: !!modalType, modalType, modalProps, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
