// ==================== Packages =======================
import { Edit2, Send, Trash } from 'react-feather';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
  Button,
  // Card,
  // CardBody,
  // CardHeader,
  UncontrolledTooltip,
} from 'reactstrap';
// ====================================================
import useGetBasicRoute from '../../../../../hooks/useGetBasicRoute';
import { userData } from '../../../../../redux/user';

const MassEmailCard = ({ item, handleConfirmDelete, sendMassEmail }) => {
  const { title, contacts, _id } = item;
  // ========================== Hooks =========================
  const user = useSelector(userData);
  const history = useHistory();
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
                color='var(--primaryColorDark)'
                size={15}
                className='cursor-pointer'
                onClick={() => {
                  if (user.role === 'superadmin') {
                    history.push(`${basicRoute}/mass-email/${_id}`);
                  } else if (user.role === 'admin') {
                    history.push(`${basicRoute}/mass-email/${_id}`);
                  }
                }}
                id={`edit_${_id}`}
              />
              <UncontrolledTooltip
                placement='top'
                autohide={true}
                target={`edit_${_id}`}
              >
                Edit Mass Email
              </UncontrolledTooltip>
            </div>
            <div className='action-btn delete-btn'>
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
                {'Delete Mass email'}
              </UncontrolledTooltip>
            </div>
          </div>
        </div>
        <div className='body-wrapper'>
          <div className='nummber-of-contact'>
            <span className='title'>Total number of contacts: </span>
            <span className='text'>{contacts || 0}</span>
          </div>
          <div className='btn-wrapper'>
            <Button
              color='primary'
              onClick={() => {
                sendMassEmail(_id);
              }}
            >
              <Send size={15} />
              <span className='align-middle ms-50'>Send Email</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MassEmailCard;
