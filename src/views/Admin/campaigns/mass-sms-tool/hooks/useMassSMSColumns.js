// ==================== Packages =======================
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { UncontrolledTooltip } from 'reactstrap';
import { Edit2, Send, Trash } from 'react-feather';
// ====================================================
import { userData } from '../../../../../redux/user';
import useGetBasicRoute from '../../../../../hooks/useGetBasicRoute';

const useMassSMSColumns = () => {
  // ========================== Hooks =========================
  const history = useHistory();
  const user = useSelector(userData);

  // ========================== Custom Hooks =========================
  const { basicRoute } = useGetBasicRoute();

  const massSMSColumns = ({ sendMassSMS, handleConfirmDelete }) => {
    return [
      {
        name: 'Title',
        sortable: (row) => row?.title,
        selector: (row) => row?.title,
        cell: (row) => {
          return (
            <div>
              <span
                className='cursor-pointer'
                onClick={() =>
                  history.push(`${basicRoute}/mass-sms/${row?._id}`)
                }
              >
                {row?.title ? row?.title : '-'}
              </span>
            </div>
          );
        },
      },
      {
        name: 'Actions',
        width: '120px',
        allowOverflow: true,
        cell: (row) => {
          return (
            <div className='text-primary d-flex mt-md-0 mt-1'>
              <>
                <Edit2
                  size={15}
                  color={'#64c664'}
                  className='me-1 cursor-pointer'
                  onClick={() => {
                    if (user.role === 'admin') {
                      history.push(`${basicRoute}/mass-sms/${row?._id}`);
                    }
                  }}
                  id={`edit_${row?._id}`}
                />
                <UncontrolledTooltip
                  placement='top'
                  autohide={true}
                  target={`edit_${row?._id}`}
                >
                  Edit Mass SMS
                </UncontrolledTooltip>
              </>
              <Trash
                size={15}
                color='red'
                className='cursor-pointer'
                onClick={() => {
                  handleConfirmDelete(row?._id);
                }}
                id={`delete_${row?._id}`}
              />
              <UncontrolledTooltip
                placement='top'
                autohide={true}
                target={`delete_${row?._id}`}
              >
                {'Delete Mass sMS'}
              </UncontrolledTooltip>
              <Send
                size={15}
                className='cursor-pointer ms-1'
                onClick={() => {
                  sendMassSMS(row._id);
                }}
                id={`send_${row?._id}`}
              />
              <UncontrolledTooltip
                placement='top'
                autohide={true}
                target={`send_${row?._id}`}
              >
                {'Send Mass sMS'}
              </UncontrolledTooltip>
            </div>
          );
        },
      },
    ];
  };

  return { massSMSColumns };
};

export default useMassSMSColumns;
