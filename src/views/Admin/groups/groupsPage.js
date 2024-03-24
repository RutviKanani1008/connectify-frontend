import React, { useEffect, useState } from 'react';
import ItemTable from '../../../@core/components/data-table';
import { Eye } from 'react-feather';
import { useHistory } from 'react-router-dom';
import UILoader from '@components/ui-loader';
import { getContactDetails } from '../../../api/contacts';
import { useSelector } from 'react-redux';
import { userData } from '../../../redux/user';
import { UncontrolledTooltip } from 'reactstrap';
import useGetBasicRoute from '../../../hooks/useGetBasicRoute';

const ContactList = ({ hideButton = false, viewContactObj }) => {
  const { basicRoute } = useGetBasicRoute();
  const [contacts, setContacts] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [currentTab, setCurrentTab] = useState('active');
  const user = useSelector(userData);
  const history = useHistory();
  const getRecords = (archived) => {
    setCurrentTab(archived ? 'archive' : 'active');
    setFetching(true);
    getContactDetails({
      company: user.company._id,
      'group.id': viewContactObj?.groupId,
      // archived,
      sort: { createdAt: -1 },
      archived: false,
    })
      .then((res) => {
        setFetching(false);
        setContacts(res.data.data);
      })
      .catch(() => {
        setFetching(false);
      });
  };
  useEffect(() => {
    if (viewContactObj && viewContactObj.groupId && viewContactObj?.groupName) {
      getRecords();
    }
  }, [viewContactObj]);

  const columns = [
    {
      name: 'First Name',
      minWidth: '250px',
      sortable: (row) => row?.firstName,
      selector: (row) => row?.firstName,
      cell: (row) => {
        return (
          <div>
            <span
              className='cursor-pointer'
              onClick={() => history.push(`${basicRoute}/contact/${row?._id}`)}
            >
              {row?.firstName ? row?.firstName : '-'}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Last Name',
      sortable: true,
      minWidth: '250px',
      selector: (row) => row?.lastName,
      cell: (row) => {
        return (
          <div>
            <span
              className='cursor-pointer'
              onClick={() => history.push(`${basicRoute}/contact/${row?._id}`)}
            >
              {row.lastName ? row.lastName : '-'}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Email',
      sortable: true,
      minWidth: '250px',
      selector: (row) => row?.email,
      cell: (row) => {
        return (
          <div>
            <span
              className='cursor-pointer'
              onClick={() => history.push(`${basicRoute}/contact/${row?._id}`)}
            >
              {row?.email}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Phone',
      sortable: true,
      minWidth: '150px',
      selector: (row) => row?.phone,
      cell: (row) => {
        return (
          <div>
            <span
              className='cursor-pointer'
              onClick={() => history.push(`${basicRoute}/contact/${row?._id}`)}
            >
              {row?.phone ? row?.phone : '-'}
            </span>
          </div>
        );
      },
    },
    {
      ...(currentTab === 'active' && {
        name: 'Actions',
        allowOverflow: true,
        cell: (row) => {
          return (
            <div className='action-btn-wrapper'>
              <div className='action-btn'>
                <Eye
                  // color='#a3db59'
                  size={15}
                  className='cursor-pointer'
                  onClick={() => {
                    history.push(`${basicRoute}/contact/${row?._id}`);
                  }}
                  id={`view_${row?._id}`}
                ></Eye>
                <UncontrolledTooltip
                  placement='top'
                  target={`view_${row?._id}`}
                >
                  View
                </UncontrolledTooltip>
              </div>
            </div>
          );
        },
      }),
    },
  ];

  return (
    <UILoader blocking={fetching}>
      <ItemTable
        columns={columns}
        data={contacts}
        hideExport={true}
        itemsPerPage={10}
        hideButton={hideButton}
      />
    </UILoader>
  );
};

export default ContactList;
