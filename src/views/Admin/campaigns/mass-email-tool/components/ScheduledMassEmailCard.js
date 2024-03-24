// ==================== Packages =======================
import moment from 'moment';
import { XCircle, Eye, Edit2, BarChart2, Copy } from 'react-feather';
import { useHistory } from 'react-router-dom';
import {
  Badge,
  // Card,
  // CardBody,
  // CardHeader,
  UncontrolledTooltip,
} from 'reactstrap';
import useGetBasicRoute from '../../../../../hooks/useGetBasicRoute';

export const selectBadge = (type) => {
  switch (type) {
    case 'SENT':
    case 'SUCCESS':
      return 'success';
    case 'CANCELED':
      return 'danger';
    case 'PROCESSING':
      return 'info';
    case 'PENDING':
      return 'warning';
    case 'FAILED':
      return 'danger';
  }
};

const ScheduledMassEmailCard = ({
  item,
  handleConfirmCancel,
  setEditViewModal,
  cloneEmailBlast,
}) => {
  const {
    massEmailId,
    scheduledTime,
    status,
    jobId,
    _id,
    scheduledJobName,
    successCount,
    failedCount,
  } = item;

  const history = useHistory();

  const isEditable =
    new Date(Date.now() + 60000 * 5).getTime() <
    new Date(scheduledTime).getTime();
  const isPastScheduled =
    new Date().getTime() > new Date(scheduledTime).getTime();

  const { basicRoute } = useGetBasicRoute();

  return (
    <>
      <div className='company-form-card'>
        <div className='header-wrapper'>
          <div className='form-card-title' id={`scheduled_job_name${_id}`}>
            {scheduledJobName}
          </div>
          <UncontrolledTooltip
            placement='top'
            autohide={true}
            target={`scheduled_job_name${_id}`}
          >
            {scheduledJobName}
          </UncontrolledTooltip>
          <div className='action-btn-wrapper'>
            {status === 'SUCCESS' ||
              (status === 'SENT' && (
                <>
                  <div className='action-btn bar-chart-btn'>
                    <BarChart2
                      size={15}
                      // color='#64c664'
                      className={`${
                        status === 'SUCCESS' || status === 'SENT'
                          ? 'cursor-pointer'
                          : 'cursor-not-allowed'
                      }`}
                      onClick={() => {
                        if (status === 'SUCCESS' || status === 'SENT')
                          history.push(
                            `${basicRoute}/mass-email/statistics/${_id}`
                          );
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
              ))}

            <div className='action-btn bar-chart-btn'>
              <Copy
                size={15}
                className='cursor-pointer'
                onClick={() => cloneEmailBlast(_id)}
                id={`copy_${_id}`}
              />
              <UncontrolledTooltip
                key={`copy_${_id}`}
                placement='top'
                autohide={true}
                target={`copy_${_id}`}
              >
                Clone
              </UncontrolledTooltip>
            </div>

            {!isPastScheduled && status === 'PENDING' ? (
              <>
                <div className='action-btn bar-chart-btn'>
                  <Edit2
                    size={15}
                    className={`${
                      isEditable ? 'cursor-pointer ' : 'cursor-not-allowed'
                    }`}
                    onClick={() => {
                      isEditable &&
                        setEditViewModal({
                          isOpen: true,
                          mode: 'edit',
                          id: _id,
                        });
                    }}
                    id={`edit_${_id}`}
                  />
                  <UncontrolledTooltip
                    placement='top'
                    autohide={true}
                    target={`edit_${_id}`}
                  >
                    {isEditable
                      ? 'Edit Scheduled Mail'
                      : "You can't edit before 5 minutes of scheduled time"}
                  </UncontrolledTooltip>
                </div>
              </>
            ) : (
              <></>
            )}

            {!isPastScheduled && status === 'PENDING' ? (
              <>
                <div className='action-btn bar-chart-btn'>
                  <XCircle
                    size={15}
                    color='red'
                    className={`${
                      status === 'PENDING'
                        ? 'cursor-pointer'
                        : 'cursor-not-allowed'
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
                    Cancel scheduled mass email
                  </UncontrolledTooltip>
                </div>
              </>
            ) : (
              <></>
            )}
            <>
              <div className='action-btn bar-chart-btn'>
                <Eye
                  size={15}
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
                  {/* View scheduled mass email detail */}
                  View
                </UncontrolledTooltip>
              </div>
            </>
          </div>
        </div>
        <div className='body-wrapper'>
          <Badge className='' color={`light-${selectBadge(status)}`} pill>
            {status.toLowerCase()}
          </Badge>
          <div className='items-row-wrapper'>
            <div className='items-row'>
              <span className='label'>Total number of contacts: </span>
              <span className='value'>{massEmailId?.contacts?.length}</span>
            </div>
            <div className='items-row'>
              <span className='label'>Success: </span>
              <span className='value'>{successCount}</span>
            </div>
            <div className='items-row'>
              <span className='label'>Failed: </span>
              <span className='value'>{failedCount}</span>
            </div>
            <div className='items-row'>
              <span className='label'>Scheduled Date Time: </span>
              <span className='value'>
                {moment(new Date(scheduledTime)).format('DD-MM-YY hh:mm A')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ScheduledMassEmailCard;
