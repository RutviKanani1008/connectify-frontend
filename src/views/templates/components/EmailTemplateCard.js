// ==================== Packages =======================

import { Copy, Edit2, Eye, Send, Trash } from 'react-feather';
import {
  Button,
  // Card,
  // CardBody,
  // CardHeader,
  UncontrolledTooltip,
} from 'reactstrap';

// ====================================================

const EmailTemplateCard = ({
  item,
  openPreview,
  cloneTemplateDetails,
  setEditItem,
  setTemplateType,
  setShowForm,
  handleConfirmDelete,
  sendTestMail,
}) => {
  const { name, subject, _id, htmlBody } = item;
  return (
    <div className='company-form-card'>
      <div className='header-wrapper'>
        <div className='form-card-title'>{name}</div>
        <div className='action-btn-wrapper'>
          <div className='action-btn view-btn'>
            <Eye
              size={15}
              color='#000000'
              className={htmlBody ? 'cursor-pointer' : 'cursor-not-allowed'}
              onClick={() => {
                if (htmlBody) {
                  openPreview(item);
                }
              }}
              id={`preview_${_id}`}
            />

            <UncontrolledTooltip
              placement='top'
              autohide={true}
              target={`preview_${_id}`}
            >
              {htmlBody
                ? 'Preview'
                : 'Email body is empty, please add content to the email body to test the template.'}
            </UncontrolledTooltip>
          </div>

          {!item.isAutoResponderTemplate ? (
            <>
              <div className='action-btn copy-btn'>
                <Copy
                  color='#000000'
                  size={15}
                  className='cursor-pointer'
                  onClick={() => cloneTemplateDetails(_id, 'email')}
                  id={`clone_${_id}`}
                />
                <UncontrolledTooltip
                  placement='top'
                  autohide={true}
                  target={`clone_${_id}`}
                >
                  Clone
                </UncontrolledTooltip>
              </div>
            </>
          ) : null}
          <div className='action-btn edit-btn'>
            <Edit2
              color='#000000'
              size={15}
              className='cursor-pointer'
              onClick={() => {
                setEditItem({
                  ...item,
                  folder: item.folder?._id
                    ? {
                        id: item.folder?._id,
                        value: item.folder?._id,
                        label: item.folder?.folderName,
                      }
                    : null,
                });
                setTemplateType('email');
                setShowForm(true);
              }}
              id={`edit_${_id}`}
            />
            <UncontrolledTooltip
              placement='top'
              autohide={true}
              target={`edit_${_id}`}
            >
              Edit
            </UncontrolledTooltip>
          </div>
          {!item.isAutoResponderTemplate && (
            <>
              <div className='action-btn delete-btn'>
                <Trash
                  color='red'
                  size={15}
                  className='cursor-pointer'
                  onClick={() => handleConfirmDelete(item, 'email')}
                  id={`trash_${_id}`}
                />
                <UncontrolledTooltip
                  placement='top'
                  autohide={true}
                  target={`trash_${_id}`}
                >
                  Delete
                </UncontrolledTooltip>
              </div>
            </>
          )}
        </div>
      </div>
      <div className='body-wrapper'>
        {subject && (
          <div className='cn-wrapper'>
            <h3 className='title'>Subject</h3>
            <p className='text'>{subject}</p>
          </div>
        )}
        <div className='btn-wrapper'>
          <span
            id={`send_test_email_${_id}`}
            className={htmlBody ? 'cursor-pointer' : 'cursor-not-allowed'}
          >
            <Button
              color='primary'
              disabled={!htmlBody}
              onClick={() => {
                if (htmlBody) {
                  sendTestMail(item, 'email');
                }
              }}
            >
              <div className='icon-wrapper'>
                <Send size={15} />
              </div>
              <span className='align-middle ms-50'>Send Test Email</span>
            </Button>
          </span>
          <UncontrolledTooltip
            placement='top'
            autohide={true}
            target={`send_test_email_${_id}`}
          >
            {htmlBody
              ? 'Send Test Email'
              : 'Email body is empty, please add content to the email body to test the template.'}
          </UncontrolledTooltip>
        </div>
      </div>
    </div>
  );
};
export default EmailTemplateCard;
