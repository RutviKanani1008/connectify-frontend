import { Card, CardBody, CardText } from 'reactstrap';
import Avatar from '@components/avatar';

const selectBadge = (type) => {
  switch (type) {
    case 'yes':
      return 'success';
    case 'no':
      return 'danger';
    case 'May be':
      return 'warning';
  }
};

const RsvpCard = ({ data }) => {
  return (
    <Card className='card-apply-job rsvp-card-wrapper'>
      <div
        className={`ribbon-2 bg-${selectBadge(
          data?.are_you_coming
        )} text-capitalize`}
      >
        Rsvp
      </div>
      <CardBody>
        <div className='d-flex justify-content-between align-items-center mb-1'>
          <div className='d-flex align-items-center rsvp-card-info'>
            <Avatar
              className='me-1'
              img={`${process.env.REACT_APP_S3_BUCKET_BASE_URL}${
                data?.contact?.userProfile &&
                data?.contact?.userProfile !== 'false'
                  ? data?.contact?.userProfile
                  : 'super-admin/report-problem/1663400998470_avatar-blank.png'
              }`}
              imgHeight='42'
              imgWidth='42'
            />
            <div className='text-wrapper'>
              <h6 className='mb-0 rsvp-card-text'>
                {`${
                  data?.contact?.firstName || data?.contact?.firstName
                    ? `${data?.contact?.firstName} ${data?.contact?.lastName}`
                    : `-`
                }`}
              </h6>
              <small className='d-block rsvp-card-text'>
                {data?.contact?.email}
              </small>
            </div>
          </div>
        </div>
        <div className='rsvp-detail-wrapper py-75'>
          <div className='no-of-guest  d-flex'>
            <CardText className='m-0'>No of guests</CardText>
            <h6 className='mb-0 me-2'>
              {data?.number_of_guest ? data?.number_of_guest : 0}
            </h6>
          </div>
        </div>
        {data?.are_you_coming === 'no' && (
          <>
            <h5 className='apply-job-title'>Reason</h5>
            <CardText className='mb-1'>
              {data?.reason ? data?.reason : '-'}
            </CardText>
          </>
        )}
      </CardBody>
    </Card>
  );
};

export default RsvpCard;
