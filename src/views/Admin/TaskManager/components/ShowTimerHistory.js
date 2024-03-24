import _ from 'lodash';
import * as yup from 'yup';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Button,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from 'reactstrap';
import InputMask from 'react-input-mask';

import { userData } from '../../../../redux/user';
import { required } from '../../../../configs/validationConstant';
import {
  useCreateTaskTimerHistory,
  useDeleteTaskTimer,
  useGetTaskTimerHistory,
  useUpdateTaskTimerHistory,
} from '../service/taskTimer.services';
import { useGetCompanyUsers } from '../service/userApis';
import { showWarnAlert } from '../../../../helper/sweetalert.helper';

import useTaskTimerColumn from '../hooks/useTaskTimerColumns';
import { FormField } from '../../../../@core/components/form-fields';
import { SaveButton } from '../../../../@core/components/save-button';
import ItemTable from '../../../../@core/components/data-table';
import ExportData from '../../../../components/ExportData';
import CustomDatePicker from '../../../../@core/components/form-fields/CustomDatePicker';

const timerSchema = yup.object().shape({
  startedBy: yup
    .object()
    .shape({
      label: yup.string().required('Required'),
      value: yup.string().required('Required'),
    })
    .required(required('Started By'))
    .nullable(),
  endedBy: yup
    .object()
    .shape({
      label: yup.string().required('Required'),
      value: yup.string().required('Required'),
    })
    .required(required('Ended By'))
    .nullable(),
});

