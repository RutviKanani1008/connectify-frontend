import React from 'react';
import Select from 'react-select';
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
} from 'reactstrap';

import ItemTable from '../../../../../@core/components/data-table';
import { selectThemeColors } from '../../../../../utility/Utils';

const DeleteCategoryModal = ({
  deleteCategoryModal,
  clearDeleteCategoryModal,
  remainingCategory,
  showNewStatusError,
  fetchContactLoading,
  handleDeleteCategory,
  contacts,
  selectedNewStatus,
  contactColumn,
  setSelectedNewStatus,
}) => {
  return (
    <Modal
      isOpen={deleteCategoryModal.visible}
      toggle={() => {
        clearDeleteCategoryModal();
      }}
      className='modal-dialog-centered contact-category-delete-modal'
      size='lg'
      backdrop='static'
    >
      <ModalHeader toggle={() => clearDeleteCategoryModal()}>
        Delete Category
      </ModalHeader>
      <ModalBody>
        {fetchContactLoading ? (
          <>
            <div className='mb-2 text-primary text-center'>
              <Spinner color='primary' />
            </div>
          </>
        ) : contacts && contacts.length > 0 ? (
          <>
            <div className='delete-category-card'>
              <div className='select-new-category-wrapper'>
                <label className='form-label form-label'>
                  Select New Category
                </label>
                <div className='table__page__limit'>
                  <Select
                    className={`${showNewStatusError ? 'error' : ''}`}
                    id={'group_details'}
                    theme={selectThemeColors}
                    style={{ width: '20%' }}
                    placeholder={'Select Category'}
                    classNamePrefix='table__page__limit'
                    options={remainingCategory}
                    value={selectedNewStatus}
                    isClearable={false}
                    onChange={(e) => {
                      setSelectedNewStatus(e);
                    }}
                    isMulti={false}
                    isOptionSelected={(option, selectValue) =>
                      selectValue.some((i) => i === option)
                    }
                    isDisabled={false}
                  />
                  {showNewStatusError ? (
                    <>
                      <div className='text-danger error-msg'>
                        Please Enter Status Name.
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
              <ItemTable
                columns={contactColumn}
                data={contacts}
                title={`Below contacts are related with ${deleteCategoryModal.data?.categoryName}, please select new category in which you want to move these contacts to.`}
                addItemLink={false}
                hideButton={true}
                itemsPerPage={10}
                showCard={false}
                hideExport={false}
              />
            </div>
          </>
        ) : contacts.length === 0 ? (
          <>
            <div className='mb-3 text-primary text-center'>
              <h3>Are you sure You want to delete this Category?</h3>
            </div>
          </>
        ) : null}
      </ModalBody>
      <ModalFooter>
        <Button
          color='primary'
          disabled={!selectedNewStatus}
          onClick={() => {
            if (!selectedNewStatus) {
              showNewStatusError(true);
            } else {
              handleDeleteCategory();
            }
          }}
        >
          Delete Category
        </Button>
        <Button color='danger' onClick={() => clearDeleteCategoryModal()}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DeleteCategoryModal;
