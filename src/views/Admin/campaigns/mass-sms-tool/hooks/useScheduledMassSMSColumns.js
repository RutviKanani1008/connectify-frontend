/* eslint-disable no-mixed-operators */
// ==================== Packages =======================
import moment from 'moment';
import { Edit2, Eye, XCircle } from 'react-feather';
import { Badge, UncontrolledTooltip } from 'reactstrap';
// ====================================================
import { selectBadge } from '../components/ScheduledMassSMSCard';

const useScheduledMassSMSColumns = () => {
  const scheduledMassSMSColumns = ({
    handleConfirmCancel,
    setEditViewModal,
  }) => [
    {
      name: 'Scheduled Job Name',
      sortable: (row) => row?.scheduledJobName,
      selector: (row) => row?.scheduledJobName,
      cell: (row) => {
        return (
          <div>
            <span className='cursor-pointer'>{row.scheduledJobName}</span>
          </div>
        );
      },
    },
    {
      name: 'Mass SMS Title',
      sortable: (row) => (row?.massSMSId.saveAs ? row?.massSMSId.title : '-'),
      selector: (row) => (row?.massSMSId.saveAs ? row?.massSMSId.title : '-'),
      cell: (row) => {
        return (
          <div>
            <span className='cursor-pointer'>
              {row?.massSMSId.saveAs ? row?.massSMSId.title : '-'}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Scheduled Date Time',
      sortable: (row) => row.scheduledTime,
      selector: (row) => row.scheduledTime,
      cell: (row) => {
        return (
          <div>
            <span className='cursor-pointer'>
              {moment(new Date(row.scheduledTime)).format('DD-MM-YY hh:mm A')}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Status',
      cell: (row) => {
        return (
          <Badge color={`light-${selectBadge(row.status)}`} pill>
            {row.status.toLowerCase()}
          </Badge>
        );
      },
    },
    {
      name: 'Actions',
      id: 'scheduled-mass-sms-action',
      width: '120px',
      allowOverflow: true,
      cell: (row) => {
        const isEditable =
          new Date(Date.now() + 60000 * 5).getTime() <
          new Date(row.scheduledTime).getTime();
        const isPastScheduled =
          new Date().getTime() > new Date(row.scheduledTime).getTime();
        return (
          <div className='text-primary d-flex mt-md-0 mt-1 me-2'>
            {!isPastScheduled && row.status === 'PENDING' ? (
              <>
                <Edit2
                  color={'#64c664'}
                  size={15}
                  className={`me-1 ${
                    isEditable ? 'cursor-pointer ' : 'cursor-not-allowed'
                  }`}
                  onClick={() => {
                    isEditable &&
                      setEditViewModal({
                        isOpen: true,
                        mode: 'edit',
                        id: row._id,
                      });
                  }}
                  id={`edit_${row._id}`}
                />
                <UncontrolledTooltip
                  placement='top'
                  autohide={true}
                  target={`edit_${row._id}`}
                >
                  {isEditable
                    ? 'Edit Scheduled SMS'
                    : "You can't edit before 5 minutes of scheduled time"}
                </UncontrolledTooltip>
              </>
            ) : (
              <></>
            )}

            {!isPastScheduled && row.status === 'PENDING' ? (
              <>
                <XCircle
                  size={15}
                  color='red'
                  className={`me-1 ${
                    row.status !== 'CANCELED'
                      ? 'cursor-pointer'
                      : 'cursor-not-allowed'
                  }`}
                  onClick={() => {
                    if (row.status !== 'CANCELED')
                      handleConfirmCancel(row._id, row.jobId);
                  }}
                  id={`cancel_${row?._id}`}
                />
                <UncontrolledTooltip
                  placement='top'
                  autohide={true}
                  target={`cancel_${row?._id}`}
                >
                  Cancel scheduled mass sms
                </UncontrolledTooltip>
              </>
            ) : (
              <></>
            )}

            <>
              <Eye
                size={15}
                className='cursor-pointer'
                onClick={() => {
                  setEditViewModal({
                    isOpen: true,
                    mode: 'view',
                    id: row?._id,
                  });
                }}
                id={`view_${row?._id}`}
              />
              <UncontrolledTooltip
                placement='top'
                autohide={true}
                target={`view_${row?._id}`}
              >
                View scheduled mass sms detail
              </UncontrolledTooltip>
            </>
          </div>
        );
      },
    },
  ];
  return { scheduledMassSMSColumns };
};

export default useScheduledMassSMSColumns;
