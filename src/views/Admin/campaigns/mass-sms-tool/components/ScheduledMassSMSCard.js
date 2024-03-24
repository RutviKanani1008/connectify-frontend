/* eslint-disable no-mixed-operators */
// ==================== Packages =======================
import moment from 'moment';
import { XCircle, Eye, Edit2 } from 'react-feather';
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

const ScheduledMassSMSCard = ({
  item,
  handleConfirmCancel,
  setEditViewModal,
}) => {
  const {
    massSMSId: { contacts },
    scheduledTime,
    status,
    jobId,
    _id,
    scheduledJobName,
  } = item;

  const isEditable =
    new Date(Date.now() + 60000 * 5).getTime() <
    new Date(scheduledTime).getTime();
  const isPastScheduled =
    new Date().getTime() > new Date(scheduledTime).getTime();
  return (
    <>
    <div className='company-form-card'>
      <div className='header-wrapper'>
        <div className='form-card-title' id={`scheduled_job_name${_id}`}>{scheduledJobName}</div>
        <UncontrolledTooltip
          placement='top'
          autohide={true}
          target={`scheduled_job_name${_id}`}
        >
          {scheduledJobName}
        </UncontrolledTooltip>
        <div className='action-btn-wrapper'>
          {!isPastScheduled && status === 'PENDING' ? (
            <>
            <div className='action-btn edit-btn'>
              <Edit2
                // color='var(--primaryColorDark)'
                size={15}
                className={`${
                  isEditable ? 'cursor-pointer ' : 'cursor-not-allowed'
                }`}
                onClick={() => {
                  isEditable &&
                    setEditViewModal({ isOpen: true, mode: 'edit', id: _id });
                }}
                id={`edit_${_id}`}
              />
              <UncontrolledTooltip
                placement='top'
                autohide={true}
                target={`edit_${_id}`}
              >
                {isEditable
                  ? 'Edit Scheduled SMS'
                  : "You can't edit before 5 minutes of scheduled time"}
              </UncontrolledTooltip>
              </div>
            </>
          ) : (
            <></>
          )}          
          <>
          <div className='action-btn view-btn'>
            <Eye
              size={15}
              // color='var(--primaryColorDark)'
              className='cursor-pointer'
              onClick={() => {
                setEditViewModal({ isOpen: true, mode: 'view', id: _id });
              }}
              id={`view_${_id}`}
            />
            <UncontrolledTooltip
              placement='top'
              autohide={true}
              target={`view_${_id}`}
            >
              View scheduled mass sms detail
            </UncontrolledTooltip>
            </div>
          </>
          {!isPastScheduled && status === 'PENDING' ? (
            <>
              <div className='action-btn delete-btn'>
                <XCircle
                  size={15}
                  color='red'
                  className={`${
                    status === 'PENDING' ? 'cursor-pointer' : 'cursor-not-allowed'
                  }`}
                  onClick={() => {
                    if (status === 'PENDING') handleConfirmCancel(_id, jobId);
                  }}
                  id={`cancel_${_id}`}
                />
                <UncontrolledTooltip
                  placement='top'
                  autohide={true}
                  target={`cancel_${_id}`}
                >
                  Cancel scheduled mass sms
                </UncontrolledTooltip>
              </div>
            </>
          ) : (
            <></>
          )}
        </div>
      </div>
      <div className='body-wrapper'>
        <Badge className='' color={`light-${selectBadge(status)}`} pill >
          {status.toLowerCase()}
        </Badge>
        <div className='items-row-wrapper'>
          <div className='items-row'>
            <span className='label'>Total number of contacts:</span>
            <span className='value'>{contacts?.length}</span>
          </div>
          <div className='items-row'>
            <span className='label'>Scheduled Date Time:</span>
            <span className='value'>{moment(new Date(scheduledTime)).format('DD-MM-YY hh:mm A')}</span>
          </div>
        </div>
      </div>
    </div>

    {/* static-design-start */}
    {/* <div className='company-form-card'>
      <div className='header-wrapper'>
        <div className='form-card-title'>Test lorem ipsum test lorem ipsum test lorem ipsum</div>
        <div className='action-btn-wrapper'>
          <div className='action-btn edit-btn'>
            <Edit2
              // color='var(--primaryColorDark)'
              size={15}
              className='cursor-pointer'
            />
          </div>
          <div className='action-btn view-btn'>
            <Eye
              size={15}
              // color='var(--primaryColorDark)'
              className='cursor-pointer'
            />
          </div>
          <div className='action-btn delete-btn'>
            <XCircle
              size={15}
              color='red'
              className='cursor-pointer'
            />
          </div>
        </div>
      </div>
      <div className='body-wrapper'>
        <Badge className='bg-light-success' pill >
          Sent
        </Badge>
        <div className='items-row-wrapper'>
          <div className='items-row'>
            <span className='label'>Total number of contacts:</span>
            <span className='value'>7483</span>
          </div>
          <div className='items-row'>
            <span className='label'>Scheduled Date Time:</span>
            <span className='value'>10-05-23 08:52 AM</span>
          </div>
        </div>
      </div>
    </div> */}
    {/* static-design-end */}
    </>
  );
};

export default ScheduledMassSMSCard;
