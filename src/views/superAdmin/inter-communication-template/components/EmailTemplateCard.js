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
  const { name, subject, _id } = item;
  return (
    <div className='company-form-card'>
      <div className='header-wrapper'>
        <div className='form-card-title'>{name}</div>
        <div className='action-btn-wrapper'>
          <div className='action-btn view-btn'>
            <Eye
              size={15}
              className='cursor-pointer'
              onClick={() => {
                openPreview(item);
              }}
              id={`preview_${_id}`}
            />

            <UncontrolledTooltip
              placement='top'
              autohide={true}
              target={`preview_${_id}`}
            >
              Preview
            </UncontrolledTooltip>
          </div>

          {!item.isAutoResponderTemplate ? (
            <>
              <div className='action-btn copy-btn'>
                <Copy
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
              size={15}
              className='cursor-pointer'
              onClick={() => {
                setEditItem(item);
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
          <Button
            color='primary'
            onClick={() => {
              sendTestMail(item, 'email');
            }}
          >
            <Send size={15} />
            <span className='align-middle ms-50'>Send Test Email</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
export default EmailTemplateCard;
