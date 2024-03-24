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

import ItemTable from '../../../data-table';
import { selectThemeColors } from '../../../../../utility/Utils';
import useContactColumns from '../../../../../views/Admin/groups/hooks/useContactColumns';

const DeleteCategory = ({
  isOpen,
  setIsOpen,
  contactLoading,
  category,
  selectedNewCategory,
  setSelectedNewCategory,
  contacts,
  remainingCategory,
  deleteCategory,
}) => {
  const { contactColumn } = useContactColumns();

  return (
    <div>
      <Modal
        isOpen={isOpen}
        toggle={() => setIsOpen(!isOpen)}
        className='modal-dialog-centered contact-category-delete-modal'
        size='lg'
        backdrop='static'
      >
        <ModalHeader toggle={() => setIsOpen(!isOpen)}>
          Delete Category
        </ModalHeader>
        <ModalBody>
          {contactLoading ? (
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
                      id={'group_details'}
                      theme={selectThemeColors}
                      style={{ width: '20%' }}
                      placeholder={'Select Category'}
                      classNamePrefix='table__page__limit'
                      options={remainingCategory}
                      value={selectedNewCategory}
                      isClearable={false}
                      onChange={(e) => {
                        setSelectedNewCategory(e);
                      }}
                      isMulti={false}
                      isOptionSelected={(option, selectValue) =>
                        selectValue.some((i) => i === option)
                      }
                      isDisabled={false}
                    />
                  </div>
                </div>
                <ItemTable
                  columns={contactColumn}
                  data={contacts}
                  title={`Below contacts are related with ${category?.title}, please select new category in which you want to move these contacts to.`}
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
            disabled={!selectedNewCategory || contactLoading}
            onClick={() => {
              deleteCategory(category.id);
            }}
          >
            Delete Category
          </Button>
          <Button color='danger' onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default DeleteCategory;
