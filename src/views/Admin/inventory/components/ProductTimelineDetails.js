import React, { useState, useEffect } from 'react';
import { Clock, Info } from 'react-feather';
import ProductTimelineModal from './ProductTimelineModal';
import Avatar from './../../../../@core/components/avatar/index';
import moment from 'moment';
import { useGetProductHistory } from '../hooks/InventoryProductApi';
import { useParams } from 'react-router-dom';
import { Spinner } from 'reactstrap';
import NoRecordFound from './../../../../@core/components/data-table/NoRecordFound';

const ProductTimelineDetails = () => {
  const params = useParams();
  const [timelineModal, setTimelineModal] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyUserDetails, setHistoryUserDetails] = useState([]);
  const [historyTimeline, setHistoryTimeline] = useState({});
  const { getProductHistory, isLoading: getProductHistoryLoading } =
    useGetProductHistory();
  const [historyFilter, setHistoryFilter] = useState({
    limit: 20,
    page: 1,
  });

  useEffect(async () => {
    getProductHistoryDetails();
  }, [historyFilter]);

  const getProductHistoryDetails = async () => {
    const { data, error } = await getProductHistory({
      id: params.id,
      limit: historyFilter.limit,
      page: historyFilter.page,
    });
    if (!error) {
      const productDetail = data.productDetail;
      const historyDetails = productDetail.history;
      setHistoryTimeline({ ...historyTimeline, historyDetails });
      setHistoryUserDetails([
        ...historyUserDetails,
        ...data.historyUserDetails,
      ]);
    }
  };

  const openHistoryModal = (history) => {
    setHistory(history);
    setTimelineModal(true);
  };

  const onScroll = () => {
    const scrollTop = document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;

    if (scrollTop + clientHeight >= scrollHeight) {
      setHistoryFilter({ ...historyFilter, page: historyFilter.page + 1 });
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [history, historyUserDetails]);

  const userDetails = (userId) => {
    const user = historyUserDetails.filter((item) => item._id === userId);
    if (user && user.length > 0) {
      return (
        <div className='user-details'>
          {user[0].userProfile ? (
            <Avatar
              className='user-profile'
              img={`${process.env.REACT_APP_S3_BUCKET_BASE_URL}${user[0].userProfile}`}
              imgHeight='32'
              imgWidth='32'
              content={`${user[0].firstName}  ${user[0].lastName}`}
              initials
            />
          ) : (
            <Avatar
              className='user-profile'
              color={'primary'}
              content={`${user[0].firstName}  ${user[0].lastName}`}
              initials
            />
          )}
          <h3 className='user-name'>
            {`${user[0].firstName} ${user[0].lastName}`} has updated
          </h3>
        </div>
      );
    }
  };

  const changedValueLabels = (history) => {
    const labels = [];
    Object.keys(history).forEach((item) => {
      if (item !== 'updatedBy' && item !== 'updatedTime') {
        labels.push(titleCase(item));
      }
    });
    return labels.toString();
  };

  const titleCase = (str) => {
    return str.toLowerCase().replace(/\b\w/g, (s) => s.toUpperCase());
  };

  return (
    <>
      {historyTimeline.historyDetails &&
      historyTimeline.historyDetails.length > 0 ? (
        <div className='history-wrap'>
          {historyTimeline.historyDetails.map((history, i) => (
            <div key={i} className='event'>
              <div className='inner-wrapper'>
                {userDetails(history.updatedBy)}
                <div
                  className='info-icon'
                  onClick={() => {
                    openHistoryModal(history);
                  }}
                >
                  <Info className='' />
                </div>
                <div className='details'>
                  <h6 className='title'>
                    <span className='value'>{changedValueLabels(history)}</span>{' '}
                    has been changed
                  </h6>
                </div>
                <div className='date'>
                  <Clock className='icon' />
                  <span className='text'>
                    {moment(new Date(history.updatedTime)).format(
                      'DD-MM-YY hh:mm A'
                    )}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {getProductHistoryLoading ? (
            <div className='d-flex align-items-center justify-content-center loader'>
              <Spinner />
            </div>
          ) : (
            <div>
              <NoRecordFound />
            </div>
          )}
        </>
      )}
      {timelineModal && (
        <ProductTimelineModal
          timelineModal={timelineModal}
          setTimelineModal={setTimelineModal}
          productHistory={history}
        />
      )}
    </>
  );
};

export default ProductTimelineDetails;
