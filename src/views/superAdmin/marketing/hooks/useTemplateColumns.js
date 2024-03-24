import { Copy, Edit2, Eye, Send, Trash } from 'react-feather';
import { UncontrolledTooltip } from 'reactstrap';

export const useSMSTemplateColumns = ({
  onEdit,
  onClone,
  onSend,
  onDelete,
}) => {
  return [
    {
      name: 'Title',
      minWidth: '400px',
      sortable: (row) => row?.name,
      selector: (row) => row?.name,
      sortField: 'name',
      cell: (row) => <span className='text-capitalize'>{row.name}</span>,
    },
    {
      name: 'Actions',
      minWidth: '250px',
      maxWidth: '300px',

      allowOverflow: true,
      cell: (row) => {
        const { _id } = row;

        return (
          <div className='action-btn-wrapper'>
            <div className='action-btn copy-btn'>
              <Copy
                // color='orange'
                size={15}
                className='cursor-pointer'
                onClick={() => onClone(_id, 'sms')}
                id={`clone_${_id}`}
              />
              {_id && (
                <UncontrolledTooltip
                  placement='top'
                  autohide={true}
                  target={`clone_${_id}`}
                >
                  Clone
                </UncontrolledTooltip>
              )}
            </div>
            <div className='action-btn edit-btn'>
              <Edit2
                size={15}
                className='cursor-pointer'
                onClick={() => onEdit(row)}
                // color={'#64c664'}
                id={`edit_${_id}`}
              />
              {_id && (
                <UncontrolledTooltip
                  placement='top'
                  autohide={true}
                  target={`edit_${_id}`}
                >
                  Edit
                </UncontrolledTooltip>
              )}
            </div>
            <div className='action-btn edit-btn'>
              <Send
                size={15}
                className='cursor-pointer'
                onClick={() => onSend(row)}
                id={`send_sms_${_id}`}
              />
              {_id && (
                <UncontrolledTooltip
                  placement='top'
                  autohide={true}
                  target={`send_sms_${_id}`}
                >
                  {row.templateType === 'email'
                    ? 'Send Test Email'
                    : 'Send Test SMS'}
                </UncontrolledTooltip>
              )}
            </div>
            <div className='action-btn edit-btn'>
              <Trash
                color='red'
                size={15}
                className='cursor-pointer'
                onClick={() => onDelete(row, 'sms')}
                id={`trash_${_id}`}
              />
              {/* {_id && (
                <UncontrolledTooltip
                  placement='top'
                  autohide={true}
                  target={`trash_${_id}`}
                >
                  Delete
                </UncontrolledTooltip>
              )} */}
            </div>
          </div>
        );
      },
    },
  ];
};

export const useEmailTemplateColumns = ({
  onPreview,
  onClone,
  onSend,
  onEdit,
  onDelete,
}) => {
  return [
    {
      name: 'Title',
      minWidth: '400px',
      sortable: (row) => row?.name,
      sortField: 'name',
      selector: (row) => row?.name,
      cell: (row) => <span className='text-capitalize'>{row.name}</span>,
    },
    {
      name: 'Subject',
      minWidth: '400px',
      sortable: (row) => row?.name,
      sortField: 'subject',
      selector: (row) => row?.name,
      cell: (row) => {
        const { subject } = row;
        return (
          <div className=''>
            <span className='align-middle ms-50'>{subject} </span>
          </div>
        );
      },
    },
    {
      name: 'Actions',
      minWidth: '250px',
      maxWidth: '300px',
      allowOverflow: true,
      cell: (row) => {
        const { _id, htmlBody } = row;

        return (
          <div className='action-btn-wrapper'>
            <div
              className='action-btn view-btn'
              onClick={() => {
                if (htmlBody) {
                  onPreview(row);
                }
              }}
            >
              <Eye
                size={15}
                className={htmlBody ? 'cursor-pointer' : 'cursor-not-allowed'}
                id={`preview_${_id}`}
              />
              {_id && (
                <UncontrolledTooltip
                  placement='top'
                  autohide={true}
                  target={`preview_${_id}`}
                >
                  {htmlBody
                    ? 'Preview'
                    : 'Email body is empty, please add content to the email body to test the template.'}
                </UncontrolledTooltip>
              )}
            </div>
            <div className='action-btn copy-btn'>
              <Copy
                // color='orange'
                size={15}
                className='cursor-pointer'
                onClick={() => onClone(_id, 'email')}
                id={`clone_${_id}`}
              />
              {_id && (
                <UncontrolledTooltip
                  placement='top'
                  autohide={true}
                  target={`clone_${_id}`}
                >
                  Clone
                </UncontrolledTooltip>
              )}
            </div>
            <div className='action-btn edit-btn'>
              <Edit2
                size={15}
                className='cursor-pointer'
                onClick={() => onEdit(row)}
                // color={'#64c664'}
                id={`edit_${_id}`}
              />
              {_id && (
                <UncontrolledTooltip
                  placement='top'
                  autohide={true}
                  target={`edit_${_id}`}
                >
                  Edit
                </UncontrolledTooltip>
              )}
            </div>

            <div className='action-btn edit-btn'>
              <Send
                size={15}
                className={htmlBody ? 'cursor-pointer' : 'cursor-not-allowed'}
                onClick={() => {
                  if (htmlBody) {
                    onSend(row);
                  }
                }}
                id={`send_mail_${_id}`}
              />
              {_id && (
                <UncontrolledTooltip
                  placement='top'
                  autohide={true}
                  target={`send_mail_${_id}`}
                >
                  {htmlBody
                    ? 'Send Test Email'
                    : 'Email body is empty, please add content to the email body to test the template.'}
                </UncontrolledTooltip>
              )}
            </div>
            <div className='action-btn edit-btn'>
              <Trash
                color='red'
                size={15}
                className='cursor-pointer'
                onClick={() => onDelete(row, 'email')}
                id={`trash_${_id}`}
              />
            </div>
          </div>
        );
      },
    },
  ];
};
