import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { userData } from '../../../../redux/user';
import { Link } from 'react-router-dom';
import { Eye } from 'react-feather';
import { UncontrolledTooltip } from 'reactstrap';

const useContactColumns = () => {
  const user = useSelector(userData);

  const getUrlRedirect = (contactId) => {
    if (user.role === 'admin') {
      return `/admin/contact/${contactId}`;
    } else if (user.role === 'grandadmin') {
      return `/grandadmin/contact/${contactId}`;
    } else if (user.role === 'superadmin') {
      return `/contact/${contactId}`;
    }
  };

  const contactColumn = useMemo(() => {
    return [
      {
        name: 'First Name',
        minWidth: '250px',
        sortable: (row) => row?.firstName,
        selector: (row) => row?.firstName,
        cell: (row) => {
          const { _id } = row;
          return (
            <Link to={getUrlRedirect(_id)}>
              <div>
                <span className='cursor-pointer' style={{ color: 'black' }}>
                  {row?.firstName}
                </span>
              </div>
            </Link>
          );
        },
      },
      {
        name: 'Last Name',
        sortable: true,
        minWidth: '250px',
        selector: (row) => row?.lastName,
        cell: (row) => {
          const { _id } = row;

          return (
            <Link to={getUrlRedirect(_id)}>
              <div>
                <span className='cursor-pointer' style={{ color: 'black' }}>
                  {row?.lastName}
                </span>
              </div>
            </Link>
          );
        },
      },
      {
        name: 'Email',
        sortable: true,
        minWidth: '350px',
        selector: (row) => row?.email,
        cell: (row) => {
          const { _id } = row;

          return (
            <Link to={getUrlRedirect(_id)}>
              <div>
                <span className='cursor-pointer' style={{ color: 'black' }}>
                  {row?.email}
                </span>
              </div>
            </Link>
          );
        },
      },
      {
        name: 'View',
        sortable: true,
        minWidth: '10px',
        selector: (row) => row?.phone,
        cell: (row) => {
          const { _id } = row;

          return (
            <Link to={getUrlRedirect(_id)}>
              <div>
                <Eye
                  size={15}
                  className='cursor-pointer'
                  style={{ color: 'black' }}
                  id={`view_${row?._id}`}
                ></Eye>
                <UncontrolledTooltip
                  placement='top'
                  target={`view_${row?._id}`}
                >
                  View Contacts
                </UncontrolledTooltip>
              </div>
            </Link>
          );
        },
      },
    ];
  }, []);

  return { contactColumn };
};

export default useContactColumns;
