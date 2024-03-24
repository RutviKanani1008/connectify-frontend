// ==================== Packages =======================
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Edit2, Send, Trash } from 'react-feather';
import {
  Button,
  // Card,
  // CardBody,
  // CardHeader,
  UncontrolledTooltip,
} from 'reactstrap';
// ====================================================
import { userData } from '../../../../../redux/user';
import useGetBasicRoute from '../../../../../hooks/useGetBasicRoute';

const MassSMSCard = ({ item, handleConfirmDelete, sendMassSMS }) => {
  const { title, contacts, _id } = item;
  // ========================== Hooks =========================
  const history = useHistory();
  const user = useSelector(userData);
  // ========================== Custom Hooks =========================
  const { basicRoute } = useGetBasicRoute();

  return (
    <>
      <div className='company-form-card'>
        <div className='header-wrapper'>
          <div className='form-card-title' id={`title_${_id}`}>
            {title}
          </div>
          <UncontrolledTooltip
            placement='top'
            autohide={true}
            target={`title_${_id}`}
          >
            {title}
          </UncontrolledTooltip>
          <div className='action-btn-wrapper'>
            <div className='action-btn edit-btn'>
              <Edit2
                // color={'#64c664'}
                size={15}
                className='cursor-pointer'
                onClick={() => {
                  if (user.role === 'superadmin') {
                    history.push(`${basicRoute}/mass-sms/${_id}`);
                  } else if (user.role === 'admin') {
                    history.push(`${basicRoute}/mass-sms/${_id}`);
                  }
                }}
                id={`edit_${_id}`}
              />
              <UncontrolledTooltip
                placement='top'
                autohide={true}
                target={`edit_${_id}`}
              >
                Edit Mass SMS
              </UncontrolledTooltip>
            </div>
            <div className='action-btn edit-btn'>
              <Trash
                size={15}
                color='red'
                className='cursor-pointer'
                onClick={() => {
                  handleConfirmDelete(_id);
                }}
                id={`delete_${_id}`}
              />
              <UncontrolledTooltip
                placement='top'
                autohide={true}
                target={`delete_${_id}`}
              >
                {'Delete Mass SMS'}
              </UncontrolledTooltip>
            </div>
          </div>
        </div>
        <div className='body-wrapper'>
          <div className='items-row-wrapper'>
            <div className='items-row'>
              <span className='label'>Total number of contacts: </span>
              <span className='value'>{contacts.length}</span>
            </div>
            <div className='btn-wrapper'>
              <Button
                color='primary'
                onClick={() => {
                  sendMassSMS(_id);
                }}
              >
                <Send size={15} />
                <span className='align-middle ms-50'>Send SMS</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* static-design */}
      {/* <Col className='mass-sms-card-col' md='6'>
        <div className='company-form-card'>
          <div className='header-wrapper'>
            <div className='form-card-title'>
              Test lorem ipsum test lorem ipsum test lorem ipsum
            </div>
            <div className='action-btn-wrapper'>
              <div className='action-btn edit-btn'>
                <Edit2
                  // color={'#64c664'}
                  size={15}
                  className='cursor-pointer'
                />
              </div>
              <div className='action-btn edit-btn'>
                <Trash
                  size={15}
                  color='red'
                  className='cursor-pointer'
                />
              </div>
            </div>
          </div>
          <div className='body-wrapper'>
            <div className='nummber-of-contact'>
              <span className='title'>Total number of contacts: </span>
              <span className='text'>7466</span>
            </div>
            <div className='btn-wrapper'>
              <Button
                color='primary'
              >
                <Send size={15} />
                <span className='text'>Send SMS</span>
              </Button>
            </div>
          </div>
        </div>
      </Col> */}
      {/* static-design-end */}
    </>
  );
};

export default MassSMSCard;
