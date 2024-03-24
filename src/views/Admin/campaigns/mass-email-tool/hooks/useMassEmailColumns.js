// ==================== Packages =======================
import { Edit2, Send, Trash } from 'react-feather';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { UncontrolledTooltip } from 'reactstrap';
// ====================================================
import useGetBasicRoute from '../../../../../hooks/useGetBasicRoute';
import { userData } from '../../../../../redux/user';

const useMassEmailColumns = () => {
  // ========================== Hooks =========================
  const history = useHistory();
  const user = useSelector(userData);

  // ========================== Custom Hooks =========================
  const { basicRoute } = useGetBasicRoute();

  const massEmailColumns = ({ sendMassEmail, handleConfirmDelete }) => {
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
                  history.push(`${basicRoute}/mass-email/${row?._id}`)
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
            <div className='action-btn-wrapper'>
              <>
                <div className='action-btn edit-btn'>
                  <Edit2
                    size={15}
                    // color={'#64c664'}
                    color='#000000'
                    className='cursor-pointer'
                    onClick={() => {
                      if (user.role === 'superadmin') {
                        history.push(`${basicRoute}/mass-email/${row?._id}`);
                      } else if (user.role === 'admin') {
                        history.push(`${basicRoute}/mass-email/${row?._id}`);
                      }
                    }}
                    id={`edit_${row?._id}`}
                  />
                  <UncontrolledTooltip
                    placement='top'
                    autohide={true}
                    target={`edit_${row?._id}`}
                  >
                    Edit Mass Email
                  </UncontrolledTooltip>
                </div>
              </>
              <div className='action-btn send-btn'>
                <Send
                  size={15}
                  color='#000000'
                  className='cursor-pointer'
                  onClick={() => {
                    sendMassEmail(row._id);
                  }}
                  id={`send_${row?._id}`}
                />
                <UncontrolledTooltip
                  placement='top'
                  autohide={true}
                  target={`send_${row?._id}`}
                >
                  {'Send Mass email'}
                </UncontrolledTooltip>
              </div>
              <div className='action-btn delete-btn'>
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
                  {'Delete Mass email'}
                </UncontrolledTooltip>
              </div>
            </div>
          );
        },
      },
    ];
  };

  return { massEmailColumns };
};

export default useMassEmailColumns;
