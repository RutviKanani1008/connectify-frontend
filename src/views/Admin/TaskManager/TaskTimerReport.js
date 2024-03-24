import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Form,
  Row,
} from 'reactstrap';
import CustomDatePicker from '../../../@core/components/form-fields/CustomDatePicker';
import { useForm } from 'react-hook-form';
import moment from 'moment';
import AsyncContactSelect from '../billing/Quote/components/AsyncContactSelect';
import { selectThemeColors } from '../../../utility/Utils';
import {
  contactOptionComponent,
  contactSingleValue,
} from '../../forms/component/OptionComponent';
// import { Label } from 'recharts';
import { SaveButton } from '../../../@core/components/save-button';
import ItemTable from '../../../@core/components/data-table';
import { useState, useEffect } from 'react';
import { ChevronDown, Download } from 'react-feather';
import ReactApexChart from 'react-apexcharts';
import { useTaskTimerReports } from './hooks/useTaskTimerReport';
import TaskModal from '../TaskManager/components/TaskModal/TaskModal';
import { useGetTaskOptions } from './hooks/useGetTaskOptions';
import { useCreateTaskNotifyUsers } from './service/taskNotifyUsers.services';
import { useGetCompanyUsers } from './service/userApis';
import { useSelector } from 'react-redux';
import { userData } from '../../../redux/user';
import _ from 'lodash';

