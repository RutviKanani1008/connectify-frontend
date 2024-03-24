import React, { useState } from 'react';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';
import logo from '@src/assets/images/icons/logo.png';

const InfoModal = () => {
  const [isOpen, setIsOpen] = useState(true);

  const closeModal = () => setIsOpen(false);

  return (
    <Modal
      isOpen={isOpen}
      toggle={closeModal}
      className='modal-dialog-centered'
      backdrop='static'
    >
      <ModalHeader toggle={closeModal} />
      <ModalBody>
        <div className='align-center'>
          <img className='fallback-logo' src={logo} alt='logo' />
          <h2>Admin Dashboard</h2>
          <ul>
            <li>Dashboard Features are comming soon !!</li>
          </ul>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default InfoModal;
