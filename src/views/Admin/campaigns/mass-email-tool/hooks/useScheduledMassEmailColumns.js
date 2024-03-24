/* eslint-disable no-mixed-operators */
// ==================== Packages =======================
import moment from 'moment';
import { BarChart2, Edit2, Eye, XCircle } from 'react-feather';
import { useHistory } from 'react-router-dom';
import { Badge, UncontrolledTooltip } from 'reactstrap';
import useGetBasicRoute from '../../../../../hooks/useGetBasicRoute';
// ====================================================
import { selectBadge } from '../components/ScheduledMassEmailCard';

const useScheduledMassEmailColumns = () => {
  // ========================== Hooks =================================
  const history = useHistory();
  // ========================== Custom Hooks =========================
  const { basicRoute } = useGetBasicRoute();

  const scheduledMassEmailColumns = ({
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
      name: 'Mass Email Title',
      sortable: (row) =>
        row?.massEmailId?.saveAs ? row?.massEmailId.title : '-',
      selector: (row) =>
        row?.massEmailId?.saveAs ? row?.massEmailId.title : '-',
      cell: (row) => {
        return (
          <div>
            <span className='cursor-pointer'>
              {row?.massEmailId?.saveAs ? row?.massEmailId.title : '-'}
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
      id: 'scheduled-mass-mail-action',
      name: 'Actions',
      width: '120px',
      allowOverflow: true,
      cell: (row) => {
        const isEditable =
          new Date(Date.now() + 60000 * 5).getTime() <
          new Date(row.scheduledTime).getTime();
        const isPastScheduled =
          new Date().getTime() > new Date(row.scheduledTime).getTime();
        return (
          <div className='action-btn-wrapper'>
            {/* {isPastScheduled && row.status === 'SUCCESS'*/}
            {(row.status === 'SENT' || row.status === 'SUCCESS') && (
              <>
                <div className='action-btn chart-btn'>
                  <BarChart2
                    size={15}
                    // color='#64c664'
                    color='#000000'
                    className={` ${
                      row.status === 'SUCCESS' || row.status === 'SENT'
                        ? 'cursor-pointer'
                        : 'cursor-not-allowed'
                    }`}
                    onClick={() => {
                      if (row.status === 'SUCCESS' || row.status === 'SENT')
                        history.push(
                          `${basicRoute}/mass-email/statistics/${row._id}`
                        );
                    }}
                    id={`sendgrid_${row._id}`}
                  />
                  <UncontrolledTooltip
                    placement='top'
                    autohide={true}
                    target={`sendgrid_${row._id}`}
                  >
                    View Sendgrid Statistics
                  </UncontrolledTooltip>
                </div>
              </>
            )}
            {!isPastScheduled && row.status === 'PENDING' ? (
              <>
                <div className='action-btn edit-btn'>
                  <Edit2
                    color='#000000'
                    size={15}
                    className={` ${
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
                      ? 'Edit Scheduled Mail'
                      : "You can't edit before 5 minutes of scheduled time"}
                  </UncontrolledTooltip>
                </div>
              </>
            ) : (
              <></>
            )}

            {!isPastScheduled && row.status === 'PENDING' ? (
              <>
                <div className='action-btn delete-btn'>
                  <XCircle
                    size={15}
                    color='red'
                    className={` ${
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
                    Cancel scheduled mass email
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
                  color='#000000'
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
                  {/* View scheduled mass email detail */}
                  View
                </UncontrolledTooltip>
              </div>
            </>
          </div>
        );
      },
    },
  ];
  return { scheduledMassEmailColumns };
};

export default useScheduledMassEmailColumns;
