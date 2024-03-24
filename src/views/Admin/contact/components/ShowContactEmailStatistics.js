import moment from 'moment';
import { useEffect, useState } from 'react';
import {
  Button,
  Col,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  Spinner,
} from 'reactstrap';
import CustomDatePicker from '../../../../@core/components/form-fields/CustomDatePicker';
import { useGetSendGridStasticsByCategory } from '../../campaigns/mass-email-tool/hooks/useApi';
import useStatistics from '../../Home/hooks/useStatistics';
import StatisticsDashboard from '../../Home/StatisticsDashboard';

export const ShowContactEmailStatistics = (props) => {
  const { showEmailStatisticsModal, handleCloseMailStatisticsModal } = props;
  const [filterDate, setFilterDate] = useState([
    moment().startOf('month').format('YYYY-MM-DD'),
    moment().endOf('month').format('YYYY-MM-DD'),
  ]);
  const [sendGridStastics, setSendGridStastics] = useState([]);

  const { statisticsRawData } = useStatistics();

  const { getSendGridStasticsByCategory, isLoading, isError } =
    useGetSendGridStasticsByCategory();
  useEffect(() => {
    if (showEmailStatisticsModal?.selectedEmail) {
      getSpecificSendGridData(
        moment(showEmailStatisticsModal?.selectedEmail?.scheduledTime).format(
          'YYYY-MM-DD'
        ),
        moment(
          showEmailStatisticsModal?.selectedEmail?.scheduledTime,
          'YYYY-MM-DD'
        ).add(1, 'days').format('YYYY-MM-DD')
      );
    }
  }, [showEmailStatisticsModal?.selectedEmail]);

  const getSpecificSendGridData = async (startDate, endDate) => {
    const { data, error } = await getSendGridStasticsByCategory({
      id: showEmailStatisticsModal?.selectedEmail?._id,
      query: {
        start_date: startDate,
        end_date: endDate,
      },
    });
    let obj;
    if (error) {
      obj = {
        blocks: 0,
        bounce_drops: 0,
        bounces: 0,
        clicks: 0,
        deferred: 0,
        delivered: 0,
        invalid_emails: 0,
        opens: 0,
        processed: 0,
        requests: 0,
        spam_report_drops: 0,
        spam_reports: 0,
        unique_clicks: 0,
        unique_opens: 0,
        unsubscribe_drops: 0,
        unsubscribes: 0,
      };
    } else {
      obj = data;
    }
    const totalMatrixObj = [];
    Object.keys(obj).forEach((key) => {
      if (statisticsRawData[key]) {
        totalMatrixObj.push({ title: obj[key], ...statisticsRawData[key] });
      }
    });

    setSendGridStastics(totalMatrixObj);
  };
  return (
    <>
      <Modal
        isOpen={showEmailStatisticsModal.isModalOpen}
        toggle={() => {
          handleCloseMailStatisticsModal();
        }}
        size='xl'
        backdrop='static'
        className={`modal-dialog-centered email-editor-modal`}
      >
        <ModalHeader
          toggle={() => {
            handleCloseMailStatisticsModal();
          }}
        >
          Send Email Statistics
        </ModalHeader>
        <ModalBody>
          <div>
            <Row className='mt-1'>
              <Col lg='3' md='12' sm='12'>
                <CustomDatePicker
                  name='start'
                  mode={'range'}
                  label='Filter by Date'
                  enableTime={false}
                  dateFormat='Y-m-d'
                  value={filterDate}
                  options={{ mode: 'range' }}
                  onChange={(date) => {
                    if (
                      date.length === 2 &&
                      moment(date?.[1]).format('YYYY-MM-DD') >
                        moment(date?.[0]).format('YYYY-MM-DD')
                    ) {
                      setFilterDate([
                        moment(date?.[0]).format('YYYY-MM-DD'),
                        moment(date?.[1]).format('YYYY-MM-DD'),
                      ]);
                      getSpecificSendGridData(
                        moment(date?.[0]).format('YYYY-MM-DD'),
                        moment(date?.[1]).format('YYYY-MM-DD')
                      );
                    }
                  }}
                />
              </Col>
            </Row>
            {isLoading ? (
              <>
                <div className='d-flex justify-content-center mt-2 mb-2'>
                  <Spinner color='primary' />
                </div>
              </>
            ) : isError ? (
              <div className='d-flex justify-content-center m-4'>
                <span className='no-data-found'>No Data Found!</span>
              </div>
            ) : (
              <StatisticsDashboard sendGridStastics={sendGridStastics} />
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color='danger'
            onClick={() => {
              handleCloseMailStatisticsModal();
            }}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};
