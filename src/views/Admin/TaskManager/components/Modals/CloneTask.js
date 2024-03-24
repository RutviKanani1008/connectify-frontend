import React, { useEffect } from 'react';
import {
  Button,
  Form,
  FormFeedback,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from 'reactstrap';
import { FormField } from '@components/form-fields';
import { useCloneTask } from '../../service/task.services';
import { useForm, useWatch } from 'react-hook-form';
import AsyncParentTaskSelect from '../AsyncParentTaskSelect';
import classNames from 'classnames';
import {
  parentTaskOptionComponent,
  parentTaskOptionSingleValue,
} from '../../../../forms/component/OptionComponent';
import { SaveButton } from '../../../../../@core/components/save-button';

const CLONE_TASK_TYPE = [
  { label: 'Clone as Parent Task', value: 'parent_task' },
  { label: 'Clone as Child Task', value: 'child_task' },
];

function CloneTaskModal({
  // modal state
  isModalOpen,
  setIsModalOpen,
  // original editing task
  editTask,
  setUpdateTask,
  // all task lists
  currentTasks,
  setCurrentTasks,
  // sub task lists
  subTasks,
  setSubTasks,
  // parent task details of current task
  setIsSubTask,
}) {
  /** API Hooks */
  const { cloneTask, isLoading: cloneTaskLoading } = useCloneTask();
  /** Form Hooks */
  const {
    control: cloneControl,
    handleSubmit: cloneTaskHandleSubmit,
    setValue: cloneSetValue,
    reset: cloneReset,
    getValues: cloneGetValues,
    formState: cloneFormState,
    setError: cloneSetError,
    clearErrors: cloneClearErrors,
  } = useForm({
    mode: 'onBlur',
  });
  const { errors: cloneError } = cloneFormState;
  const clone_task_type = useWatch({
    control: cloneControl,
    name: `clone_task_type`,
  });

  useEffect(() => {
    cloneReset({
      clone_task_type: 'parent_task',
    });
  }, []);

  /** Handle Submit */
  const cloneTaskSubmit = async (value) => {
    if (value.clone_task_type === 'child_task' && !value.parent_task) {
      cloneSetError(
        `'parent_task'`,
        { type: 'focus', message: `Select Parent Task.` },
        { shouldFocus: true }
      );
      return;
    }
    if (value.clone_task_type === 'child_task' && value.parent_task.value) {
      value.parent_task = value.parent_task.value;
    }
    const { data, error } = await cloneTask(
      editTask?._id,
      value,
      'Cloning task...'
    );
    if (data && !error) {
      setUpdateTask(data);
      if (data.parent_task) {
        setCurrentTasks((prev) => {
          return [...prev].map((el) => {
            if (el?._id === data?.parent_task?._id) {
              return {
                ...el,
                sub_tasks: el?.sub_tasks + 1,
              };
            }
            return { ...el };
          });
        });
        if (subTasks[data?.parent_task?._id]?.length)
          setSubTasks((prev) => ({
            ...prev,
            [data?.parent_task?._id]: [
              data,
              ...(prev[data?.parent_task?._id] || []),
            ],
          }));
        setIsSubTask(data.parent_task);
      } else {
        setCurrentTasks([data, ...currentTasks]);
      }
      setIsModalOpen(false);
    }
  };

  return (
    <Modal
      isOpen={isModalOpen}
      toggle={() => setIsModalOpen(!isModalOpen)}
      className='modal-dialog-centered modal-lg clone-task-modal'
      backdrop='static'
    >
      <ModalHeader
        toggle={() => {
          setIsModalOpen(!isModalOpen);
        }}
      >
        <div className='d-flex justify-content-between'>Clone Task</div>
      </ModalHeader>
      <ModalBody>
        <Form
          className='auth-login-form'
          onSubmit={cloneTaskHandleSubmit(cloneTaskSubmit)}
          autoComplete='off'
        >
          <div>
            <div className='mb-2 mt-1'>
              <FormField
                name={`clone_task_type`}
                label=''
                defaultValue={cloneGetValues('clone_task_type')}
                options={CLONE_TASK_TYPE}
                type='radio'
                errors={cloneError}
                control={cloneControl}
              />
            </div>
            <div>
              {clone_task_type === 'child_task' && (
                <>
                  <div className='mt-1'>
                    <AsyncParentTaskSelect
                      classNamePrefix='custom-select'
                      name='customer'
                      placeholder='Select Parent Task'
                      value={cloneGetValues('parent_task')}
                      onChange={(e) => {
                        cloneSetValue('parent_task', e);
                        cloneClearErrors('parent_task');
                      }}
                      className={classNames('react-select w-100', {
                        'is-invalid': !!cloneError?.['parent_task']?.message,
                      })}
                      styles={{
                        parentTaskOptionSingleValue: (base) => ({
                          ...base,
                          display: 'flex',
                          alignItems: 'center',
                        }),
                      }}
                      components={{
                        Option: parentTaskOptionComponent,
                        SingleValue: parentTaskOptionSingleValue,
                      }}
                    />
                    {cloneError?.['parent_task']?.message && (
                      <FormFeedback>
                        {cloneError?.['parent_task']?.message}
                      </FormFeedback>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button
          className='cancel-btn'
          type='button'
          color='secondary'
          outline
          onClick={(e) => {
            e.stopPropagation();
            setIsModalOpen(!isModalOpen);
          }}
        >
          Cancel
        </Button>
        <SaveButton
          className='submit-btn'
          loading={cloneTaskLoading}
          color='primary'
          name={'Clone Task'}
          onClick={cloneTaskHandleSubmit(cloneTaskSubmit)}
        />
      </ModalFooter>
    </Modal>
  );
}

export default CloneTaskModal;
