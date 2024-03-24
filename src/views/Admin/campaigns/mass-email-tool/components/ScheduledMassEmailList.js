// ==================== Packages =======================
import React, {
  forwardRef,
  useEffect,
  useState,
  useImperativeHandle,
  useRef,
  useMemo,
} from 'react';
import { useSelector } from 'react-redux';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Row,
  Button,
} from 'reactstrap';
import * as yup from 'yup';
// ====================================================
import UILoader from '@components/ui-loader';
import { userData } from '../../../../../redux/user';
import { showWarnAlert } from '../../../../../helper/sweetalert.helper';
import ScheduledMassEmailCard from './ScheduledMassEmailCard';
import useScheduledMassEmailColumns from '../hooks/useScheduledMassEmailColumns';
import { restructureScheduledMailCSVData } from '../../../../../helper/mass-email.helper';
import {
  useCancelScheduledMail,
  useGetScheduledMails,
  useGetScheduleMailForCloneScheduleMail,
} from '../service/scheduledMassEmail.services';
import ScheduledMailEditViewModal from './ScheduledMailEditViewModal';
// import ExportData from '../../../../../components/ExportData';

import { CloneEmailBlast } from './CloneEmailBlastModal';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { required } from '../../../../../configs/validationConstant';
import { useGetEmailSenderAPI } from '../service/emailSender.service';
import moment from 'moment';
import { FORM_SCHEDULE_TIMER } from '../../../../../constant';
import { showToast, TOASTTYPES } from '@src/utility/toast-helper';
import { sendMassEmailWithoutSave } from '../../../../../api/massEmail';
import useMassEmailHelper from '../hooks/useMassEmailHelper';
import { useGetContactsForCloneMassEmail } from '../../../contact/hooks/useContactService';
import { selectSocket } from '../../../../../redux/common';
import { ChevronDown } from 'react-feather';
import ServerSideTable from '../../../../../@core/components/data-table/ServerSideTable';

const unAssignFilter = {
  id: 'UnassignedItem',
  value: 'Unassigned',
  label: 'Unassigned',
};

const massEmailSchema = yup.object().shape({
  template: yup
    .object()
    .shape({
      label: yup.string().required('Required'),
      value: yup.string().required('Required'),
    })
    .required('Template is required.')
    .nullable(),
  fromEmail: yup
    .object()
    .shape({
      label: yup.string().email().required('Required'),
      value: yup.string().email().required('Required'),
    })
    .required(required('From Email'))
    .nullable(),
});