export const ShowTimerHistory = ({
  showTimerHistoryModal,
  handleCloseTimerHistoryModal,
  task,
}) => {
  const user = useSelector(userData);

  const startTime = new Date(new Date().setHours(0, 0, 0, 0)).getTime();

  const defaultValues = {
    startedAt: startTime,
    endedAt: startTime + 10 * 60 * 1000,
    startedBy: null,
    endedBy: null,
    totalTime: '00:10:00' /* 10 min */,
    note: null,
  };

  const formData = useForm({
    resolver: yupResolver(timerSchema),
    defaultValues,
  });

  const {
    watch,
    setValue,
    setError,
    clearErrors,
    reset,
    control,
    formState,
    handleSubmit,
  } = formData;

  const startDate = watch('startedAt');
  const endDate = watch('endedAt');

  const { getCompanyUsers } = useGetCompanyUsers();

  const { getTaskTimerHistory, isLoading: taskTimerHistoryLoading } =
    useGetTaskTimerHistory();
  const { createTaskTimerHistory, isLoading: createLoader } =
    useCreateTaskTimerHistory();
  const { updateTaskTimerHistory, isLoading: updateLoader } =
    useUpdateTaskTimerHistory();

  const { deleteTaskTimer, isLoading: deleteLoader } = useDeleteTaskTimer();

  const [taskTimerHistory, setTaskTimerHistory] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [showEdit, setShowEdit] = useState(null);
  const [timeFormat, setTimeFormat] = useState('99:99:99');

  const convertToTime = (hr, min, ss) => {
    if (!isNaN(hr) || !isNaN(min) || !isNaN(ss)) {
      return hr * 60 * 60 * 1000 + min * 60 * 1000 + ss * 1000;
    }
  };

  const handleTimeChange = (event) => {
    const newTimeValue = event.target.value;
    setValue('totalTime', newTimeValue);

    const [hours, minutes, seconds] = newTimeValue.split(':').map(Number);
    if (
      isNaN(hours) ||
      isNaN(minutes) ||
      isNaN(seconds) ||
      hours < 0 ||
      minutes < 0 ||
      minutes > 59 ||
      seconds < 0 ||
      seconds > 59
    ) {
      setError('totalTime', { message: 'Invalid time format or values.' });
    } else {
      clearErrors('totalTime');

      /* Value greater than endedat */
      const diff = endDate - startDate;
      const totalMs = convertToTime(hours, minutes, seconds);
      if (totalMs && totalMs > diff) {
        setError('totalTime', {
          message: 'Time spend value greater than EndedAt.',
        });
      }
    }
  };

  const getTimerHistory = async () => {
    const { data, error } = await getTaskTimerHistory({
      task,
      sort: { startedAt: -1 },
      select:
        'startedAt,endedAt,startedBy,endedBy,task,totalTime,note,currentStatus',
    });
    if (!error && data) {
      setTaskTimerHistory(data?.taskTimer || []);
    }
  };

  useEffect(() => {
    getTimerHistory();
  }, [task]);

  useEffect(() => {
    loadCompanyUsers();
  }, []);

  /* Update total time */
  useEffect(() => {
    const diff = endDate - startDate;
    const { timeFormat, formattedTime } = getTimeFormatAndFormattedTime(diff);
    setTimeFormat(timeFormat);

    clearErrors('totalTime');
    setValue('totalTime', formattedTime);
  }, [startDate, endDate]);

  /** Get Available User */
  const loadCompanyUsers = async () => {
    const companyId = user?.company._id;

    const { data: userData, error: userError } = await getCompanyUsers(
      companyId,
      { select: 'firstName,lastName' }
    );

    if (_.isArray(userData) && !userError) {
      const users = userData.map((contact) => {
        return {
          label: `${contact?.firstName ?? ''} ${contact?.lastName ?? ''} ${
            contact?._id === user?._id ? '(Me)' : ''
          }`,
          value: contact._id,
        };
      });
      setAvailableUsers(users);
    }
  };

  const { columns } = useTaskTimerColumn({
    deleteLoader,
    handleRowEdit,
    handleRowDelete,
  });

  async function handleRowEdit(rowId) {
    const editHistory = taskTimerHistory.find((t) => rowId === t._id);

    if (!editHistory) {
      return;
    }

    const { startedAt, endedAt, startedBy, endedBy, note } = editHistory;

    const diff = endedAt - startedAt;
    const { timeFormat, formattedTime } = getTimeFormatAndFormattedTime(diff);
    const startedByUser = availableUsers.find((u) => startedBy._id === u.value);
    const endedByUser = availableUsers.find((u) => endedBy._id === u.value);

    const editValues = {
      startedAt,
      endedAt,
      startedBy: startedByUser,
      endedBy: endedByUser,
      totalTime: formattedTime,
      note,
    };

    reset(editValues);
    setTimeFormat(timeFormat);
    setShowEdit(rowId);
  }

  async function handleRowDelete(rowId) {
    const result = await showWarnAlert({
      title: 'Are you sure?',
      text: 'Are you sure you would like to delete this timer history?',
    });

    if (result.value) {
      const { error } = await deleteTaskTimer(rowId);
      if (!error) {
        setTaskTimerHistory((prev) => prev.filter((t) => t._id !== rowId));
      }
    }
  }

  const getTimeFormatAndFormattedTime = (totalTime) => {
    const hours = Math.floor(totalTime / 3600000);

    const remainingMilliseconds = totalTime % 3600000;
    const minutes = Math.floor(remainingMilliseconds / 60000);
    const seconds = Math.floor((remainingMilliseconds % 60000) / 1000);

    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    const hrLength = `${hours}`.length;

    let timeFormat = `99:99:99`;
    if (hrLength > 2 && hrLength !== timeFormat.split(':')[0].length) {
      const hrFormat = Array.from({ length: hrLength }).reduce(
        (format) => `${format}9`,
        ''
      );
      timeFormat = `${hrFormat}:99:99`;
    }

    return { timeFormat, formattedTime };
  };

  const onSubmit = async (formData) => {
    const { startedAt, startedBy, endedAt, endedBy, totalTime, note } =
      formData;

    const [hours, minutes, seconds] = totalTime.split(':').map(Number);
    const paramsData = {
      task,
      startedAt,
      endedAt,
      startedBy: startedBy.value,
      endedBy: endedBy.value,
      totalTime: convertToTime(hours, minutes, seconds),
      note,
    };

    if (showEdit === -1) {
      const { data, error } = await createTaskTimerHistory(paramsData);
      if (!error) {
        setShowEdit(null);
        reset(defaultValues);
        setTaskTimerHistory((prev) => {
          return [...prev, data]
            .slice()
            .sort((a, b) => b.startedAt - a.startedAt);
        });
      }
    } else {
      const { data, error } = await updateTaskTimerHistory(
        showEdit,
        paramsData
      );
      if (!error) {
        setShowEdit(null);
        reset(defaultValues);
        setTaskTimerHistory((prev) => {
          return prev
            .map((t) => (t._id === showEdit ? { ...data } : { ...t }))
            .sort((a, b) => b.startedAt - a.startedAt);
        });
      }
    }
  };

  const handleClose = () => handleCloseTimerHistoryModal();

  return (
    <Modal
      isOpen={showTimerHistoryModal}
      toggle={() => handleClose()}
      className={`modal-dialog-centered timer-history-modal ${
        showEdit !== null ? 'form-enable' : ''
      }`}
      backdrop='static'
      size='xl'
    >
      <ModalHeader
        toggle={() => {
          handleClose();
        }}
      >
        <div className='d-flex'>Timer History</div>
      </ModalHeader>
      <ModalBody className=''>
        <div className='main-wrapper'>
          <div className='left-table-wrapper'>
            <div className='inner-wrapper'>
              <div className='top-header-wrapper'>
                <h2 className='title'>Timer History</h2>
                <div className='buttons-wrapper'>
                  <ExportData
                    isDisabled={taskTimerHistory.length ? false : true}
                    model='taskTimer'
                    query={{ task, sort: { startedAt: -1 } }}
                  />
                  {showEdit === null || showEdit !== -1 ? (
                    <Button
                      className='add-new-btn'
                      color='primary'
                      onClick={() => {
                        reset(defaultValues);
                        setShowEdit(-1);
                      }}
                    >
                      Add New
                    </Button>
                  ) : null}
                </div>
              </div>
              <div className='timer-table-wrapper'>
                <ItemTable
                  hideExport
                  hideButton
                  columns={columns}
                  data={taskTimerHistory}
                  itemsPerPage={10}
                  showPagination={false}
                  loading={taskTimerHistoryLoading}
                  showSearch={false}
                />
              </div>
            </div>
          </div>
          {showEdit !== null && (
            <>
              <div className='right-form-wrapper'>
                <div className='inner-wrapper'>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className='form-field-wrapper'>
                      <CustomDatePicker
                        renderInBody
                        enableTime={true}
                        name='startedAt'
                        label='Started At'
                        value={startDate}
                        onChange={([date]) => {
                          const newTime = new Date(date).getTime();
                          setValue('startedAt', newTime);

                          if (newTime > endDate) {
                            const newEndTime = newTime + 10 * 60 * 1000;
                            setValue('endedAt', newEndTime);
                          }
                        }}
                      />
                    </div>
                    <div className='form-field-wrapper'>
                      <FormField
                        key={watch('startedBy')}
                        label='Started By'
                        name='startedBy'
                        placeholder='Started By'
                        type='select'
                        classNamePrefix='custom-select'
                        errors={formState.errors}
                        control={control}
                        options={availableUsers}
                      />
                    </div>
                    <div className='form-field-wrapper'>
                      <CustomDatePicker
                        renderInBody
                        enableTime={true}
                        name='endedAt'
                        label='Ended At'
                        value={endDate}
                        onChange={([date]) => {
                          const newTime = new Date(date).getTime();
                          setValue('endedAt', newTime);

                          if (newTime <= startDate) {
                            /* Less than start date */
                            const newEndTime = startDate + 10 * 60 * 1000;
                            setValue('endedAt', newEndTime);
                          }
                        }}
                        options={{
                          enable: [
                            function (date) {
                              return date >= moment(startDate).startOf('day');
                            },
                          ],
                        }}
                      />
                    </div>
                    <div className='form-field-wrapper'>
                      <FormField
                        key={watch('endedBy')}
                        label='Ended By'
                        name='endedBy'
                        placeholder='Ended By'
                        type='select'
                        classNamePrefix='custom-select'
                        errors={formState.errors}
                        control={control}
                        options={availableUsers}
                      />
                    </div>
                    <div className='form-field-wrapper'>
                      <Label className='form-label'>Time Spend</Label>
                      <InputMask
                        className='form-control'
                        mask={timeFormat}
                        placeholder='hh:mm'
                        alwaysShowMask={true}
                        value={watch('totalTime')}
                        onChange={handleTimeChange}
                      />
                      {formState.errors.totalTime && (
                        <p style={{ color: 'red' }}>
                          {formState.errors.totalTime.message}
                        </p>
                      )}
                    </div>
                    <div className='form-field-wrapper'>
                      <FormField
                        label='Note'
                        name='note'
                        type='textarea'
                        placeholder='Note'
                        control={control}
                        errors={formState.errors}
                      />
                    </div>
                    <div className='btns-wrapper'>
                      <SaveButton
                        disabled={
                          createLoader ||
                          updateLoader ||
                          Object.keys(formState.errors).length
                        }
                        loading={showEdit === -1 ? createLoader : updateLoader}
                        type='submit'
                        color='primary'
                        name={showEdit === -1 ? 'Add' : 'Update'}
                        className='add-btn'
                      />
                      {showEdit !== null ? (
                        <Button
                          className='cancel-btn'
                          onClick={() => setShowEdit(null)}
                        >
                          Cancel
                        </Button>
                      ) : null}
                    </div>
                  </form>
                </div>
              </div>
            </>
          )}
        </div>
      </ModalBody>
      <ModalFooter>
        <Button
          className='close-btn'
          type='reset'
          color='secondary'
          outline
          onClick={handleClose}
        >
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ShowTimerHistory;
