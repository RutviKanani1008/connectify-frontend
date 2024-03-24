// ==================== Packages =======================
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useForm, useWatch } from 'react-hook-form';
import moment from 'moment';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Row,
  Button,
} from 'reactstrap';

// ====================================================
import UILoader from '@components/ui-loader';
import { showToast, TOASTTYPES } from '@src/utility/toast-helper';
import { userData } from '../../../../../redux/user';
import {
  deleteMassEmail,
  getSpecificMassEmail,
  sendMassEmailById,
  useGetMassEmails,
} from '../../../../../api/massEmail';
import { showWarnAlert } from '../../../../../helper/sweetalert.helper';
import { SendMassEmailModal } from './SendMassEmailModal';
import MassEmailCard from './MassEmailCard';
import useMassEmailColumns from '../hooks/useMassEmailColumns';
import { FORM_SCHEDULE_TIMER } from '../../../../../constant';
// import ExportData from '../../../../../components/ExportData';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { required } from '../../../../../configs/validationConstant';
import { useGetEmailSenderAPI } from '../service/emailSender.service';
import { ChevronDown } from 'react-feather';
import ServerSideTable from '../../../../../@core/components/data-table/ServerSideTable';

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

const MassEmailList = ({ activeView, reFetchScheduledMassEmailJobs }) => {
  // ========================== Hooks =========================
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    setError,
    getValues,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(massEmailSchema),
    mode: 'onBlur',
  });
  const user = useSelector(userData);

  // ============================== states ============================
  const [massEmails, setMassEmails] = useState({
    data: [],
    total: 0,
  });

  const massEmailRef = useRef(null);
  const [openSendMassEmail, setOpenSendMassEmail] = useState(false);
  const [currentSelectedMassEmail, setCurrentSelectedMassEmail] =
    useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [sendingMassEmail, setSendingMassEmail] = useState(false);
  const [isMassEmailSent, setIsMassEmailSent] = useState('');
  const [currentMassEmailId, setCurrentMassEmailId] = useState(null);

  // ========================== Custom Hooks =========================
  const { massEmailColumns } = useMassEmailColumns();
  const { getEmailSenderAPI, isLoading: checkingSendingMail } =
    useGetEmailSenderAPI();

  const [massEmailPagination, setMassEmailPagination] = useState({
    page: 1,
    limit: 6,
  });

  const { getMassEmails, isLoading: massEmailLoading } = useGetMassEmails();

  const selectedContactsFilters = useMemo(() => {
    const tableFilters = { company: user.company._id };

    const contactsIds = (currentSelectedMassEmail?.contacts || []).map(
      (c) => c._id
    );

    return {
      is_all_selected: false,
      selected_contacts: contactsIds,
      exceptions_contacts: [],
      ...tableFilters,
    };
  }, [user, currentSelectedMassEmail]);

  const initialFiltersForTable = {
    ...selectedContactsFilters,
    search: '',
    mainSearch: selectedContactsFilters.search || '',
  };
  useEffect(() => {
    setMassEmails({
      total: 0,
      data: [],
    });
    if (activeView === 'grid') {
      getRecords({ page: 1, limit: 6 });
    }
  }, [activeView]);

  const getRecords = async ({ page = 1, limit = 6 }) => {
    setMassEmailPagination({
      page,
      limit,
    });
    const { data, error } = await getMassEmails({
      company: user?.company?._id ? user?.company?._id : null,
      saveAs: true,
      page,
      limit,
    });

    if (!error) {
      const { massEmailDetails = [], totalMassMail = 0 } = data;
      if (activeView === 'list') {
        setMassEmails({
          data: [...massEmailDetails],
          total: totalMassMail,
        });
      } else {
        if (page === 1) {
          setMassEmails({
            data: [...massEmailDetails],
            total: totalMassMail,
          });
        } else {
          setMassEmails({
            data: [...massEmails.data, ...massEmailDetails],
            total: totalMassMail,
          });
        }
      }
    }
  };

  const handleConfirmDelete = async (id) => {
    const result = await showWarnAlert({
      title: 'Are you sure?',
      text: 'Are you sure you want to Delete this mass email ?',
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
      const toastId = showToast(
        TOASTTYPES.loading,
        '',
        'Mass email Deleting...'
      );
      deleteMassEmail(id).then((res) => {
        if (res.error) {
          showToast(TOASTTYPES.error, toastId, res.error);
        } else {
          showToast(
            TOASTTYPES.success,
            toastId,
            'Mass email deleted successfully'
          );
          getRecords({ page: 1, limit: 6 });
        }
      });
    }
  };

  const sendMassEmail = async (id) => {
    setIsMassEmailSent('');
    setOpenSendMassEmail(true);
    setCurrentMassEmailId(id);
    setFetchLoading(true);
    const specificMassEmail = await getSpecificMassEmail(id, {
      select: 'title,template,company,contacts',
    });

    if (specificMassEmail?.data?.data) {
      setCurrentSelectedMassEmail(specificMassEmail?.data?.data);
      setFetchLoading(false);
    }
    setValue('template', {
      value: specificMassEmail?.data?.data?.template._id,
      label: specificMassEmail?.data?.data?.template.name,
    });
    setValue(
      'title',
      `${specificMassEmail?.data?.data?.template?.name || ''} - ${moment(
        new Date()
      ).format('MM-DD-YYYY HH:mm')}`
    );
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
      return;
    }

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
      values.delayTime = moment().add(values.delay.value, 'minutes').toDate();
    }
    if (values.sendAfter < 0) {
      values.sendAfter = 0;
    }
    values.company = user.company._id;
    values.fromEmail = values.fromEmail.value;
    values.delay = values.delay.value;

    setSendingMassEmail(true);
    try {
      const res = await sendMassEmailById(currentSelectedMassEmail._id, values);
      if (res.error) {
        showToast(TOASTTYPES.error, '', res.error);
      } else {
        showToast(TOASTTYPES.success, '', 'Mail Send Successfully');
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
  };

  const onMassEmailSendClose = () => {
    setOpenSendMassEmail(false);
    setCurrentMassEmailId(null);
    reset({});
  };

  const delayStatus = useWatch({ control, name: 'delay' });

  const massEmailListViewHeader = () => {
    return (
      <CardHeader className='card-header-with-buttons mb-1'>
        <CardTitle tag='h4' className='title'>
          Mass Emails
        </CardTitle>
      </CardHeader>
    );
  };

  return (
    <>
      <UILoader blocking={massEmailLoading}>
        <>
          {activeView === 'grid' ? (
            <Card className='mass-emails-card'>
              <CardHeader>
                <CardTitle tag='h4' className='text-primary'>
                  Mass Emails
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
                    !massEmailLoading &&
                    massEmailPagination.limit * massEmailPagination.page <
                      massEmails.total &&
                    activeView === 'grid' &&
                    'load-more-active'
                  }`}
                >
                  <div className='d-flex flex-wrap'>
                    {massEmails.data?.length > 0 ? (
                      massEmails.data.map((item, key) => {
                        return (
                          <Col
                            className='mass-email-card-col'
                            md='6'
                            sm='6'
                            lg='6'
                            key={key}
                          >
                            <MassEmailCard
                              item={item}
                              handleConfirmDelete={handleConfirmDelete}
                              sendMassEmail={sendMassEmail}
                            />
                          </Col>
                        );
                      })
                    ) : (
                      <div className='d-flex justify-content-center m-4'>
                        <span className='no-data-found'>
                          {!massEmailLoading && 'No Mass Email found!'}
                        </span>
                      </div>
                    )}
                  </div>
                </Row>
                {!massEmailLoading &&
                  massEmailPagination.limit * massEmailPagination.page <
                    massEmails.total &&
                  activeView === 'grid' && (
                    <div className='text-center loadMore-btn-wrapper'>
                      <Button
                        outline={true}
                        color='primary'
                        onClick={() => {
                          getRecords({
                            page: massEmailPagination.page + 1,
                            limit: massEmailPagination.limit,
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
            <>
              <ServerSideTable
                header={massEmailListViewHeader()}
                showSearch={false}
                ref={massEmailRef}
                blocking={massEmailLoading}
                initialTableFilters={{
                  company: user?.company?._id ? user?.company?._id : null,
                }}
                selectableRows={false}
                columns={massEmailColumns({
                  sendMassEmail,
                  handleConfirmDelete,
                })}
                getRecord={getRecords}
                data={{
                  results: massEmails.data,
                  total: massEmails.total,
                }}
                itemsPerPage={10}
              />
            </>
          )}
        </>
        {openSendMassEmail ? (
          <SendMassEmailModal
            fromEmailList
            massEmailId={currentMassEmailId}
            isMassEmailSent={isMassEmailSent}
            reFetchScheduledMassEmailJobs={reFetchScheduledMassEmailJobs}
            getValue={getValues}
            openSendMassEmail={openSendMassEmail}
            currentSelectedContacts={currentSelectedMassEmail?.contacts}
            onMassEmailSendClose={onMassEmailSendClose}
            onSendMassEmail={onSendMassEmail}
            handleSubmit={handleSubmit}
            delayStatus={delayStatus}
            clearErrors={clearErrors}
            setValue={setValue}
            control={control}
            errors={errors}
            fetchLoading={fetchLoading}
            sendingMassEmail={sendingMassEmail || checkingSendingMail}
            initialFilters={initialFiltersForTable}
            selectedCount={currentSelectedMassEmail?.contacts?.length}
          />
        ) : null}
      </UILoader>
    </>
  );
};

export default MassEmailList;
