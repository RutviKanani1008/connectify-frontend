import React from 'react';
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from 'reactstrap';
import { SaveButton } from '../../../../../@core/components/save-button';

const AddCategoryModal = ({
  openCategoryModal,
  setOpenCategoryModal,
  setCurrentCategory,
  setIsUpdateCategory,
  setShowError,
  isUpdateCategory,
  selectedGroup,
  currentCategory,
  showError,
  errorMessage,
  createCategory,
  buttonLoading,
}) => {
  return (
    <Modal
      isOpen={openCategoryModal}
      toggle={() => setOpenCategoryModal(!openCategoryModal)}
      className='modal-dialog-centered add-contact-category-modal modal-dialog-mobile'
      backdrop='static'
    >
      <ModalHeader
        toggle={() => {
          setCurrentCategory({ text: '' });
          setOpenCategoryModal(!openCategoryModal);
          setIsUpdateCategory(false);
          setShowError(false);
        }}
      >
        {isUpdateCategory ? 'Update Category' : 'Add Category'}
      </ModalHeader>
      <ModalBody>
        <div className='normal-text mb-1'>
          {isUpdateCategory ? 'Updating' : 'Adding'} category{' '}
          {isUpdateCategory ? 'of' : 'into'}
          <span className='text-primary'>{` ${selectedGroup?.label}`} </span>
        </div>
        <div className='mb-1'>
          <Input
            label='Category Name'
            name='category'
            placeholder='Category Name'
            type='text'
            value={currentCategory.text}
            onChange={(e) => {
              if (showError) {
                setShowError(false);
              }
              setCurrentCategory({
                text: e.target.value,
              });
            }}
          />
          {showError ? (
            <>
              <div className='mt-1 text-danger'>
                {errorMessage ? errorMessage : 'Please Enter Category Name.'}
              </div>
            </>
          ) : null}
        </div>
      </ModalBody>
      <ModalFooter>
        <SaveButton
          color='primary'
          loading={buttonLoading}
          name={isUpdateCategory ? 'Update Category' : 'Add Category'}
          onClick={() => {
            if (currentCategory.text === '') {
              setShowError(true);
            } else {
              createCategory();
            }
          }}
          width={isUpdateCategory ? '40%' : '32%'}
        ></SaveButton>
        <Button
          color='danger'
          onClick={() => {
            setCurrentCategory({ text: '' });
            setOpenCategoryModal(!openCategoryModal);
            setIsUpdateCategory(false);
            setShowError(false);
          }}
        >
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AddCategoryModal;