const TaskTimerReport = ({ extraFilers = {}, currentPage = null }) => {
  const user = useSelector(userData);

  const {
    handleSubmit,
    setValue,
    clearErrors,
    getValues,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: {
      startDate: moment().clone().startOf('month').format('YYYY-MM-DD'),
      endDate: moment().clone().endOf('month').format('YYYY-MM-DD'),
    },
  });

  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const [availableTaskTimerReport, setAvailableTaskTimerReport] = useState([]);
  const [availableGraphTaskTimerReport, setAvailableGraphTaskTimerReport] =
    useState([]);
  const [openTaskDetail, setOpenTaskDetails] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(null);

  const { handleSearchReport, taskTimerReportLoading, handleGetTimerReport } =
    useTaskTimerReports({
      setAvailableGraphTaskTimerReport,
      setAvailableTaskTimerReport,
      values: getValues(),
      setError,
      currentStartDate: moment(getValues('startDate')).valueOf(),
      currentEndDate: moment(getValues('endDate')).valueOf(),
      extraFilers: {
        ...extraFilers,
      },
    });

  const { notifyUsers } = useCreateTaskNotifyUsers();
  const { getCompanyUsers } = useGetCompanyUsers();

  const { getTaskOptions, taskOptions, setTaskOptions } = useGetTaskOptions({});

  useEffect(() => {
    handleSearchReport({
      ...getValues(),
      startDate: moment(getValues('startDate')).valueOf(),
      endDate: moment(getValues('endDate')).valueOf(),
    });
  }, []);

  const onSubmit = async (values) => {
    let isAnyError = false;
    if (!values.startDate || !values.endDate) {
      setError(
        `date`,
        { type: 'focus', message: `Select Start and End Date.` },
        { shouldFocus: true }
      );
      isAnyError = true;
    }

    if (!isAnyError) {
      handleSearchReport({
        ...values,
        startDate: moment(values.startDate).valueOf(),
        endDate: moment(values.endDate).valueOf(),
        contact: values?.contact?.value,
      });
    } else {
      return false;
    }
  };

  const convertMilisecondsToTotalHours = (miliseconds) => {
    const milliseconds = miliseconds;
    const duration = moment.duration(milliseconds);

    const hours = Math.floor(duration.asHours()).toString().padStart(2, '0');
    const minutes = duration.minutes().toString().padStart(2, '0');
    const seconds = duration.seconds().toString().padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
  };

  const contactColumn = [
    {
      name: 'Task Number',
      minWidth: '250px',
      sortable: (row) => row?.task?.taskNumber,
      selector: (row) => row?.task?.taskNumber,
      cell: (row) => {
        return (
          <div
            onClick={async () => {
              if (!taskOptions?.length) {
                await getTaskOptions();
              }
              setOpenTaskDetails(row?.task);
              setShowTaskModal(true);
            }}
          >
            <span className='task-number'>
              {!row.isGrandTotal && `#${row?.task?.taskNumber}`}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Task Name',
      sortable: true,
      minWidth: '250px',
      selector: (row) => row?.task?.name,
      cell: (row) => {
        return (
          <div>
            <span className='cursor-pointer'>{row?.task?.name}</span>
          </div>
        );
      },
    },
    {
      name: 'Company Name',
      sortable: true,
      minWidth: '250px',
      selector: (row) => row?.task?.contact?.company_name,
      cell: (row) => {
        const { contact } = row?.task;

        return (
          <div>
            <span className='cursor-pointer'>
              {contact?.company_name || ''}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Contact Name',
      sortable: true,
      minWidth: '250px',
      selector: (row) => row?.task?.name,
      cell: (row) => {
        const { contact } = row?.task;
        return (
          <div>
            <span className='cursor-pointer'>
              {contact?.firstName || contact?.lastName ? (
                <>
                  {contact?.firstName || ''} {contact?.firstName || ''}
                </>
              ) : contact?.email ? (
                <>{contact?.email || ''}</>
              ) : (
                ''
              )}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Duration',
      sortable: true,
      minWidth: '250px',
      selector: (row) => row?.totalDuration,
      cell: (row) => {
        return (
          <div>
            <span className='total-time-spent'>
              {convertMilisecondsToTotalHours(row?.totalDuration)}
            </span>
          </div>
        );
      },
    },
  ];

  const options = {
    chart: {
      type: 'bar',
      height: 350,
    },
    xaxis: {
      type: 'datetime',
    },
    tooltip: {
      custom: ({ seriesIndex, dataPointIndex, w }) => {
        const { tasksInfo } =
          w.config?.series[seriesIndex]?.data?.[dataPointIndex]?.[2] || [];
        const labelHtml = tasksInfo
          .map((task) => {
            return `<div className='custom-tooltip-label'><span class="taskId">#${
              task.taskNumber
            }:</span> <span class="value">${Number(task?.duration)?.toFixed(
              2
            )} Hours</span></div>`;
          })
          .join('');

        return (
          `<div class="chart-custom-tooltip">
            <h3 class="title">Task Report</h3>
            <div class="cn__body">` +
          `
              ${labelHtml}` +
          `
            </div>
          </div>`
        );
      },
    },
    series: [
      {
        name: 'Hours',
        data: availableGraphTaskTimerReport?.length
          ? availableGraphTaskTimerReport?.map((item) => [
              moment
                .utc(item.date)
                .utcOffset(0)
                .set({ hour: 0, minute: 0, second: 0, millisecond: 0 }),
              Number(Number(item?.totalDuration).toFixed(1)),
              { tasksInfo: item.tasksInfo },
            ])
          : [],
      },
    ],
  };

  const handleExportTimerReport = () => {
    if (availableTaskTimerReport?.length) {
      let result;
      const columnDelimiter = ',';
      const lineDelimiter = '\n';
      const keys = ['Task Number', 'Task Name', 'Duration'];
      result = '';
      result += keys.join(columnDelimiter);
      result += lineDelimiter;
      availableTaskTimerReport.forEach((item) => {
        let ctr = 0;
        keys.forEach((key) => {
          if (key === 'Task Number') {
            if (ctr > 0) result += columnDelimiter;
            result += !item.isGrandTotal ? item?.task?.taskNumber : '';
            ctr++;
          }
          if (key === 'Task Name') {
            if (ctr > 0) result += columnDelimiter;
            result += item?.task?.name;
            ctr++;
          }
          if (key === 'Duration') {
            if (ctr > 0) result += columnDelimiter;
            result += convertMilisecondsToTotalHours(item?.totalDuration);
            ctr++;
          }
        });
        result += lineDelimiter;
      });
      return result;
    }
  };

  function downloadCSV() {
    const link = document.createElement('a');
    let csv = handleExportTimerReport();
    if (csv === null) return;
    const filename = 'export.csv';
    if (!csv.match(/^data:text\/csv/i)) {
      csv = `data:text/csv;charset=utf-8,${csv}`;
    }
    link.setAttribute('href', encodeURI(csv));
    link.setAttribute('download', filename);
    link.click();
  }

  const notifyUserForNewTask = async ({ id: taskId, assigned }) => {
    const { data, error } = await getCompanyUsers(user?.company._id, {
      select: 'firstName,lastName,role',
      role: 'admin',
    });

    if (!error && data) {
      const notifyUsersList = data
        .map((d) => d._id)
        .filter((id) => id !== user?._id);

      if (assigned && _.isArray(assigned)) {
        assigned.forEach((a) => {
          if (!notifyUsersList.includes(a._id)) {
            notifyUsersList.push(a._id);
          }
        });
      }

      const notifyUsersIds = notifyUsersList.filter((n) => n._id !== user?._id);
      if (notifyUsersIds?.length) {
        await notifyUsers({ taskId, userIds: notifyUsersIds });
      }
    }
  };
  return (
    <>
      <div className='task-report-page'>
        <Card>
          <CardHeader className={` ${isFilterVisible ? 'filter-active' : ''}`}>
            <CardTitle>Task Report</CardTitle>
            <div className='right-wrapper'>
              <CustomDatePicker
                name='start'
                mode={'range'}
                enableTime={false}
                // dateFormat='Y-m-d G:i K '
                dateFormat='Y-m-d'
                value={[getValues('startDate'), getValues('endDate')]}
                options={{ mode: 'range' }}
                onChange={(date) => {
                  if (
                    date?.length === 2 &&
                    moment(date?.[1]).format('YYYY-MM-DD') >
                      moment(date?.[0]).format('YYYY-MM-DD')
                  ) {
                    setValue(
                      'startDate',
                      moment(date?.[0]).format('YYYY-MM-DD')
                    );
                    setValue('endDate', moment(date?.[1]).format('YYYY-MM-DD'));
                    clearErrors('date');
                  }
                }}
              />
              {!currentPage && (
                <div className='contact-modal'>
                  <AsyncContactSelect
                    isClearable
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
                    onChange={(data) => {
                      clearErrors('contact');
                      setValue('contact', data);
                    }}
                    value={getValues('contact')}
                    components={{
                      Option: contactOptionComponent,
                      SingleValue: contactSingleValue,
                    }}
                  />
                  {errors['contact'] ? (
                    <div className='text-danger'>
                      {errors['contact']?.message}
                    </div>
                  ) : null}
                </div>
              )}
              <SaveButton
                width='150px'
                className='submit-btn'
                loading={taskTimerReportLoading}
                disabled={taskTimerReportLoading}
                color='primary'
                name={'Show Report'}
                onClick={handleSubmit(onSubmit)}
              />
              <Button
                className='export-btn'
                loading={taskTimerReportLoading}
                disabled={taskTimerReportLoading}
                color='primary'
                onClick={() => {
                  downloadCSV();
                }}
              >
                <Download />
                Export
              </Button>
            </div>
            <div
              onClick={() => {
                setIsFilterVisible(!isFilterVisible);
              }}
              className='mobile-toggle-header-btn'
            >
              <ChevronDown />
            </div>
          </CardHeader>
          <CardBody className=''>
            <div className='task-report-chart-wrapper'>
              <div className='heading'>
                <h2 className='title'>Time spent per day</h2>
              </div>
              <div className='chart-wrapper'>
                <ReactApexChart
                  options={options}
                  series={options.series}
                  type='bar'
                  height={350}
                />
              </div>
            </div>
            <div className='task-report-table-wrapper'>
              <div className='heading'>
                <h2 className='title'>Time spent per day</h2>{' '}
              </div>
              <Form onSubmit={handleSubmit(onSubmit)}>
                <div>
                  <Row>
                    <ItemTable
                      showSearch={false}
                      showHeader={false}
                      columns={contactColumn}
                      data={availableTaskTimerReport}
                      showCard={false}
                      title={''}
                      addItemLink={false}
                      hideButton={true}
                      // itemsPerPage={10}
                      loading={taskTimerReportLoading}
                      hideExport={true}
                      showPagination={false}
                    />
                  </Row>
                </div>
              </Form>
            </div>
          </CardBody>
        </Card>
      </div>
      {openTaskDetail && (
        <TaskModal
          setOpen={() => {}}
          currentFilter={{}}
          setCurrentTasks={() => {}}
          setShowTaskModal={setShowTaskModal}
          showTaskModal={showTaskModal}
          taskOptions={taskOptions}
          setTaskOptions={setTaskOptions}
          currentTasks={[]}
          handleClearAddUpdateTask={() => {
            console.log('in handleClearAddUpdateTask');
            setOpenTaskDetails(null);
            setShowTaskModal(false);
            handleGetTimerReport();
          }}
          notifyUserForNewTask={notifyUserForNewTask}
          setCurrentTaskPagination={() => {}}
          editTask={openTaskDetail}
          setUpdateTask={setOpenTaskDetails}
        />
      )}
    </>
  );
};

export default TaskTimerReport;
