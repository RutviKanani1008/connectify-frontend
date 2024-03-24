/* eslint-disable no-mixed-operators */
// ==================== Packages =======================
import moment from 'moment';
import { XCircle, Eye, BarChart2 } from 'react-feather';
// import { useHistory } from 'react-router-dom';
import {
  Badge,
  // Card,
  // CardBody,
  // CardHeader,
  UncontrolledTooltip,
} from 'reactstrap';

export const selectBadge = (type) => {
  switch (type) {
    case 'SUCCESS':
      return 'success';
    case 'CANCELED':
      return 'danger';
    case 'PENDING':
      return 'warning';
  }
};

const ContactEmailCard = ({
  item,
  setShowEmailStatisticsModal,
  setPreviewModal,
  setTemplatesPreview,
  deleteContactMassEmailSchedule,
}) => {
  const { scheduledTime, status, _id, subject } = item;

  const isPastScheduled =
    new Date().getTime() > new Date(scheduledTime).getTime();

  return (
    <>
      <div className='company-form-card'>
        <div className='header-wrapper'>
          <div className='form-card-title' id={`scheduled_job_name${_id}`}>
            {subject}
          </div>
          <UncontrolledTooltip
            placement='top'
            autohide={true}
            target={`scheduled_job_name${_id}`}
          >
            {subject}
          </UncontrolledTooltip>
          <div className='action-btn-wrapper'>
            <div className='action-btn view-btn'>
              <Eye
                size={15}
                className='cursor-pointer'
                onClick={() => {
                  setTemplatesPreview(item);
                  setPreviewModal(true);
                }}
                id={`view_${_id}`}
              />
              <UncontrolledTooltip
                placement='top'
                autohide={true}
                target={`view_${_id}`}
              >
                {/* View scheduled mass email detail */}
                View
              </UncontrolledTooltip>
            </div>

            {isPastScheduled && status === 'SUCCESS' && (
              <>
                <div className='action-btn chart-btn'>
                  <BarChart2
                    size={15}
                    // color='#64c664'
                    className={`${
                      status === 'SUCCESS'
                        ? 'cursor-pointer'
                        : 'cursor-not-allowed'
                    }`}
                    onClick={() => {
                      if (status === 'SUCCESS') {
                        setShowEmailStatisticsModal({
                          isModalOpen: true,
                          selectedEmail: item,
                        });
                      }
                    }}
                    id={`sendgrid_${_id}`}
                  />
                  <UncontrolledTooltip
                    placement='top'
                    autohide={true}
                    target={`sendgrid_${_id}`}
                  >
                    View Sendgrid Statistics
                  </UncontrolledTooltip>
                </div>
              </>
            )}
            {!isPastScheduled && status === 'PENDING' ? (
              <>
                <div className='action-btn close-btn'>
                  <XCircle
                    size={15}
                    color='red'
                    className={`${
                      status === 'PENDING'
                        ? 'cursor-pointer'
                        : 'cursor-not-allowed'
                    }`}
                    onClick={() => {
                      if (status === 'PENDING') {
                        deleteContactMassEmailSchedule(item);
                      }
                    }}
                    id={`cancel_${_id}`}
                  />
                  <UncontrolledTooltip
                    placement='top'
                    autohide={true}
                    target={`cancel_${_id}`}
                  >
                    Cancel scheduled mass email
                  </UncontrolledTooltip>
                </div>
              </>
            ) : (
              <></>
            )}
          </div>
        </div>
        <div className='body-wrapper'>
          <Badge className='mb-1' color={`light-${selectBadge(status)}`} pill>
            {status.toLowerCase()}
          </Badge>
          <div className='data-row'>
            <span className='label'>Scheduled Date Time: </span>
            <span className='value'>
              {moment(new Date(scheduledTime)).format('DD-MM-YY hh:mm A')}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactEmailCard;
