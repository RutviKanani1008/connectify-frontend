// ==================== Packages =======================

import { Copy, Edit2, Send, Trash } from 'react-feather';
import {
  Button,
  // Card,
  // CardBody,
  // CardHeader,
  UncontrolledTooltip,
} from 'reactstrap';

// ====================================================

const SmsTemplateCard = ({
  item,
  cloneTemplateDetails,
  setEditItem,
  setTemplateType,
  setShowForm,
  handleConfirmDelete,
  sendTestSMS,
}) => {
  const { name, subject, _id, body } = item;
  return (
    <div className='company-form-card'>
      <div className='header-wrapper'>
        <div className='form-card-title'>{name}</div>
        <div className='action-btn-wrapper'>
          <div className='action-btn copy-btn'>
            <Copy
              // color='orange'
              size={15}
              className='cursor-pointer'
              onClick={() => cloneTemplateDetails(_id, 'sms')}
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
          <div className='action-btn edit-btn'>
            <Edit2
              size={15}
              className='cursor-pointer'
              onClick={() => {
                setEditItem(item);
                setTemplateType('sms');
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
                  onClick={() => handleConfirmDelete(item, 'sms')}
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
          <div>
            <span className='text-primary'>Subject</span>
            <p>{subject}</p>
          </div>
        )}
        <div className='cn-wrapper'>
          <h3 className='title'>Body</h3>
          <p className='text'>{body}</p>
        </div>
        <div className='btn-wrapper'>
          <Button
            color='primary'
            onClick={() => {
              sendTestSMS(item, 'sms');
            }}
          >
            <div className='icon-wrapper'><Send size={15} /></div>
            <span className='align-middle ms-50'>Send Test SMS</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
export default SmsTemplateCard;
