import { useState } from 'react';
import {
  Button,
  FormFeedback,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from 'reactstrap';
import { SaveButton } from '../../../../@core/components/save-button';
import AsyncParentTaskSelect from './AsyncParentTaskSelect';
import { required } from '../../../../configs/validationConstant';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useUpdateTask, useUpdateTaskParent } from '../service/task.services';
import classNames from 'classnames';
import {
  parentTaskOptionComponent,
  parentTaskOptionSingleValue,
} from '../../../forms/component/OptionComponent';

const constantOptionName = {
  move: 'move',
  new: 'new',
};

const radioMethodOption = [
  { label: 'Move to Another Task', name: constantOptionName.move },
  { label: 'Create Parent Task', name: constantOptionName.new },
];

const taskMoveSchema = yup.object().shape({
  parent_task: yup
    .object()
    .shape({
      label: yup.string().required(required('Parent Task')),
      value: yup.string().required(required('Parent Task')),
    })
    .required(required('Parent Task'))
    .nullable(),
});

const TaskParentChangeModal = ({
  setOpen,
  selectTask,
  setCurrentTasks,
  isOpen,
  closeModal,
  setSubTasks,
  selectCurrentTask,
}) => {
  const isSubTask = !!selectCurrentTask;

  const [selectMethod, setSelectMethod] = useState(radioMethodOption[0].name);

  const { updateTask: updateTaskDetail, isLoading: updateTaskLoading } =
    useUpdateTask();

  const {
    updateTask: updateTaskParentDetail,
    isLoading: updateTaskParentLoading,
  } = useUpdateTaskParent();

  const {
    reset,
    getValues,
    setValue,
    clearErrors,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: 'onTouched',
    resolver: yupResolver(taskMoveSchema),
  });

  const moveToParentTask = async (formData) => {
    const taskId = selectTask?._id;
    const parentTaskId = formData?.parent_task?.value;

    const updateData = { parent_task: parentTaskId };
    const { data, error } = await updateTaskDetail(
      taskId,
      updateData,
      'Task moving'
    );

    if (!error) {
      setSubTasks((prev) => ({
        ...prev,
        [selectTask?.parent_task]: (
          prev?.[selectTask?.parent_task] || []
        ).filter((el) => el._id !== data?._id),
      }));
      setCurrentTasks((prev) => {
        return [...prev].map((el) => {
          if (el?._id === data?.parent_task) {
            return {
              ...el,
              sub_tasks: el?.sub_tasks + 1,
            };
          } else if (el?._id === selectCurrentTask?._id) {
            return {
              ...el,
              sub_tasks: el?.sub_tasks - 1,
            };
          }
          return { ...el };
        });
      });
      closeModal();
    }
  };

  const createParentTask = async () => {
    const taskId = selectTask?._id;
    const updateData = { parent_task: null };
    const { data, error } = await updateTaskDetail(
      taskId,
      updateData,
      'Create Parent Task'
    );

    if (!error) {
      setSubTasks((prev) => ({
        ...prev,
        [selectTask?.parent_task]: (
          prev?.[selectTask?.parent_task] || []
        ).filter((el) => el._id !== data?._id),
      }));
      setCurrentTasks((prev) => {
        return [{ ...data, sub_tasks: 0 }, ...prev].map((el) =>
          el?._id === selectCurrentTask?._id
            ? {
                ...el,
                sub_tasks: el?.sub_tasks - 1,
              }
            : { ...el }
        );
      });
      setOpen((prev) => prev.map((id) => `${id + 1}`));
      closeModal();
    }
  };

  const moveToSubTask = async (formData) => {
    const taskId = selectTask?._id;
    const parentTaskId = formData?.parent_task?.value;
    const updateData = { parent_task: parentTaskId };

    const { error } = await updateTaskParentDetail(
      taskId,
      updateData,
      'Task moving'
    );

    if (!error) {
      setCurrentTasks((prev) => {
        return [...prev]
          .filter((el) => el?._id !== selectTask?._id)
          .map((el) =>
            el?._id === parentTaskId
              ? {
                  ...el,
                  sub_tasks:
                    (el?.sub_tasks || 0) + (selectTask?.sub_tasks || 0) + 1,
                }
              : { ...el }
          );
      });
      closeModal();
    }
  };

  const onSubmit = async (data) => {
    if (isSubTask) {
      await moveToParentTask(data);
    } else {
      await moveToSubTask(data);
    }
  };

  const onSubmitClick = async () => {
    if (selectMethod === constantOptionName.move) {
      handleSubmit(onSubmit)();
    } else {
      await createParentTask();
    }
  };

  return (
    <div>
      <Modal
        isOpen={isOpen}
        toggle={() => closeModal()}
        className='modal-dialog-centered modal-md change-parent-task-modal modal-dialog-mobile'
        size='lg'
        backdrop='static'
        fade={false}
      >
        <ModalHeader
          toggle={() => {
            closeModal();
          }}
        >
          <div className='d-flex'>Change Parent Task</div>
        </ModalHeader>
        <ModalBody className=''>
          {isSubTask ? (
            <div className='radio-btn-wrapper d-flex flex-inline'>
              {radioMethodOption.map((radio, index) => (
                <div key={index} className='form-check radio-btn-repeater me-2'>
                  <Input
                    className='form-check-input'
                    type='radio'
                    id={radio.name}
                    checked={selectMethod === radio.name}
                    onChange={() => {
                      setSelectMethod(radio.name);
                      reset();
                    }}
                  />
                  <Label
                    className='form-check-label form-label'
                    for={radio.name}
                  >
                    {radio.label}
                  </Label>
                </div>
              ))}
            </div>
          ) : (
            <span className='normal-text'>
              If this parent task has sub-tasks, those will become sub-tasks of
              the new parent task.
            </span>
          )}

          {selectMethod === constantOptionName.move && (
            <div className='mt-1'>
              <AsyncParentTaskSelect
                classNamePrefix='custom-select'
                name='customer'
                placeholder='Select Parent Task'
                value={getValues('parent_task')}
                onChange={(e) => {
                  setValue('parent_task', e);
                  clearErrors('parent_task');
                }}
                selectCurrentTask={isSubTask ? selectCurrentTask : selectTask}
                className={classNames('react-select w-100', {
                  'is-invalid': !!errors?.['parent_task']?.value?.message,
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
              {errors?.['parent_task']?.value?.message && (
                <FormFeedback>
                  {errors?.['parent_task']?.value?.message}
                </FormFeedback>
              )}
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <Button
            color='danger'
            onClick={() => {
              closeModal();
            }}
          >
            Cancel
          </Button>
          <SaveButton
            loading={updateTaskLoading || updateTaskParentLoading}
            disabled={updateTaskLoading || updateTaskParentLoading}
            width='100px'
            color='primary'
            name={'Submit'}
            onClick={onSubmitClick}
          />
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default TaskParentChangeModal;
