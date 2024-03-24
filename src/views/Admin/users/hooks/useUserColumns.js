import { Edit2, LogIn, Trash } from 'react-feather';
import { Spinner, UncontrolledTooltip } from 'reactstrap';
import useGetBasicRoute from '../../../../hooks/useGetBasicRoute';
import { useHistory } from 'react-router-dom';

const useUserColumns = ({
  user,
  handleVirtualLogin,
  handleConfirmDelete,
  virtualLoginLoading,
}) => {
  /** hook */
  const { basicRoute } = useGetBasicRoute();
  const history = useHistory();
  const columns = [
    {
      name: 'First Name',
      minWidth: '250px',
      sortField: 'firstName',
      sortable: true,
      selector: (row) => row?.firstName,
      cell: (row) => {
        return (
          <div className='user-list-first-name'>
            <span
              className='cursor-pointer name'
              onClick={() => history.push(`${basicRoute}/users/${row?._id}`)}
            >
              {row?.firstName ? row?.firstName : '-'}
            </span>
            {!row?.active && (
              <>
                <span
                  id={`in_active_${row._id}`}
                  className='badge-dot-danger'
                  // onMouseOutCapture={() => {
                  //   markNotificationAsRead(subTaskItem);
                  // }}
                ></span>
                <UncontrolledTooltip
                  placement='top'
                  target={`in_active_${row?._id}`}
                >
                  Inactive
                </UncontrolledTooltip>
              </>
            )}
          </div>
        );
      },
    },
    {
      name: 'Last Name',
      sortable: true,
      minWidth: '250px',
      sortField: 'lastName',
      selector: (row) => row?.lastName,
      cell: (row) => {
        return (
          <div>
            <span
              className='cursor-pointer'
              onClick={() => history.push(`${basicRoute}/users/${row?._id}`)}
            >
              {row?.lastName ? row?.lastName : '-'}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Email',
      sortable: true,
      minWidth: '250px',
      sortField: 'email',
      selector: (row) => row?.email,
      cell: (row) => {
        return (
          <div>
            <span
              className='cursor-pointer'
              onClick={() => history.push(`${basicRoute}/users/${row?._id}`)}
            >
              {row?.email}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Role',
      sortable: true,
      minWidth: '250px',
      sortField: 'role',
      selector: (row) => row?.role,
      cell: (row) => {
        return (
          <div>
            <span
              className='cursor-pointer'
              onClick={() => history.push(`${basicRoute}/users/${row?._id}`)}
            >
              {row?.role
                ? row.role.charAt(0).toUpperCase() + row.role.slice(1)
                : '-'}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Phone',
      sortable: true,
      sortField: 'phone',
      minWidth: '150px',
      selector: (row) => row?.phone,
      cell: (row) => {
        return (
          <div>
            <span
              className='cursor-pointer'
              onClick={() => history.push(`${basicRoute}/users/${row?._id}`)}
            >
              {row?.phone ? row?.phone : '-'}
            </span>
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
            {!row?.archived && (
              <>
                <div className='action-btn edit-btn'>
                  <Edit2
                    // color={'#64c664'}
                    size={15}
                    className='cursor-pointer'
                    onClick={() => {
                      history.push(`${basicRoute}/users/${row?._id}`);
                    }}
                    id={`edit_${row?._id}`}
                  ></Edit2>
                  <UncontrolledTooltip
                    placement='top'
                    target={`edit_${row?._id}`}
                  >
                    Edit
                  </UncontrolledTooltip>
                </div>
              </>
            )}

            {['admin', 'superadmin'].includes(user?.role) && (
              <>
                <div className='action-btn delete-btn'>
                  <Trash
                    color='red'
                    size={15}
                    className='cursor-pointer'
                    onClick={() => handleConfirmDelete(row?._id)}
                    id={`delete_${row?._id}`}
                  ></Trash>
                  <UncontrolledTooltip
                    placement='top'
                    target={`delete_${row?._id}`}
                  >
                    Delete
                  </UncontrolledTooltip>
                </div>
              </>
            )}

            {['admin', 'superadmin'].includes(user?.role) && row?._id && (
              <>
                {virtualLoginLoading === row?._id ? (
                  <>
                    <Spinner className='me-25' size='sm' />
                  </>
                ) : (
                  <>
                    <div className='action-btn delete-btn'>
                      <LogIn
                        // color={'#a3db59'}
                        size={15}
                        className='cursor-pointer'
                        onClick={() => handleVirtualLogin(row?._id)}
                        id={`virtual_lo${row?._id}`}
                      ></LogIn>
                      <UncontrolledTooltip
                        placement='top'
                        target={`virtual_lo${row?._id}`}
                      >
                        Login as
                      </UncontrolledTooltip>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        );
      },
    },
  ];
  return { columns };
};

export default useUserColumns;
