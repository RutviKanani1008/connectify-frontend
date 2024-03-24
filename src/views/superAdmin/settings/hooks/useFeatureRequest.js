import { Eye, MessageSquare, Trash } from 'react-feather';
import { UncontrolledTooltip } from 'reactstrap';
import { isSuperAdmin } from '../../../../helper/user.helper';
import moment from 'moment';

export const useFeatureReqColumns = ({
  handlePreview,
  handleDelete,
  handleOpenComments,
  ticketStatus,
  checkNewComments,
}) => {
  // ** Hooks
  // ** CUstom Hooks

  const columns = [
    {
      name: 'Name',
      minWidth: '180px',
      cell: (row) => {
        return (
          <div>
            <span>{`${row?.firstName || ''} ${row?.lastName || ''}`}</span>
          </div>
        );
      },
    },
    {
      name: 'Email',
      minWidth: '180px',
      selector: (row) => row?.email,
      cell: (row) => {
        return (
          <div>
            <span>{row?.email ? row?.email : '-'}</span>
          </div>
        );
      },
    },
    ...(isSuperAdmin()
      ? [
          {
            name: 'Company',
            minWidth: '180px',
            selector: (row) => row?.company?.name,
            cell: (row) => {
              return (
                <div>
                  <span>{row?.company?.name ? row?.company?.name : '-'}</span>
                </div>
              );
            },
          },
        ]
      : []),
    {
      name: 'Message',
      minWidth: '180px',
      selector: (row) => row?.requestMessage,
      cell: (row) => {
        return (
          <span className='text-truncate' style={{ maxWidth: '180px' }}>
            {row?.requestMessage ? row?.requestMessage : '-'}
          </span>
        );
      },
    },
    {
      name: 'Status',
      minWidth: '180px',
      selector: (row) => row?.status,
      cell: (row) => {
        return (
          <span className='text-truncate' style={{ maxWidth: '180px' }}>
            {row?.status ? ticketStatus(row?.status)?.label : '-'}
          </span>
        );
      },
    },
    {
      name: 'Date Submitted',
      minWidth: '180px',
      selector: (row) => row?.createdAt,
      cell: (row) => {
        return (
          <div>
            <span>{moment(row.createdAt).format('MM/DD/YYYY | HH:mm A')}</span>
          </div>
        );
      },
    },
    {
      name: 'Actions',
      allowOverflow: true,
      cell: (row) => {
        return (
          <div className='action-btn-wrapper'>
            <>
              <div
                className='action-btn view-btn'
                onClick={() => handlePreview(row)}
              >
                <Eye
                  size={15}
                  className='cursor-pointer'
                  id={`preview_${row?._id}`}
                />
                <UncontrolledTooltip
                  placement='top'
                  target={`preview_${row?._id}`}
                >
                  Preview
                </UncontrolledTooltip>
              </div>

              <div className='action-btn delete-btn'>
                <Trash
                  color='red'
                  size={15}
                  className='cursor-pointer'
                  onClick={() => handleDelete(row?._id)}
                  id={`delete_${row?._id}`}
                />
                <UncontrolledTooltip
                  placement='top'
                  target={`delete_${row?._id}`}
                >
                  Delete
                </UncontrolledTooltip>
              </div>

              <div
                className='action-btn message-btn'
                onClick={() => handleOpenComments(row)}
              >
                <MessageSquare
                  size={15}
                  color='black'
                  className='cursor-pointer'
                  id={`comment_${row?._id}`}
                />
                <>{checkNewComments(row) && <div className='count'>New</div>}</>
                <UncontrolledTooltip
                  placement='top'
                  target={`comment_${row?._id}`}
                >
                  Comments
                </UncontrolledTooltip>
              </div>
            </>
          </div>
        );
      },
    },
  ];

  return { columns };
};
