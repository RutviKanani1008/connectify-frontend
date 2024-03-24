// ** React Imports
import React, { useState } from 'react';
import {
  Button,
  Form,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from 'reactstrap';

// ** Components
import { SaveButton } from '../../../../../../@core/components/save-button';

const AddNewFolderModal = ({
  isOpen,
  closeModal,
  prevFolders,
  addNewFolder,
}) => {
  const [folder, setFolder] = useState({ value: '', error: false });

  const convertStringToDashedLowercase = (string) => {
    return string.toLowerCase().replace(/ /g, '-');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!folder.value.trim()) {
      return setFolder((prev) => ({ ...prev, error: 'Required.' }));
    }

    const isExist = prevFolders.some((f) => {
      return (
        convertStringToDashedLowercase(f.name) ===
        convertStringToDashedLowercase(folder.value.trim())
      );
    });

    if (isExist) {
      return setFolder((prev) => ({ ...prev, error: 'Folder Already Exist.' }));
    }

    setFolder({ value: '', error: false });
    addNewFolder(folder.value);
    closeModal();
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={() => closeModal()}
      className='modal-dialog-centered'
      backdrop='static'
    >
      <ModalHeader toggle={() => closeModal()}>Add Your Own Folder</ModalHeader>
      <ModalBody className=''>
        <Label className='form-label' for='folder-label'>
          Folder Name
        </Label>
        <Input
          id='folder-label'
          value={folder.value}
          onChange={(e) => setFolder({ value: e.target.value, error: false })}
        />
        {folder.error && <span>{folder.error}</span>}
      </ModalBody>
      <ModalFooter>
        <Button
          className='cancel-btn'
          type='reset'
          color='secondary'
          outline
          onClick={() => closeModal()}
        >
          Cancel
        </Button>
        <Form onSubmit={handleSubmit}>
          <SaveButton
            width='100px'
            color='primary'
            name={'Add'}
            type='submit'
          ></SaveButton>
        </Form>
      </ModalFooter>
    </Modal>
  );
};

export default AddNewFolderModal;
