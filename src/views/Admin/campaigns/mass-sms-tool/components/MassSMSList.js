// ==================== Packages =======================
import moment from 'moment';
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useForm, useWatch } from 'react-hook-form';

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Row,
} from 'reactstrap';
// ====================================================
import useMassSMSColumns from '../hooks/useMassSMSColumns';
import {
  deleteMassSMS,
  getMassSMS,
  getSpecificMassSMS,
  sendMassSMSById,
} from '../../../../../api/massSMS';
import { userData } from '../../../../../redux/user';
import { showToast, TOASTTYPES } from '@src/utility/toast-helper';

import UILoader from '@components/ui-loader';
import MassSMSCard from './MassSMSCard';
import ItemTable from '../../../../../@core/components/data-table';
import { showWarnAlert } from '../../../../../helper/sweetalert.helper';
import SendMassSMSModal from './SendMassSMSModal';
import { FORM_SCHEDULE_TIMER } from '../../../../../constant';
import ExportData from '../../../../../components/ExportData';
import NoRecordFound from '../../../../../@core/components/data-table/NoRecordFound';
import { ChevronDown } from 'react-feather';
// import { Edit2, Send, Trash } from 'react-feather';

const MassSMSList = ({ activeView, reFetchScheduledMassSMSJobs }) => {
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
    mode: 'onBlur',
  });
  const user = useSelector(userData);

  const [fetching, setFetching] = useState(false);
  const [massSMSList, setMassSMSList] = useState([]);
  const [openSendMassSMS, setOpenSendMassSMS] = useState(false);
  const [currentSelectedMassSMS, setCurrentSelectedMassSMS] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [sendingMassSMS, setSendingMassSMS] = useState(false);
  const [itemLoadCount, setItemLoadCount] = useState(6);

  const { massSMSColumns } = useMassSMSColumns();

  useEffect(() => {
    getRecords();
  }, []);

  const getRecords = () => {
    setFetching(true);
    getMassSMS({
      company: user?.company?._id ? user.company._id : null,
      saveAs: true,
    })
      .then((res) => {
        setFetching(false);
        setMassSMSList(res.data.data);
      })
      .catch(() => {
        setFetching(false);
      });
  };

  const handleConfirmDelete = async (id) => {
    const result = await showWarnAlert({
      title: 'Are you sure?',
      text: 'Are you sure you want to delete this mass sms ?',
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
      const toastId = showToast(TOASTTYPES.loading, '', 'Mass SMS Deleting...');
      deleteMassSMS(id).then((res) => {
        if (res.error) {
          showToast(TOASTTYPES.error, toastId, res.error);
        } else {
          showToast(
            TOASTTYPES.success,
            toastId,
            'Mass sms deleted successfully'
          );
          getRecords();
        }
      });
    }
  };

  const sendMassSMS = async (id) => {
    setOpenSendMassSMS(true);
    setFetchLoading(true);
    const specificMassSMS = await getSpecificMassSMS(id);
    if (specificMassSMS?.data?.data) {
      setCurrentSelectedMassSMS(specificMassSMS?.data?.data);
      setFetchLoading(false);
    }
  };

  const onSendMassSMS = async (values) => {
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

    setSendingMassSMS(true);

    try {
      const res = await sendMassSMSById(currentSelectedMassSMS._id, values);
      if (res.error) {
        showToast(TOASTTYPES.error, '', res.error);
      } else {
        showToast(TOASTTYPES.success, '', 'SMS Send Successfully');
      }

      setSendingMassSMS(false);
    } catch (error) {
      setSendingMassSMS(false);
    }
    reFetchScheduledMassSMSJobs();
    onMassSMSSendClose();
  };

  const onMassSMSSendClose = () => {
    setOpenSendMassSMS(false);
    reset({});
  };

  const delayStatus = useWatch({ control, name: 'delay' });
  return (
    <UILoader blocking={fetching}>
      {activeView === 'grid' ? (
        <Card>
          <CardHeader>
            <CardTitle tag='h4' className='text-primary'>
              Mass SMS
            </CardTitle>
            <div
              className='mobile-toggle-header-btn'
              style={{ display: 'none' }}
            >
              <ChevronDown />
            </div>
          </CardHeader>
          <CardBody className='pb-0'>
            <div
              className={`hide-scrollbar inner-scroll-area ${
                !fetching &&
                itemLoadCount < massSMSList?.length &&
                activeView === 'grid' &&
                'load-more-active'
              }`}
            >
              <Row>
                {massSMSList && massSMSList.length > 0 ? (
                  massSMSList.map((item, key) => {
                    if (key < itemLoadCount) {
                      return (
                        <Col className='mass-sms-card-col' md='6' key={key}>
                          <MassSMSCard
                            item={item}
                            handleConfirmDelete={handleConfirmDelete}
                            sendMassSMS={sendMassSMS}
                          />
                        </Col>
                      );
                    }
                  })
                ) : (
                  <>
                    {/* <div className='d-flex justify-content-center m-4'>
                    <span className='no-data-found'>
                      {!fetching && 'No Mass SMS found!'}
                    </span>
                  </div> */}
                    <NoRecordFound />
                  </>
                )}
              </Row>
            </div>
            {!fetching &&
              itemLoadCount < massSMSList?.length &&
              activeView === 'grid' && (
                <div className='text-center loadMore-btn-wrapper'>
                  <Button
                    outline={true}
                    color='primary'
                    onClick={() => {
                      let temp = itemLoadCount;
                      temp = temp + 6;
                      setItemLoadCount(temp);
                    }}
                  >
                    Load More
                  </Button>
                </div>
              )}
          </CardBody>
        </Card>
      ) : (
        <ItemTable
          ExportData={<ExportData model='massSMS' />}
          hideButton={true}
          columns={massSMSColumns({
            sendMassSMS,
            handleConfirmDelete,
          })}
          data={massSMSList}
          title={'Mass SMS List'}
          itemsPerPage={10}
          selectableRows={false}
        />
      )}

      {openSendMassSMS ? (
        <SendMassSMSModal
          currentSelectedContacts={currentSelectedMassSMS?.contacts}
          onMassSMSSendClose={onMassSMSSendClose}
          openSendMassSMS={openSendMassSMS}
          onSendMassSMS={onSendMassSMS}
          handleSubmit={handleSubmit}
          delayStatus={delayStatus}
          clearErrors={clearErrors}
          setValue={setValue}
          control={control}
          errors={errors}
          fetchLoading={fetchLoading}
          getValues={getValues}
          sendingMassSMS={sendingMassSMS}
        />
      ) : null}
    </UILoader>
  );
};

export default MassSMSList;
