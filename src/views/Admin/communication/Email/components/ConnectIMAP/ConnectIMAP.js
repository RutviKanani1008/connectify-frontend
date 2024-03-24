// ** React Imports
import React, { useRef, useState } from 'react';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';

// ** Constants
import { KNOWN_HOSTS, MAIL_LABELS } from '../../constant';

// ** Components
import Wizard from '@components/wizard';
import AddPlatform from './AddPlatform';
import AddConnectionInfo from './AddConnectionInfo';
import AddFoldersForm from './AddFoldersForm';

const initialState = {
  platformInfo: { platform: KNOWN_HOSTS.GMAIL },
  connectionInfo: {
    email: '',
    password: '',
    smtpHost: '',
    imapHost: '',
    smtpPort: '',
    imapPort: '',
    smtpUsername: '',
    imapUsername: '',
    mailFolders: [],
  },
  folderInfo: Object.values(MAIL_LABELS).reduce(
    (p, c) => ({ ...p, [c]: null }),
    {}
  ),
};

const ConnectIMAP = ({ isOpen, closeModal }) => {
  // ** Refs
  const stepperRef = useRef(null);

  // ** States
  const [stepper, setStepper] = useState(null);
  const [formState, setFormState] = useState(initialState);

  const stepperProps = { stepper, formState, setFormState };
  const steps = [
    {
      id: 'platform-info',
      title: 'Platform',
      subtitle: 'Select platform',
      content: <AddPlatform {...stepperProps} />,
    },
    {
      id: 'host-info',
      title: 'SMTP / IMAP',
      subtitle: 'Fill SMTP / IMAP details',
      content: <AddConnectionInfo {...stepperProps} />,
    },
    {
      id: 'folder-info',
      title: 'Map folders',
      subtitle: 'Map Your folders',
      content: (
        <AddFoldersForm {...stepperProps} onFinalSubmit={onFinalSubmit} />
      ),
    },
  ];

  function handleCloseModal() {
    setFormState(initialState);
    closeModal();
  }

  function onFinalSubmit() {
    setFormState(initialState);
    closeModal();
  }

  return (
    <Modal
      isOpen={isOpen}
      toggle={handleCloseModal}
      className='modal-dialog-centered connect-IMAP-modal modal-dialog-mobile add-connection'
      backdrop='static'
      size='lg'
      fade={false}
    >
      <ModalHeader toggle={handleCloseModal}>Connect IMAP</ModalHeader>
      <ModalBody className=''>
        <Wizard
          className='step-wrapper'
          ref={stepperRef}
          steps={steps}
          instance={(el) => setStepper(el)}
        />
      </ModalBody>
    </Modal>
  );
};

export default ConnectIMAP;
