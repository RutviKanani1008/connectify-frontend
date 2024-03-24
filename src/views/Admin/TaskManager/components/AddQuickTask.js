import {
  Button,
  Form,
  FormFeedback,
  Spinner,
  UncontrolledTooltip,
} from 'reactstrap';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import Select from 'react-select';
import { Save, XCircle } from 'react-feather';
import _ from 'lodash';

import { FormField } from '@components/form-fields';
import { required } from '../../../../configs/validationConstant';
import { yupResolver } from '@hookform/resolvers/yup';
import { useCreateTask } from '../service/task.services';
import { createTaskBasedOnScheduler } from '../helper';
import { selectThemeColors } from '../../../../utility/Utils';
import {
  OptionComponent,
  SingleValue,
  contactOptionComponent,
  contactSingleValue,
} from '../../../forms/component/OptionComponent';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { userData } from '../../../../redux/user';
import useHandleSideBar from '../hooks/useHelper';
import AsyncContactSelect from '../../billing/Quote/components/AsyncContactSelect';

const taskScheme = yup.object().shape({
  name: yup.string().required(required('Task Name')),
});

const AddQuickTask = ({
  setCurrentTasks = false,
  currentTasks,
  subTasks,
  setSubTasks = false,
  setVisible,
  isSubTask = false,
  taskOptions = [],
  setOpen,
  setCurrentFilter,
  currentFilter,
  initialContactData,
  notifyUserForNewTask,
  setCurrentTaskPagination,
  currentCategory,
  usersOptions,
}) => {
  // ** Redux **
  const user = useSelector(userData);

  const {
    control,
    handleSubmit,
    watch,
    clearErrors,
    getValues,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(taskScheme),
    defaultValues: { assigned: [] },
  });
  // ** Watch **
  const statusWatch = watch('status');
  const contactWatch = watch('contact');
  const priorityWatch = watch('priority');

  // ** Custom Hooks **
  const { createTask, isLoading: createTaskLoading } = useCreateTask();

  // ** Custom Hooks **
  const { handleSidebar } = useHandleSideBar({
    setCurrentFilter,
    initialContactData,
  });

  useEffect(() => {
    if (initialContactData?._id) {
      setValue('contact', {
        label: `${initialContactData?.firstName ?? ''} ${
          initialContactData?.lastName ?? ''
        } ${initialContactData?._id === user?._id ? '(Me)' : ''}`,
        value: initialContactData?._id,
      });
    }
  }, [initialContactData]);

  // set initial value of priority and status
  useEffect(() => {
    const priority = taskOptions.filter((o) => o.type === 'priority')?.[0];
    const status = taskOptions.filter((o) => o.type === 'status')?.[0];
    setValue('priority', taskOptions.filter((o) => o.type === 'priority')?.[0]);
    setValue('status', taskOptions.filter((o) => o.type === 'status')?.[0]);
    priority && clearErrors('priority');
    status && clearErrors('status');
  }, [taskOptions]);

  useEffect(() => {
    if (isSubTask) {
      const contact = isSubTask?.contact;
      if (contact && contact?._id) {
        setValue('contact', {
          label: `${contact?.firstName ?? ''} ${contact?.lastName ?? ''} ${
            contact?._id === user?._id ? '(Me)' : ''
          }`,
          value: contact?._id,
        });
      }
      const assigned = isSubTask?.assigned;
      if (assigned && assigned._id) {
        setValue('assigned', [
          {
            label: `${assigned?.firstName ?? ''} ${assigned?.lastName ?? ''} ${
              assigned?._id === user?._id ? '(Me)' : ''
            }`,
            value: assigned?._id,
          },
        ]);
      }
    }
  }, [isSubTask]);

  const onSubmit = async (values) => {
    const formValue = JSON.parse(JSON.stringify(values));
    formValue.startDate = new Date();
    formValue.endDate = new Date(new Date().getTime() + 10 * 60000);

    formValue.assigned = (formValue?.assigned || [])?.map(
      (assign) => assign?.value
    );
    formValue.contact = formValue?.contact?.value;
    if (isSubTask) {
      formValue.parent_task = isSubTask?._id;
    }
    if (formValue.status?._id) {
      if (formValue.status?._id !== 'unassigned') {
        formValue.status = formValue.status._id;
      } else {
        formValue.status = null;
      }
    }
    if (formValue?.priority?._id) {
      if (formValue.priority?._id !== 'unassigned') {
        formValue.priority = formValue.priority._id;
      } else {
        formValue.priority = null;
      }
    }

    if (currentCategory) {
      formValue.category = currentCategory;
    }
    const tasks = createTaskBasedOnScheduler({
      scheduleData: { schedule: { value: 'never' } },
      taskData: formValue,
    });

    const { error, data } = await createTask(tasks, undefined, {
      populate: JSON.stringify([
        { path: 'assigned' },
        { path: 'contact' },
        { path: 'status' },
        { path: 'priority' },
      ]),
    });
    if (!error && _.isArray(data)) {
      setVisible(false);
      if (data?.length) {
        data.map((task) => {
          if (task?.status?._id) task.status = task.status?._id;
          if (task?.priority?._id) task.priority = task.priority?._id;
          if (task?._id) {
            notifyUserForNewTask({
              id: task?._id,
              assigned: task?.assigned,
            });
          }
        });
      }
      if (isSubTask) {
        const updatedSubTasks = [...data, ...(subTasks[isSubTask?._id] || [])];
        setSubTasks((pre) => ({ ...pre, [isSubTask?._id]: updatedSubTasks }));
        // here set task increment count when add sub task
        setCurrentTasks((prev) => {
          return prev.map((obj) =>
            obj._id === isSubTask?._id
              ? {
                  ...obj,
                  sub_tasks: obj?.sub_tasks + data.length,
                }
              : { ...obj }
          );
        });
      } else {
        setCurrentTaskPagination((prev) => ({
          ...prev,
          loadMore:
            prev?.pagination?.total + 1 === currentTasks.length + 1
              ? false
              : true,
          pagination: {
            ...prev?.pagination,
            total: prev?.pagination?.total + 1 || 0,
          },
        }));
        if (currentFilter.completed || currentFilter.trash) {
          handleSidebar({ open: true });
        } else {
          if (currentFilter.contact && currentFilter.assigned) {
            if (
              _.isArray(formValue?.assigned) &&
              formValue?.assigned?.includes(currentFilter.assigned) &&
              currentFilter.contact === formValue?.contact
            ) {
              setCurrentTasks((prev) => [...data, ...prev]);
            }
          } else if (currentFilter.contact && !currentFilter.assigned) {
            if (currentFilter.contact === formValue?.contact) {
              setCurrentTasks((prev) => [...data, ...prev]);
            }
          } else if (!currentFilter.contact && currentFilter.assigned) {
            if (
              _.isArray(formValue?.assigned) &&
              formValue?.assigned?.includes(currentFilter?.assigned)
            ) {
              setCurrentTasks((prev) => [...data, ...prev]);
            }
          } else {
            setCurrentTasks((prev) => [...data, ...prev]);
          }
        }
        setOpen([]);
      }
    }
  };

  return (
    <Form className='add-task-form-row' onSubmit={handleSubmit(onSubmit)}>
      <div className='form-field-row'>
        <div className='form-field-col'>
          <FormField
            name='name'
            placeholder='Enter Name'
            type='text'
            errors={errors}
            control={control}
          />
        </div>
        <div className='form-field-col'>
          <div className='table__page__limit contact-select-box'>
            <AsyncContactSelect
              menuPortalTarget={document.body}
              key={contactWatch?.value}
              styles={{
                singleValue: (base) => ({
                  ...base,
                  display: 'flex',
                  alignItems: 'center',
                }),
              }}
              id='contact'
              name='contact'
              placeholder='Select contact'
              defaultValue={getValues('contact')}
              theme={selectThemeColors}
              className={`react-select ${
                errors?.['contact']?.message ? 'is-invalid' : ''
              }`}
              classNamePrefix='custom-select'
              onChange={(data) => setValue('contact', data)}
              value={getValues('contact')}
              components={{
                Option: contactOptionComponent,
                contactSingleValue,
              }}
            />
          </div>
        </div>
        <div className='form-field-col assign__select__box'>
          <FormField
            menuPortalTarget={document.body}
            isClearable
            loading={usersOptions.loading}
            name='assigned'
            placeholder='Assign to'
            type='select'
            classNamePrefix='custom-select'
            errors={errors}
            control={control}
            options={usersOptions.data}
            isMulti={true}
          />
        </div>
        <div className='form-field-col priority__select__box'>
          <Select
            menuPortalTarget={document.body}
            placeholder='Select priority'
            key={priorityWatch?.value}
            styles={{
              singleValue: (base) => ({
                ...base,
                display: 'flex',
                alignItems: 'center',
              }),
            }}
            id='priority'
            name='priority'
            defaultValue={getValues('priority')}
            options={taskOptions?.filter(
              (option) => option.type === 'priority'
            )}
            theme={selectThemeColors}
            className={`react-select ${
              errors?.['priority']?.message ? 'is-invalid' : ''
            }`}
            classNamePrefix='custom-select'
            isClearable
            onChange={(data) => setValue('priority', data)}
            components={{
              Option: OptionComponent,
              SingleValue,
            }}
          />
          {errors?.['priority']?.message && (
            <FormFeedback>{errors?.['priority']?.message}</FormFeedback>
          )}
        </div>
        <div className='form-field-col status__select__box'>
          <Select
            menuPortalTarget={document.body}
            placeholder='Select status'
            key={statusWatch?.value}
            styles={{
              singleValue: (base) => ({
                ...base,
                display: 'flex',
                alignItems: 'center',
              }),
            }}
            id='status'
            name='status'
            defaultValue={getValues('status')}
            options={taskOptions?.filter((option) => option.type === 'status')}
            theme={selectThemeColors}
            className={`react-select ${
              errors?.['status']?.message ? 'is-invalid' : ''
            }`}
            classNamePrefix='custom-select'
            isClearable
            onChange={(data) => setValue('status', data)}
            components={{
              Option: OptionComponent,
              SingleValue,
            }}
          />
          {errors?.['status']?.message && (
            <FormFeedback>{errors?.['status']?.message}</FormFeedback>
          )}
        </div>
      </div>
      <div className='action-btn-wrapper'>
        {createTaskLoading ? (
          <div className='action-btn spinner-btn'>
            <Spinner className='save__btn' size='sm' />
          </div>
        ) : (
          <>
            <div className='action-btn save-btn'>
              <Save
                size={25}
                className={`save__btn ${
                  createTaskLoading ? 'cursor-not-allowed' : 'cursor-pointer'
                }`}
                onClick={handleSubmit(onSubmit)}
                id='save-btn'
              />
              <UncontrolledTooltip
                placement='top'
                autohide={true}
                target='save-btn'
              >
                {isSubTask ? 'Save Subtask' : 'Save Task'}
              </UncontrolledTooltip>
            </div>
          </>
        )}
        <div className='action-btn close-btn'>
          <XCircle
            onClick={() => setVisible(false)}
            id='close-btn'
            color='red'
            className=''
          />
          <UncontrolledTooltip
            placement='top'
            autohide={true}
            target='close-btn'
          >
            Close
          </UncontrolledTooltip>
        </div>
      </div>
      <div className='action-btn-mobile-wrapper'>
        <Button
          className={`btn-primary submit ${
            createTaskLoading ? 'cursor-not-allowed' : 'cursor-pointer'
          }`}
          color='primary'
          onClick={handleSubmit(onSubmit)}
          id='save-btn'
        >
          {isSubTask ? 'Save Subtask' : 'Save Task'}
        </Button>
        <UncontrolledTooltip placement='top' autohide={true} target='save-btn'>
          {isSubTask ? 'Save Subtask' : 'Save Task'}
        </UncontrolledTooltip>
        <Button
          className='cancel-btn'
          type='reset'
          color='secondary'
          outline
          onClick={() => setVisible(false)}
        >
          Close
        </Button>
      </div>
    </Form>
  );
};

export default AddQuickTask;
