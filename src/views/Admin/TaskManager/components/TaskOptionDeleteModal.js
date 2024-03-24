import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import Select from 'react-select';
import ItemTable from '../../../../@core/components/data-table';
import { selectThemeColors } from '@utils';
import useColumn from '../hooks/useColumns';
import { useState } from 'react';
import { useDeleteTaskOption } from '../service/taskOption.services';
import { showWarnAlert } from '../../../../helper/sweetalert.helper';
import { SaveButton } from '../../../../@core/components/save-button';

export const TaskOptionDeleteModal = (props) => {
  const {
    taskExistModal,
    clearTaskExistModal,
    existingTasks,
    currentSelection,
    taskOptions,
  } = props;

  const [selectedNewOne, setSelectedNewOne] = useState(false);
  const [showNewStatusError, setShowNewStatusError] = useState(false);
  const { columns } = useColumn();
  const { deleteTaskOption, isLoading: deleteTaskOptionLoading } =
    useDeleteTaskOption();

  const handleDeleteStatus = async () => {
    if (!selectedNewOne) {
      setShowNewStatusError(true);
    } else {
      const result = await showWarnAlert({
        title: 'Are you sure?',
        text: `Are you sure you would like to delete this ${
          currentSelection?.type === 'status' ? 'status' : 'priority'
        }?`,
      });

      if (result.value) {
        const obj = {};
        obj.tasks = [...existingTasks.map((t) => t._id)];
        obj.updateOptions = selectedNewOne?._id;
        obj.type = currentSelection?.type;
        const { error } = await deleteTaskOption(
          currentSelection?._id,
          obj,
          'delete option'
        );
        if (!error) {
          clearTaskExistModal(true);
        }
      }
    }
  };

  return (
    <>
      <Modal
        isOpen={taskExistModal}
        toggle={() => {
          clearTaskExistModal();
        }}
        className='modal-dialog-centered task-status-priority-category-delete-modal'
        size='lg'
        backdrop='static'
      >
        <ModalHeader toggle={() => clearTaskExistModal()}>
          {currentSelection &&
            (currentSelection?.type === 'status'
              ? 'Delete Status'
              : currentSelection?.type === 'priority'
              ? 'Delete Priority'
              : 'Delete Category')}
        </ModalHeader>
        <ModalBody>
          {existingTasks && existingTasks.length > 0 ? (
            <>
              <div className='delete-task-status-priority-category-card'>
                <div className='select-new-task-status-priority-category-wrapper'>
                  <label className='form-label form-label'>
                    Select New{' '}
                    {currentSelection &&
                      (currentSelection?.type === 'status'
                        ? 'Status'
                        : currentSelection?.type === 'priority'
                        ? 'Priority'
                        : 'Category')}
                  </label>
                  <div className='table__page__limit'>
                    <Select
                      className={`${showNewStatusError ? 'error' : ''}`}
                      id={'group_details'}
                      theme={selectThemeColors}
                      style={{ width: '20%' }}
                      placeholder={`Select ${
                        currentSelection &&
                        (currentSelection?.type === 'status'
                          ? 'Status'
                          : currentSelection?.type === 'priority'
                          ? 'Priority'
                          : 'Category')
                      }`}
                      classNamePrefix='table__page__limit'
                      options={taskOptions}
                      value={selectedNewOne}
                      isClearable={false}
                      onChange={(e) => {
                        setSelectedNewOne(e);
                      }}
                      isMulti={false}
                      isOptionSelected={(option, selectValue) =>
                        selectValue.some((i) => i === option)
                      }
                      menuPosition='fixed'
                      isDisabled={false}
                    />
                    {showNewStatusError ? (
                      <>
                        <div className='text-danger error-msg'>
                          Please select{' '}
                          {currentSelection &&
                            (currentSelection?.type === 'status'
                              ? 'Status'
                              : currentSelection?.type === 'priority'
                              ? 'Priority'
                              : 'Category')}{' '}
                          Name.
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>
                <ItemTable
                  hideExport
                  columns={columns}
                  data={existingTasks}
                  title={`Below tasks are related with ${
                    currentSelection &&
                    (currentSelection?.type === 'status'
                      ? 'Status'
                      : currentSelection?.type === 'priority'
                      ? 'Priority'
                      : 'Category')
                  }, please select new ${
                    currentSelection &&
                    (currentSelection?.type === 'status'
                      ? 'Status'
                      : currentSelection?.type === 'priority'
                      ? 'Priority'
                      : 'Category')
                  } in which you want to move these task to.`}
                  addItemLink={false}
                  hideButton={true}
                  itemsPerPage={10}
                  showCard={false}
                />
              </div>
            </>
          ) : null}
        </ModalBody>
        <ModalFooter>
          <SaveButton
            loading={deleteTaskOptionLoading}
            width='150px'
            type='submit'
            name={`Delete
            ${
              currentSelection && currentSelection?.type === 'status'
                ? 'Status'
                : currentSelection?.type === 'priority'
                ? 'Priority'
                : 'Category'
            }`}
            onClick={() => {
              if (!selectedNewOne) {
                setShowNewStatusError(true);
              } else {
                handleDeleteStatus();
              }
            }}
          />
          <Button color='danger' onClick={() => clearTaskExistModal()}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};
