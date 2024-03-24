import {
  Button,
  Col,
  Form,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from 'reactstrap';
import { FormField } from '@components/form-fields';
import { useForm, useWatch } from 'react-hook-form';
import { SNOZETASK_OPTIONS } from '../../../../constant';
import { SaveButton } from '../../../../@core/components/save-button';
import moment from 'moment';
import { useSnoozeTaskAPI } from '../service/task.services';
import { useEffect } from 'react';
import CustomDateAndTimePicker from '../../../../@core/components/form-fields/CustomDateAndTimePicker';

export const SnoozeTaskModal = (props) => {
  const { showSnoozeTaskModal, handleCloseSnoozeModal } = props;
  const {
    control,
    handleSubmit,
    getValues,
    clearErrors,
    setValue,
    setError,
    reset,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    defaultValues: { hideSnoozeTask: true, snoozeForEveryone: true },
  });
  const { snoozeTaskAPI, isLoading: snoozeLoading } = useSnoozeTaskAPI();

  const minDate = new Date(moment());

  const snoozeTime = useWatch({ control, name: 'snoozeTime' });

  useEffect(() => {
    reset({
      snoozeTime: { value: 'day', label: '1 Day' },
      hideSnoozeTask: true,
      snoozeForEveryone: true,
    });
  }, [showSnoozeTaskModal.taskDetail]);

  const onSnoozeTask = async (values) => {
    if (values?.snoozeTime?.value === 'custom' && !values?.snoozeCustomTime) {
      setError(
        `snoozeCustomTime`,
        {
          type: 'focus',
          message: `Select snooze end date.`,
        },
        { shouldFocus: true }
      );
      return false;
    }

    const tempObj = {};
    if (values?.snoozeTime?.value !== 'custom') {
      if (values?.snoozeTime?.value === 'day') {
        tempObj['snoozeUntil'] = new Date(moment().add(1, 'day')).toISOString();
      }
      if (values?.snoozeTime?.value === 'week') {
        tempObj['snoozeUntil'] = new Date(
          moment().add(1, 'week')
        ).toISOString();
      }
      if (values?.snoozeTime?.value === 'month') {
        tempObj['snoozeUntil'] = new Date(
          moment().add(1, 'month')
        ).toISOString();
      }
    } else {
      tempObj['snoozeUntil'] = new Date(values?.snoozeCustomTime).toISOString();
    }
    tempObj['hideSnoozeTask'] = values.hideSnoozeTask;
    tempObj['snoozeForEveryone'] = values?.snoozeForEveryone || false;
    const { data, error } = await snoozeTaskAPI({
      id: showSnoozeTaskModal?.taskDetail?._id,
      data: tempObj,
    });
    if (!error) {
      console.log({ data });
      handleCloseSnoozeModal(data);
    }
  };

  const customDate = useWatch({
    control,
    name: `snoozeCustomTime`,
  });
  return (
    <>
      <Modal
        isOpen={!!showSnoozeTaskModal.taskDetail}
        toggle={() => {
          handleCloseSnoozeModal();
        }}
        backdrop='static'
        className='modal-dialog-centered snooze-task-modal modal-dialog-mobile'
        size='sm'
        fade={false}
      >
        <ModalHeader
          toggle={() => {
            handleCloseSnoozeModal();
          }}
        >
          Snooze Task
        </ModalHeader>
        <ModalBody>
          <div>
            <Form
              className='auth-login-form'
              onSubmit={handleSubmit(onSnoozeTask)}
              autoComplete='off'
            >
              <Col className='mb-1'>
                <FormField
                  name='snoozeTime'
                  label='Snooze Duration'
                  placeholder='Select Timer'
                  type='select'
                  errors={errors}
                  control={control}
                  defaultValue={{ value: 'day', label: '1 Day' }}
                  options={[
                    ...SNOZETASK_OPTIONS,
                    { label: 'custom', value: 'custom' },
                  ]}
                />
              </Col>
              {snoozeTime && snoozeTime?.value === 'custom' && (
                <Col className='mb-1'>
                  <CustomDateAndTimePicker
                    className={`form-control ${
                      errors?.snoozeCustomTime?.message && 'is-invalid'
                    }`}
                    enableTime={false}
                    errors={errors}
                    name='snoozeCustomTime'
                    label='Snooze Date'
                    dateFormat={'MM-dd-Y hh:mm'}
                    value={customDate}
                    minDate={minDate}
                    showTimeInput={true}
                    onChange={(date) => {
                      clearErrors('snoozeCustomTime');
                      setValue('snoozeCustomTime', date);
                    }}
                  />
                </Col>
              )}
              <Col>
                <FormField
                  type='checkbox'
                  errors={errors}
                  control={control}
                  name='hideSnoozeTask'
                  defaultValue={getValues('hideSnoozeTask')}
                  key={getValues('hideSnoozeTask')}
                />
                <Label for='note' className='form-label fw-bold ms-1'>
                  Show only in snoozed tasks.
                </Label>
              </Col>
              <Col className='mt-1'>
                <Label className='d-block'>Snooze for everyone</Label>
                <div className='switch-checkbox'>
                  <Input
                    defaultChecked={getValues('snoozeForEveryone')}
                    type={'switch'}
                    inline='true'
                    onChange={(e) => {
                      setValue('snoozeForEveryone', e.target.checked);
                    }}
                  />
                  <span className='switch-design'></span>
                </div>
              </Col>
            </Form>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color='danger'
            onClick={() => {
              handleCloseSnoozeModal();
            }}
          >
            Close
          </Button>
          <Form
            className='auth-login-form'
            onSubmit={handleSubmit(onSnoozeTask)}
            autoComplete='off'
          >
            <SaveButton
              loading={snoozeLoading}
              width='180px'
              // outline={true}
              type='submit'
              color='primary'
              name={'Snooze Task'}
              className='align-items-center justify-content-center'
            ></SaveButton>
          </Form>
        </ModalFooter>
      </Modal>
    </>
  );
};
