import ItemTable from '../../../@core/components/data-table';
import { Eye } from 'react-feather';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import UILoader from '@components/ui-loader';
import { getContactDetails } from '../../../api/contacts';
import Select from 'react-select';
import { selectThemeColors } from '@utils';
import { getCurrentUser, isSuperAdmin } from '../../../helper/user.helper';
import { UncontrolledTooltip } from 'reactstrap';

const Contact = ({
  hideTitle = false,
  hideButton = false,
  companyName = false,
}) => {
  const [contacts, setContacts] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [filterCompany, setFilterCompany] = useState(false);
  const getRecords = () => {
    setFetching(true);
    if (!filterCompany) {
      getContactDetails({ sort: { createdAt: -1 } })
        .then((res) => {
          setFetching(false);
          setContacts(res.data.data);
        })
        .catch(() => {
          setFetching(false);
        });
    } else {
      getContactDetails({
        'companyDetail.id': filterCompany,
        sort: { createdAt: -1 },
      })
        .then((res) => {
          setFetching(false);
          setContacts(res.data.data);
        })
        .catch(() => {
          setFetching(false);
        });
    }
  };
  useEffect(() => {
    if (!isSuperAdmin()) {
      const user = getCurrentUser();
      setFilterCompany(user.company._id);
    } else {
      getRecords();
    }
  }, []);

  useEffect(() => {
    if (filterCompany) {
      getRecords();
    }
  }, [filterCompany]);
  const history = useHistory();

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
              onClick={() => history.push(`/contacts/${row?._id}`)}
            >
              {row?.firstName}
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
              onClick={() => history.push(`/contacts/${row?._id}`)}
            >
              {row?.lastName}
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
              onClick={() => history.push(`/contacts/${row?._id}`)}
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
              onClick={() => history.push(`/contacts/${row?._id}`)}
            >
              {row?.phone}
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
          <div className='d-flex'>
            <Eye
              size={15}
              className='cursor-pointer me-1'
              onClick={() => {
                history.push(`/contacts/${row?._id}`);
              }}
              id={`view_${row?._id}`}
            ></Eye>
            <UncontrolledTooltip placement='top' target={`view_${row?._id}`}>
              View
            </UncontrolledTooltip>
          </div>
        );
      },
    },
  ];

  const handleCompanyChange = (e) => {
    setFilterCompany(e.value);
  };

  return (
    <UILoader blocking={fetching}>
      {companyName && companyName.length > 0 && (
        <div className='mb-1 w-25'>
          <Select
            id={'company_details'}
            theme={selectThemeColors}
            style={{ width: '20%' }}
            placeholder={'Select Company'}
            classNamePrefix='select'
            options={companyName}
            isClearable={false}
            onChange={(e) => {
              handleCompanyChange(e);
            }}
            isMulti={false}
            isOptionSelected={(option, selectValue) =>
              selectValue.some((i) => i === option)
            }
            isDisabled={false}
          />
        </div>
      )}
      <ItemTable
        columns={columns}
        data={contacts}
        title={!hideTitle ? 'Contact List' : ''}
        addItemLink={'/contacts/add'}
        buttonTitle={'Add Contact'}
        itemsPerPage={10}
        hideButton={hideButton}
        filterCompany={filterCompany}
      />
    </UILoader>
  );
};

export default Contact;
