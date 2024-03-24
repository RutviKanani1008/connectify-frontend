// ** Reactstrap Imports
import {
  Button,
  Form,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
} from 'reactstrap';

// ** Third Party Components
import { useForm } from 'react-hook-form';

// ** custom components
import { FormField } from '@components/form-fields';
import { SaveButton } from '../../../../@core/components/save-button';
import { getCurrentUser } from '../../../../helper/user.helper';
import {
  useCreateTaskOption,
  useUpdateTaskOption,
} from '../service/taskOption.services';
import { useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { required } from '../../../../configs/validationConstant';

const validationSchema = yup.object().shape({
  name: yup.string().required(required('Name')),
  color: yup.string().required(required('Color')),
});

export const TASK_AVAILABLE_OPTION = {
  status: 'status',
  priority: 'priority',
  category: 'category',
  label: 'label',
};

const TaskOptionModal = ({
  setShowTaskOptionModal,
  openTaskSidebar,
  selectedOption,
  handleClearOptions,
  detailsLoading = false,
  taskOptions,
  setTaskOptions,
  isFromTaskModal = false,
  currentSelectCategory = [],
  setCurrentSelectCategory,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
  } = useForm({
    defaultValues: { color: '#000000' },
    resolver: yupResolver(validationSchema),
  });

  const { createTaskOption, isLoading: createTaskOptionLoading } =
    useCreateTaskOption();
  const { updateTaskOption, isLoading: updateTaskOptionLoading } =
    useUpdateTaskOption();

  useEffect(() => {
    if (selectedOption.updated) {
      reset({
        name: selectedOption.updated?.label,
        color: selectedOption.updated?.color,
        markAsCompleted: selectedOption.updated?.markAsCompleted,
        helperText: selectedOption.updated?.helperText || null,
      });
    } else if (selectedOption.defaultText) {
      reset({
        name: selectedOption.defaultText,
        color: '#000000',
        markAsCompleted: false,
        helperText: null,
      });
    }
  }, [selectedOption]);

  const onSubmit = async (values) => {
    const formValue = JSON.parse(JSON.stringify(values));
    formValue.company = getCurrentUser()?.company?._id;
    formValue.color = values.color;
    formValue.markAsCompleted =
      selectedOption.optionType === TASK_AVAILABLE_OPTION.status
        ? values.markAsCompleted || false
        : false;
    formValue.type = selectedOption.optionType;
    formValue.helperText = values?.helperText || null;
    if (selectedOption.updated?._id) {
      const { error, data } = await updateTaskOption(
        selectedOption.updated?._id,
        formValue,
        `${
          selectedOption.optionType === TASK_AVAILABLE_OPTION.status
            ? 'Updating Status...'
            : selectedOption.optionType === TASK_AVAILABLE_OPTION.priority
            ? 'Updating Priority...'
            : selectedOption.optionType === TASK_AVAILABLE_OPTION.category
            ? 'Updating Category...'
            : 'Updating Label...'
        }`
      );
      if (!error) {
        let tempObj = JSON.parse(JSON.stringify(taskOptions));
        tempObj = tempObj.map((option) => {
          if (
            formValue.markAsCompleted &&
            selectedOption.optionType === TASK_AVAILABLE_OPTION.status &&
            String(option._id) !== String(selectedOption.updated?._id)
          ) {
            option.markAsCompleted = false;
          }
          if (String(option._id) === String(selectedOption.updated?._id)) {
            option = { ...data, value: data._id };
          }
          return option;
        });

        if (
          selectedOption.optionType === TASK_AVAILABLE_OPTION.category &&
          currentSelectCategory?.length
        ) {
          let tempCategory = JSON.parse(JSON.stringify(currentSelectCategory));
          tempCategory = tempCategory.map((option) => {
            if (String(option._id) === String(selectedOption.updated?._id)) {
              //
              option = { ...data, value: data._id };
            }
            return option;
          });
          setCurrentSelectCategory(tempCategory);
        }

        setTaskOptions(tempObj);
        handleClearOptions(data);
      }
    } else {
      formValue.order = 0;
      const { error, data } = await createTaskOption(
        formValue,
        `${
          selectedOption.optionType === TASK_AVAILABLE_OPTION.status
            ? 'Adding status...'
            : selectedOption.optionType === TASK_AVAILABLE_OPTION.priority
            ? 'Adding priority...'
            : selectedOption.optionType === TASK_AVAILABLE_OPTION.category
            ? 'Adding Category...'
            : 'Adding Label...'
        }`
      );
      if (!error && data) {
        if (isFromTaskModal) {
          setTaskOptions([data, ...taskOptions]);
        } else {
          setTaskOptions([...taskOptions, { ...data, value: data._id }]);
        }
        handleClearOptions(data);
      }
    }
  };

  const ModalFooter1 = () => {
    return (
      <SaveButton
        loading={createTaskOptionLoading || updateTaskOptionLoading}
        disabled={createTaskOptionLoading || updateTaskOptionLoading}
        width='100px'
        color='primary'
        name={'Submit'}
        type='submit'
      ></SaveButton>
    );
  };

  return (
    <Modal
      isOpen={openTaskSidebar}
      toggle={() => setShowTaskOptionModal(!openTaskSidebar)}
      className='modal-dialog-centered add-status-priority-category-modal modal-dialog-mobile'
      backdrop='static'
    >
      <ModalHeader
        toggle={() => {
          handleClearOptions();
        }}
      >
        {selectedOption.optionType === TASK_AVAILABLE_OPTION.status
          ? `${selectedOption.updated ? 'Update Status' : 'Add Status'}`
          : selectedOption.optionType === TASK_AVAILABLE_OPTION.priority
          ? `${selectedOption.updated ? 'Update Priority' : 'Add Priority'}`
          : selectedOption.optionType === TASK_AVAILABLE_OPTION.category
          ? `${selectedOption.updated ? 'Update Category' : 'Add Category'}`
          : `${selectedOption.updated ? 'Update Label' : 'Add Label'}`}
      </ModalHeader>
      <ModalBody className=''>
        {detailsLoading ? (
          <div className='mt-2 mb-2 text-center'>
            <Spinner />
          </div>
        ) : (
          <>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <div className='status-priority-category-color-wrapper'>
                <div className='field-name-wrapper'>
                  <FormField
                    name='name'
                    label={`${
                      selectedOption.optionType === TASK_AVAILABLE_OPTION.status
                        ? 'Status Name'
                        : selectedOption.optionType ===
                          TASK_AVAILABLE_OPTION.priority
                        ? 'Priority Name'
                        : selectedOption.optionType ===
                          TASK_AVAILABLE_OPTION.category
                        ? 'Category Name'
                        : 'Label Name'
                    }   `}
                    placeholder={`${
                      selectedOption.optionType === TASK_AVAILABLE_OPTION.status
                        ? 'Status Name'
                        : selectedOption.optionType ===
                          TASK_AVAILABLE_OPTION.priority
                        ? 'Priority Name'
                        : selectedOption.optionType ===
                          TASK_AVAILABLE_OPTION.category
                        ? 'Category Name'
                        : 'Label Name'
                    }   `}
                    type='text'
                    errors={errors}
                    control={control}
                  />
                </div>
                <div className='color-wrapper'>
                  <label className='form-label form-label'>Pick Color</label>
                  <div className='inputType-color-round'>
                    <div className='inner-wrapper'>
                      <FormField
                        name='color'
                        type='color'
                        errors={errors}
                        control={control}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className='mt-1'>
                <FormField
                  name='helperText'
                  label='Helper Text'
                  placeholder='Enter Helper Text'
                  type='text'
                  errors={errors}
                  control={control}
                  defaultValue={getValues('helperText')}
                />
              </div>
              {selectedOption.optionType === 'status' && (
                <div className='marked-checkbox'>
                  <FormField
                    name='markAsCompleted'
                    label=''
                    placeholder='option name'
                    type='checkbox'
                    errors={errors}
                    control={control}
                    defaultValue={getValues('markAsCompleted')}
                  />
                  <span className='label'>
                    Mark as archived on moving task to this{' '}
                    {selectedOption.optionType === TASK_AVAILABLE_OPTION.status
                      ? 'Status'
                      : selectedOption.optionType ===
                        TASK_AVAILABLE_OPTION.priority
                      ? 'Priority'
                      : selectedOption.optionType ===
                        TASK_AVAILABLE_OPTION.category
                      ? 'Category'
                      : 'Label'}
                  </span>
                </div>
              )}
            </Form>
          </>
        )}
      </ModalBody>

      <ModalFooter>
        <Button
          color='danger'
          onClick={() => {
            handleClearOptions();
          }}
        >
          Cancel
        </Button>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <ModalFooter1 />
        </Form>
      </ModalFooter>
    </Modal>
  );
};

export default TaskOptionModal;
