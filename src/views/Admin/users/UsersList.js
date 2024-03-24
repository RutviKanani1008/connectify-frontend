// ==================== Packages =======================
import React, { useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button } from 'reactstrap';
// ====================================================
import { userData } from '../../../redux/user';
import useGetBasicRoute from '../../../hooks/useGetBasicRoute';

import { useVirtualUserLogin } from '../../../api/auth';
import { showWarnAlert } from '../../../helper/sweetalert.helper';
import { useDeleteUser, useGetPaginatedCompanyUsers } from './hooks/userApis';
import ExportData from '../../../components/ExportData';
import ServerSideTable from '../../../@core/components/data-table/ServerSideTable';
import useUserColumns from './hooks/useUserColumns';
import { Plus } from 'react-feather';

const UsersList = ({ hideTitle = false, hideButton = false }) => {
  const tableRef = useRef(null);
  // ========================== Hooks =================================
  const history = useHistory();
  const user = useSelector(userData);

  // ========================== states ================================
  const [usersData, setUserData] = useState({ results: [], total: 0 });
  const [currentFilters, setCurretFilters] = useState({
    limit: 5,
    page: 1,
    search: '',
    sort: { column: '', order: null },
  });
  const [virtualLoginLoading, setVirtualLoginLoading] = useState(false);

  // ========================== Custom Hooks ==========================
  const { basicRoute } = useGetBasicRoute();
  const { virtualUserLogin } = useVirtualUserLogin();

  const { getCompanyUsers, isLoading } = useGetPaginatedCompanyUsers();
  const { deleteUser } = useDeleteUser();

  const getRecords = async (filter) => {
    setCurretFilters({
      limit: filter.limit,
      page: filter.page,
      search: filter.search,
      sort: filter.sort,
    });
    const companyId = user?.company._id;
    const { data, error } = await getCompanyUsers(companyId, {
      limit: filter.limit,
      page: filter.page,
      sort: filter.sort,
      search: filter.search,
      select: 'firstName,lastName,email,role,phone,active',
    });
    const userDetails = data?.results?.filter(
      (temp) => temp?.email !== user.email
    );

    if (!error)
      setUserData({ results: userDetails, total: data.pagination.total });
  };

  const handleConfirmDelete = async (id = null) => {
    const result = await showWarnAlert({
      title: 'Are you sure?',
      text: 'Are you sure you would like to delete this user?',
    });

    if (result.value) {
      const { error } = await deleteUser(id, 'Delete user..');

      if (!error) {
        removeRecordRefreshTable();
      }
    }
  };

  const handleVirtualLogin = async (id) => {
    setVirtualLoginLoading(id);
    const { data, error } = await virtualUserLogin(id);

    if (!error) {
      if (data?.token && data?.userData) {
        localStorage.setItem('isCompanyAdmin', true);
        localStorage.setItem('memberUserId', btoa(data?.userData?._id));
        localStorage.setItem('memberToken', data?.token);
        window.open(`${window.location.origin}/member`, '_blank');
      }
    }

    setVirtualLoginLoading(false);
  };

  const { columns } = useUserColumns({
    user,
    handleConfirmDelete,
    handleVirtualLogin,
    virtualLoginLoading,
  });

  const header = () => {
    return (
      <div className='card-header-with-buttons card-header'>
        <h4 className='title card-title'>{!hideTitle ? 'Users List' : ''}</h4>
        <div className='button-wrapper'>
          <div className='btn-group' style={{ marginRight: '10px' }}>
            {<ExportData model='user' query={currentFilters} />}
          </div>
          {!hideButton ? (
            <Button
              className='d-inline-flex'
              color='primary'
              onClick={handelAddNewItem}
            >
              <Plus size={15} />
              <span className='align-middle ms-50'>{'Add User'}</span>
            </Button>
          ) : null}
        </div>
      </div>
    );
  };

  const handelAddNewItem = () => {
    history.push(`${basicRoute}/users/add`);
  };

  const removeRecordRefreshTable = () => {
    if ((usersData.total - 1) % currentFilters.limit === 0) {
      tableRef.current.refreshTable({
        filterArgs: { ...currentFilters, page: currentFilters.page - 1 || 1 },
      });
      setCurretFilters({
        ...currentFilters,
        page: currentFilters.page - 1,
      });
    } else {
      setCurretFilters({
        ...currentFilters,
      });
      tableRef.current.refreshTable({
        filterArgs: { ...currentFilters },
      });
    }
  };

  return (
    <ServerSideTable
      ref={tableRef}
      blocking={isLoading}
      selectableRows={false}
      columns={columns}
      getRecord={getRecords}
      data={usersData}
      itemsPerPage={currentFilters.limit}
      header={header()}
      cardClass={'user-list-page'}
    />
  );
};

export default UsersList;
