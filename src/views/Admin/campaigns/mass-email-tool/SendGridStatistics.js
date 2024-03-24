import moment from 'moment';
import { useEffect, useState } from 'react';
// import { ArrowLeft } from 'react-feather';
import { useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';

import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Row,
  Spinner,
  UncontrolledTooltip,
} from 'reactstrap';
import CustomDatePicker from '../../../../@core/components/form-fields/CustomDatePicker';
import useGetBasicRoute from '../../../../hooks/useGetBasicRoute';
import { userData } from '../../../../redux/user';
import useStatistics from '../../Home/hooks/useStatistics';
import StatisticsDashboard from '../../Home/StatisticsDashboard';
import { useGetSendGridStasticsByCategory } from './hooks/useApi';

const SendgridStastics = () => {
  const user = useSelector(userData);
  const history = useHistory();
  const { basicRoute } = useGetBasicRoute();
  const { getSendGridStasticsByCategory, isLoading, isError } =
    useGetSendGridStasticsByCategory();
  const params = useParams();
  const { statisticsRawData } = useStatistics();
  const [sendGridStastics, setSendGridStastics] = useState([]);
  const [filterDate, setFilterDate] = useState([
    moment().startOf('month').format('YYYY-MM-DD'),
    moment().endOf('month').format('YYYY-MM-DD'),
  ]);

  const getSpecificSendGridData = async (startDate, endDate) => {
    const { data, error } = await getSendGridStasticsByCategory({
      id: params.id,
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
  useEffect(() => {
    getSpecificSendGridData(
      moment().startOf('month').format('YYYY-MM-DD'),
      moment().endOf('month').format('YYYY-MM-DD')
    );
  }, []);

  return (
    <div className='sendgrid-statistics-wrapper'>
      <Card>
        <CardHeader>
          <div className='left'>
            <span
              className='back-arrow'
              onClick={() => {
                if (user.role === 'superadmin') {
                  history.push('/company/mass-email');
                } else {
                  history.push(`${basicRoute}/mass-email`);
                }
              }}
              id={'goback'}
            >
              {/* <ArrowLeft className='cursor-pointer header-back-btn' /> */}
              <UncontrolledTooltip placement='top' target={`goback`}>
                Go Back
              </UncontrolledTooltip>
            </span>
            <CardTitle>Sendgrid Statistics</CardTitle>
          </div>
        </CardHeader>
        <CardBody>
          <Row className='mb-2'>
            <Col lg='4' md='12' sm='12'>
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
        </CardBody>
      </Card>
    </div>
  );
};

export default SendgridStastics;
