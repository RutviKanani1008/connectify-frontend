// ==================== Packages =======================
import React, {
  forwardRef,
  useEffect,
  useState,
  useImperativeHandle,
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
  // Badge,
} from 'reactstrap';
// ====================================================
import { userData } from '../../../../../redux/user';
import { showWarnAlert } from '../../../../../helper/sweetalert.helper';
import { restructureScheduledSMSCSVData } from '../../../../../helper/mass-sms.helper';
import {
  useCancelScheduledSMS,
  useGetScheduledSMSList,
} from '../service/scheduledMassSMS.services';
import useScheduledMassSMSColumns from '../hooks/useScheduledMassSMSColumns';

import UILoader from '@components/ui-loader';
import ScheduledMassSMSCard from './ScheduledMassSMSCard';
import ItemTable from '../../../../../@core/components/data-table';
import ScheduledSMSEditViewModal from './ScheduledSMSEditViewModal';
import ExportData from '../../../../../components/ExportData';
// import { Edit2, Eye, XCircle } from 'react-feather';
import NoRecordFound from '../../../../../@core/components/data-table/NoRecordFound';
import { ChevronDown } from 'react-feather';

const ScheduledMassSMSList = forwardRef(({ activeView }, ref) => {
  // ========================== Hooks =========================
  const user = useSelector(userData);

  // ============================== states ============================
  const [scheduledMassSMSList, setScheduledMassSMSList] = useState([]);
  const [editViewModal, setEditViewModal] = useState({
    isOpen: false,
    mode: '',
    id: '',
  });

  // ========================== Custom Hooks =========================
  const { scheduledMassSMSColumns } = useScheduledMassSMSColumns();
  const { getScheduledSMSList, isLoading } = useGetScheduledSMSList({
    setScheduledMassSMSList,
  });
  const [itemLoadCount, setItemLoadCount] = useState(6);
  const { cancelScheduledSMS } = useCancelScheduledSMS({
    getScheduledSMSList,
    user,
  });

  useEffect(() => {
    getScheduledSMSList({
      company: user?.company?._id ? user?.company?._id : null,
    });
  }, []);

  useImperativeHandle(ref, () => ({
    getScheduledSMSListForwardFun() {
      getScheduledSMSList({
        company: user?.company?._id ? user?.company?._id : null,
      });
    },
  }));

  // -- here restructure the data for csv export --
  const scheduledMassSMSListCSVData =
    restructureScheduledSMSCSVData(scheduledMassSMSList);

  const handleConfirmCancel = async (id, jobId) => {
    const result = await showWarnAlert({
      title: 'Are you sure?',
      text: 'Are you sure you want to cancel this scheduled mass sms ?',
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
      cancelScheduledSMS(id, { jobId }, 'Scheduled mass sms canceling...');
    }
  };

  return (
    <>
      <UILoader blocking={isLoading}>
        <>
          {activeView === 'grid' ? (
            <Card>
              <CardHeader>
                <CardTitle tag='h4' className='text-primary'>
                  Scheduled Mass SMS List
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
                    !isLoading &&
                    itemLoadCount < scheduledMassSMSList?.length &&
                    activeView === 'grid' &&
                    'load-more-active'
                  }`}
                >
                  <Row>
                    {scheduledMassSMSList && scheduledMassSMSList.length > 0 ? (
                      scheduledMassSMSList.map((item, key) => {
                        if (key < itemLoadCount) {
                          return (
                            <Col className='mass-sms-card-col' md='6' key={key}>
                              <ScheduledMassSMSCard
                                setEditViewModal={setEditViewModal}
                                item={item}
                                handleConfirmCancel={handleConfirmCancel}
                              />
                            </Col>
                          );
                        }
                      })
                    ) : (
                      <>
                        {/* <div className='d-flex justify-content-center m-4'>
                          <span className='no-data-found'>
                            {!isLoading && 'No Scheduled Mass SMS found!'}
                          </span>
                        </div> */}
                        <NoRecordFound />
                      </>
                    )}
                  </Row>
                </div>
                {!isLoading &&
                  itemLoadCount < scheduledMassSMSList?.length &&
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
            scheduledMassSMSListCSVData && (
              <ItemTable
                ExportData={<ExportData model='scheduledMassSMS' />}
                exportCSVData={scheduledMassSMSListCSVData}
                hideButton={true}
                columns={scheduledMassSMSColumns({
                  handleConfirmCancel,
                  setEditViewModal,
                })}
                data={scheduledMassSMSList.map((obj, index) => ({
                  ...obj,
                  id: index,
                }))}
                title={'Scheduled Mass SMS'}
                itemsPerPage={10}
                selectableRows={false}
              />
            )
          )}
        </>
      </UILoader>
      <ScheduledSMSEditViewModal
        getScheduledSMSList={getScheduledSMSList}
        setEditViewModal={setEditViewModal}
        editViewModal={editViewModal}
      />
    </>
  );
});
ScheduledMassSMSList.displayName = 'ScheduledMassSMSList';

export default ScheduledMassSMSList;
