import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Input } from 'reactstrap';
import ItemTable from '../../../@core/components/data-table';
import { companyUser } from '../../../api/company';
import { userData } from '../../../redux/user';
import UILoader from '@components/ui-loader';

const CompanyMemberList = () => {
  const [companyMember, setCompanyMember] = useState([]);
  const [fetching, setFetching] = useState(false);
  const user = useSelector(userData);

  const getCompanyMembers = () => {
    setFetching(true);
    companyUser({ company: user.company._id })
      .then((res) => {
        if (res && res.data && res.data.data && res.data.data.length > 0) {
          const companyUserData = res.data.data;
          const filterData = companyUserData.filter(
            (userCompany) => userCompany._id !== user._id
          );
          setCompanyMember(filterData);
        }
        setFetching(false);
      })
      .catch(() => {
        setFetching(false);
      });
  };

  useEffect(() => {
    getCompanyMembers();
  }, []);

  const columns = [
    {
      name: 'Title',
      minWidth: '250px',
      sortable: (row) => row?.relation,
      selector: (row) => row?.relation,
      cell: (row) => {
        return (
          <div>
            <span className='cursor-pointer'>{row?.relation}</span>
          </div>
        );
      },
    },
    {
      name: 'Name',
      sortable: true,
      minWidth: '250px',
      selector: (row) => row?.lastName,
      cell: (row) => {
        return (
          <div>
            <span className='cursor-pointer'>
              {`${row?.firstName} ${row?.lastName}`}
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
            <span className='cursor-pointer'>{row?.email}</span>
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
            <span className='cursor-pointer'>{row?.phone}</span>
          </div>
        );
      },
    },
    {
      name: 'Role',
      sortable: true,
      minWidth: '150px',
      selector: (row) => row?.role,
      cell: (row) => {
        return (
          <div>
            <span className='cursor-pointer'>{row?.role}</span>
          </div>
        );
      },
    },
    {
      name: 'Status',
      allowOverflow: true,
      cell: (row) => {
        return (
          <div className='d-flex'>
            <span className='align-middle ms-50'>
              <div className='form-switch'>
                <Input
                  type='switch'
                  label='Status'
                  name='status'
                  defaultChecked={row?.active}
                  disabled={true}
                />
              </div>
            </span>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <UILoader blocking={fetching}>
        <ItemTable
          columns={columns}
          data={companyMember}
          title={'Company Members'}
          hideButton={true}
          itemsPerPage={10}
          selectableRows={false}
        />
      </UILoader>
    </div>
  );
};

export default CompanyMemberList;