const ScheduledMassEmailList = forwardRef(
  ({ activeView, reFetchScheduledMassEmailJobs }, ref) => {
    // ========================== Hooks =========================
    const user = useSelector(userData);
    const socket = useSelector(selectSocket);
    const scheduledMassEmailRef = useRef(null);

    const {
      control,
      handleSubmit,
      setValue,
      getValues,
      clearErrors,
      reset,
      setError,
      formState: { errors },
    } = useForm({
      resolver: yupResolver(massEmailSchema),
      mode: 'onBlur',
    });

    // ============================== states ============================
    const [isMassEmailSent, setIsMassEmailSent] = useState('');
    const [sendingMassEmail, setSendingMassEmail] = useState(false);
    const [cloneMailBlastId, setCloneMailBlastId] = useState();
    const [fetchLoading, setFetchLoading] = useState(false);
    const [scheduledMassEmails, setScheduledMassEmails] = useState({
      data: [],
      totalScheduledMassEmails: 0,
    });
    const scheduledMassEmailsRef = useRef(scheduledMassEmails.data);
    scheduledMassEmailsRef.current = scheduledMassEmails.data;

    const [editViewModal, setEditViewModal] = useState({
      isOpen: false,
      mode: '',
      id: '',
    });
    const [selectedContact, setSelectedContact] = useState({
      checkAll: false,
      checkAllPages: false,
      selectedContact: {},
      unSelectedContact: {},
    });

    const [scheduledMassEmailPagination, setScheduledMassEmailPagination] =
      useState({
        page: 1,
        limit: 6,
      });

    const [filterValue, setFilterValue] = useState({
      group: [],
      status: [unAssignFilter],
      category: [unAssignFilter],
      tags: [unAssignFilter],
      pipeline: [unAssignFilter],
      stage: [],
    });

    // ========================== Custom Hooks =========================
    const { scheduledMassEmailColumns } = useScheduledMassEmailColumns();
    const { getScheduledMails, isLoading } = useGetScheduledMails({
      setScheduledMassEmails,
      setScheduledMassEmailPagination,
      scheduledMassEmails,
      activeView,
    });
    const { cancelScheduledMail } = useCancelScheduledMail({
      getScheduledMails,
      user,
    });
    const { getEmailSenderAPI, isLoading: checkingSendingMail } =
      useGetEmailSenderAPI();
    const { getScheduleMailForCloneScheduleMail } =
      useGetScheduleMailForCloneScheduleMail();

    const { handleChangeFilter, currentFilter, setCurrentFilter } =
      useMassEmailHelper({
        filterValue,
        setFilterValue,
        unAssignFilter,
      });

    useEffect(() => {
      setScheduledMassEmails({
        data: [],
        totalScheduledMassEmails: 0,
      });
      if (activeView === 'grid') {
        getScheduledMails({
          company: user?.company?._id ? user?.company?._id : null,
          page: 1,
          limit: 6,
        });
      }
    }, [activeView]);

    const {
      getContactsForCloneMassEmail: getContacts,
      contactsData,
      isLoading: getContactIsLoading,
    } = useGetContactsForCloneMassEmail({
      initialQuery: {
        select: 'firstName,lastName,email,group,hasUnsubscribed',
        archived: false,
        limit: 9,
      },
      previousDataStore: true,
    });

    const selectedCheckedContactIds = useMemo(() => {
      return Object.keys(selectedContact.selectedContact).filter(
        (key) => selectedContact.selectedContact[key]
      );
    }, [selectedContact]);

    const unSelectedContactIds = useMemo(() => {
      if (!selectedContact.checkAllPages) {
        return [];
      }
      return Object.keys(selectedContact.unSelectedContact).filter(
        (key) => selectedContact.unSelectedContact[key]
      );
    }, [selectedContact]);

    const selectedCount = useMemo(() => {
      if (!selectedContact.checkAllPages) {
        return selectedCheckedContactIds.length;
      }

      return (
        contactsData.total -
        contactsData.unsSubscribedCount -
        unSelectedContactIds.length
      );
    }, [
      contactsData,
      selectedContact,
      selectedCheckedContactIds,
      unSelectedContactIds,
    ]);

    const isAllNotSelected = useMemo(() => {
      if (
        !selectedCheckedContactIds.length ||
        selectedCheckedContactIds.length === contactsData.total
      ) {
        return false;
      }

      if (!selectedContact.checkAllPages) {
        return true;
      }

      return !!unSelectedContactIds.length;
    }, [
      contactsData,
      selectedContact,
      selectedCheckedContactIds,
      unSelectedContactIds,
    ]);

    const selectedContactsFilters = useMemo(() => {
      const tableFilters = {
        company: user.company._id,
        hasUnsubscribed: false,
        page: 1,
      };

      // =====================================================
      Object.keys(currentFilter).forEach((key) => {
        if (currentFilter[key] !== null) {
          tableFilters[key] = currentFilter[key];
        }
      });

      tableFilters.mainSearch = currentFilter.search || '';
      delete tableFilters.search;

      return {
        is_all_selected: selectedContact.checkAllPages,
        selected_contacts: selectedCheckedContactIds,
        exceptions_contacts: unSelectedContactIds,
        ...tableFilters,
      };
    }, [
      user,
      currentFilter,
      selectedContact,
      selectedCheckedContactIds,
      unSelectedContactIds,
    ]);

    useEffect(() => {
      if (socket) {
        socket.on(`mass-email-process-${user?.company?._id}`, (data) => {
          let tempScheduledMassEmails = [...scheduledMassEmailsRef.current];

          const isExist = tempScheduledMassEmails.find(
            (obj) => obj._id === data?.scheduledId
          );

          if (isExist) {
            tempScheduledMassEmails = tempScheduledMassEmails.map((obj) =>
              obj._id === data?.scheduledId
                ? {
                    ...obj,
                    status: data.status,
                    successCount: data.successCount,
                    failedCount: data.failedCount,
                  }
                : { ...obj }
            );
            setScheduledMassEmails(tempScheduledMassEmails);
          }
        });
      }
    }, []);

    useEffect(() => {
      const currentCount = contactsData.results.filter(
        (obj) => !obj?.hasUnsubscribed
      ).length;

      if (currentCount === selectedCheckedContactIds.length) {
        if (selectedContact.checkAll === false) {
          setSelectedContact((prev) => ({ ...prev, checkAll: true }));
        }
      } else {
        if (selectedContact.checkAll === true) {
          setSelectedContact((prev) => ({ ...prev, checkAll: false }));
        }
      }
    }, [contactsData.results, selectedCheckedContactIds]);

    useImperativeHandle(ref, () => ({
      getScheduledMailsForwardFun() {
        getScheduledMails({
          company: user?.company?._id ? user?.company?._id : null,
        });
      },
    }));

    // -- here restructure the data for csv export --
    const scheduledMassEmailsCSVData = restructureScheduledMailCSVData(
      scheduledMassEmails.data
    );

    const handleConfirmCancel = async (id, jobId) => {
      const result = await showWarnAlert({
        title: 'Are you sure?',
        text: 'Are you sure you want to cancel this scheduled mass email ?',
        icon: 'warning',
        showCancelButton: true,
        allowOutsideClick: false,
        confirmButtonText: 'Yes',
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-danger ms-1',
        },
        buttonsStyling: false,
      });
      if (result.isConfirmed) {
        cancelScheduledMail(id, { jobId }, 'Scheduled mass email canceling...');
      }
    };

    const cloneEmailBlast = async (id) => {
      setIsMassEmailSent('');
      setCloneMailBlastId(id);
      setFetchLoading(true);
      const { data } = await getScheduleMailForCloneScheduleMail(id, {
        select: '_id,delay,senderName,senderEmail,scheduledJobName',
      });

      if (data) {
        reset({
          template: data?.template
            ? { value: data?.template?._id, label: data?.template?.name }
            : null,
          title: `Clone ${data.scheduledJobName}`,
          delay: FORM_SCHEDULE_TIMER.find(
            (obj) =>
              obj.value ===
              (!isNaN(data.delay) ? Number(data.delay) : data.delay)
          ),
          fromName: data.senderName,
          fromEmail: { value: data.senderEmail, label: data.senderEmail },
        });

        setCloneMailBlastId(id);
        if (data) {
          setFetchLoading(false);
        }
      }
    };

    const onSendMassEmail = async (values) => {
      if (
        [...FORM_SCHEDULE_TIMER, { label: 'custom', value: 'custom' }].find(
          (obj) => obj.value === values.delay?.value
        ) &&
        !values.title
      ) {
        setError(
          `title`,
          { type: 'focus', message: `Scheduled Job Title.` },
          { shouldFocus: true }
        );
      } else {
        const { data } = await getEmailSenderAPI({
          email: values.fromEmail.value,
          company: user.company?._id,
        });

        if (!(data[0].status === 'Verified')) {
          setError(
            `fromEmail`,
            {
              type: 'focus',
              message: `Email is not verified,Please verify first.`,
            },
            { shouldFocus: true }
          );
          return;
        }

        if (values.delay.value === 'custom' && values.delayTime) {
          values.sendAfter =
            moment(values.delayTime).valueOf() - moment().valueOf();
        } else {
          values.sendAfter =
            moment().add(values.delay.value, 'minutes').valueOf() -
            moment().valueOf();
          values.delayTime = moment()
            .add(values.delay.value, 'minutes')
            .toDate();
        }

        if (values.sendAfter < 0) {
          values.sendAfter = 0;
        }

        const template = getValues()?.template?.value;
        values.contactsIds = selectedCheckedContactIds;
        values.template = template;
        values.company = user.company._id;
        values.fromEmail = values.fromEmail.value;

        // =====================================================
        values.selected = selectedContact.checkAllPages
          ? 'All'
          : 'currentContacts';

        values.contacts = selectedCheckedContactIds;
        values.exceptionsContacts = unSelectedContactIds;
        values.massCreatedAt = new Date();

        const filter = {};
        Object.keys(currentFilter).forEach((key) => {
          if (currentFilter[key] !== null) {
            // if (currentFilter[key] === 'UnassignedItem') {
            //   filter[key] = 'UnassignedItem';
            // } else {
            filter[key] = currentFilter[key];
            // }
          }
        });
        delete filter.page;
        delete filter.search;
        values.filters = { ...filter };
        values.search = currentFilter.search || '';
        // =====================================================

        setSendingMassEmail(true);
        try {
          const res = await sendMassEmailWithoutSave(values);
          if (res.error) {
            setSendingMassEmail(false);
            showToast(TOASTTYPES.error, '', res.error);
            return;
          } else {
            showToast(TOASTTYPES.success, '', 'Mail Send Successfully!');
          }
          setIsMassEmailSent(
            values.delay?.value === 0
              ? 'Email sent successfully.'
              : 'Emails scheduled successfully.'
          );
          setSendingMassEmail(false);
        } catch (error) {
          setSendingMassEmail(false);
        }
        // onMassEmailSendClose();
      }
    };

    const getSelectContactValue = (key) => {
      return selectedContact.selectedContact?.[key];
    };

    const scheduleListViewHeader = () => {
      return (
        <CardHeader className='card-header-with-buttons mb-1'>
          <CardTitle tag='h4' className='title'>
            Scheduled Mass Emails
          </CardTitle>
        </CardHeader>
      );
    };

    return (
      <>
        <UILoader blocking={isLoading}>
          <>
            {activeView === 'grid' ? (
              <Card className='scheduled-mass-emails-card'>
                <CardHeader>
                  <CardTitle tag='h4' className='text-primary'>
                    Scheduled Mass Emails
                  </CardTitle>
                  <div
                    className='mobile-toggle-header-btn'
                    style={{ display: 'none' }}
                  >
                    <ChevronDown />
                  </div>
                </CardHeader>
                <CardBody className='pb-0'>
                  <Row
                    className={`hide-scrollbar inner-scroll-area ${
                      !isLoading &&
                      scheduledMassEmailPagination.limit *
                        scheduledMassEmailPagination.page <
                        scheduledMassEmails.totalScheduledMassEmails &&
                      activeView === 'grid' &&
                      'load-more-active'
                    }`}
                  >
                    <div className='d-flex flex-wrap'>
                      {scheduledMassEmails.data?.length > 0 ? (
                        scheduledMassEmails.data.map((item, key) => {
                          return (
                            <Col
                              className='scheduled-mass-email-card-col'
                              md='6'
                              sm='6'
                              lg='6'
                              key={key}
                            >
                              <ScheduledMassEmailCard
                                cloneEmailBlast={cloneEmailBlast}
                                setEditViewModal={setEditViewModal}
                                item={item}
                                handleConfirmCancel={handleConfirmCancel}
                              />
                            </Col>
                          );
                        })
                      ) : (
                        <>
                          <div className='d-flex justify-content-center m-4'>
                            <span className='no-data-found'>
                              {!isLoading && 'No Scheduled Mass Email found!'}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </Row>
                  {!isLoading &&
                    scheduledMassEmailPagination.limit *
                      scheduledMassEmailPagination.page <
                      scheduledMassEmails.totalScheduledMassEmails &&
                    activeView === 'grid' && (
                      <div className='text-center loadMore-btn-wrapper'>
                        <Button
                          outline={true}
                          color='primary'
                          onClick={() => {
                            getScheduledMails({
                              company: user?.company?._id
                                ? user?.company?._id
                                : null,
                              page: scheduledMassEmailPagination.page + 1,
                              limit: scheduledMassEmailPagination.limit,
                            });
                          }}
                        >
                          Load More
                        </Button>
                      </div>
                    )}
                </CardBody>
              </Card>
            ) : (
              scheduledMassEmailsCSVData && (
                <ServerSideTable
                  header={scheduleListViewHeader()}
                  showSearch={false}
                  ref={scheduledMassEmailRef}
                  blocking={isLoading}
                  initialTableFilters={{
                    company: user?.company?._id ? user?.company?._id : null,
                  }}
                  selectableRows={false}
                  columns={scheduledMassEmailColumns({
                    handleConfirmCancel,
                    setEditViewModal,
                  })}
                  getRecord={getScheduledMails}
                  data={{
                    results: scheduledMassEmails.data,
                    total: scheduledMassEmails.totalScheduledMassEmails,
                  }}
                  itemsPerPage={10}
                />
              )
            )}
          </>
        </UILoader>
        <ScheduledMailEditViewModal
          getScheduledMails={getScheduledMails}
          setEditViewModal={setEditViewModal}
          editViewModal={editViewModal}
        />

        {cloneMailBlastId ? (
          <CloneEmailBlast
            unAssignFilter={unAssignFilter}
            isMassEmailSent={isMassEmailSent}
            reFetchScheduledMassEmailJobs={reFetchScheduledMassEmailJobs}
            getValue={getValues}
            cloneMailBlastId={cloneMailBlastId}
            openSendMassEmail={!!cloneMailBlastId}
            onMassEmailSendClose={setCloneMailBlastId}
            onSendMassEmail={onSendMassEmail}
            handleSubmit={handleSubmit}
            clearErrors={clearErrors}
            setValue={setValue}
            control={control}
            errors={errors}
            fetchLoading={fetchLoading}
            sendingMassEmail={sendingMassEmail || checkingSendingMail}
            initialFilters={selectedContactsFilters}
            selectedCount={selectedCount}
            handleChangeFilter={handleChangeFilter}
            setCurrentFilter={setCurrentFilter}
            setSelectedContact={setSelectedContact}
            currentFilter={currentFilter}
            isAllNotSelected={isAllNotSelected}
            getSelectContactValue={getSelectContactValue}
            selectedContact={selectedContact}
            filterValue={filterValue}
            getContacts={getContacts}
            contactsData={contactsData}
            isLoading={getContactIsLoading}
            selectedCheckedContactIds={selectedCheckedContactIds}
            setFilterValue={setFilterValue}
          />
        ) : null}
      </>
    );
  }
);
ScheduledMassEmailList.displayName = 'ScheduledMassEmailList';

export default ScheduledMassEmailList;
