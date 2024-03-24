import React, { useRef, useState } from 'react';
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
} from 'reactstrap';

import Wizard from '@components/wizard';
import { ArrowRight } from 'react-feather';
import UploadExcel from './UploadExcelSheet';
import ImportUnsubSuccess from './ImportUnsubSuccess';
import { importUnsubContacts } from '../../../../api/contacts';

const ImportUnsubContact = ({
  openUploadUnsubContact,
  closeUploadUnsubModal,
}) => {
  const ref = useRef(null);
  const [stepper, setStepper] = useState(null);
  const [stepperIndex, setStepperIndex] = useState(null);
  const [fileUploading, setFileUploading] = useState(false);
  const [showFileError, setShowFileError] = useState(false);
  const [showFile, setFile] = useState(false);

  const [unsubCounts, setUnsubCounts] = useState(0);

  const handleUnsubscribeContacts = (formData) => {
    setFileUploading(true);

    importUnsubContacts(formData)
      .then((res) => {
        if (res.data.data) {
          setUnsubCounts(res.data.data);
        }

        setFileUploading(false);
        stepper.next();
      })
      .catch(() => {
        setFileUploading(false);
      });
  };

  const steps = [
    {
      id: 'upload-file',
      title: 'Upload',
      subtitle: 'Upload Excel File',
      content: (
        <UploadExcel
          stepper={stepper}
          setFileUploading={setFileUploading}
          setFile={setFile}
          showFileError={showFileError}
          setShowFileError={setShowFileError}
          isUnsubContacts
          handleUploadUnsubContacts={handleUnsubscribeContacts}
        />
      ),
    },
    {
      id: 'Done',
      title: 'Unsubscribe Done',
      subtitle: 'Contact Unsubscribe Done',
      content: <ImportUnsubSuccess unsubCounts={unsubCounts} />,
    },
  ];

  return (
    <>
      <Modal
        isOpen={openUploadUnsubContact}
        toggle={() => {
          closeUploadUnsubModal();
        }}
        backdrop='static'
        size='xl'
        className={`modal-dialog-centered import-contact-modal import-unsubContact-modal modal-dialog-mobile`}
      >
        <ModalHeader
          toggle={() => {
            closeUploadUnsubModal();
          }}
        >
          Import Contact
        </ModalHeader>
        <ModalBody>
          {/* <div className='horizontal-wizard import-contacts'> */}
          <Wizard
            className='justify-content-center'
            instance={(el) => {
              setStepper(el);
            }}
            ref={ref}
            steps={steps}
            setCurrentActiveIndex={setStepperIndex}
          />
          {/* </div> */}
        </ModalBody>
        <ModalFooter>
          <Button
            color='primary'
            disabled={fileUploading || !showFile}
            onClick={() => {
              if (stepperIndex === 0 && showFile) {
                stepper.next();
              } else if (stepperIndex === 1) {
                closeUploadUnsubModal(true);
              }
            }}
          >
            <span className='align-middle d-sm-inline-block d-none btn-text'>
              {stepperIndex === 1 ? 'Done' : 'Next'}
              {fileUploading && <Spinner size='sm' />}
            </span>
            {!fileUploading && stepperIndex !== 1 && (
              <ArrowRight
                size={14}
                className='align-middle me-sm-25 me-0'
              ></ArrowRight>
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default ImportUnsubContact;
