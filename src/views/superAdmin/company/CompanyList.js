import { useCallback, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import classnames from 'classnames';

import { updateCompanyNote } from '../../../api/company';

import Swal from 'sweetalert2';
import { Plus } from 'react-feather';
import withReactContent from 'sweetalert2-react-content';
import { showToast, TOASTTYPES } from '@src/utility/toast-helper';
import { useVirtualAdminLogin } from '../../../api/auth';
import useCompanyColumns from './hooks/useCompanyColumns';
import { showWarnAlert } from '../../../helper/sweetalert.helper';
import {
  useArchiveCompanyAPI,
  useDeleteCompany,
  useGetAllCompaniesAPI,
} from './hooks/companyApis';
import ServerSideTable from '../../../@core/components/data-table/ServerSideTable';

import { Button, CardHeader, CardTitle } from 'reactstrap';
import ExportData from '../../../components/ExportData';

const MySwal = withReactContent(Swal);

const CompanyList = () => {
  // ** Refs **
  const tableRef = useRef(null);

  // ** states **
  const [company, setCompany] = useState([]);
  const [virtualLoginLoading, setVirtualLoginLoading] = useState(false);
  const [companiesData, setCompaniesData] = useState({ results: [], total: 0 });
  const [currentTab, setCurrentTab] = useState('active');

  // API service
  const { virtualAdminLogin } = useVirtualAdminLogin();
  const { getAllCompanies, isLoading } = useGetAllCompaniesAPI();
  const { archiveCompanyAPI } = useArchiveCompanyAPI();
  const { deleteCompany, isLoading: deleteLoading } = useDeleteCompany();

  // ** Custom Hooks **
  const { columns } = useCompanyColumns({
    handleUpdateStatus,
    handleVirtualLogin,
    virtualLoginLoading,
    handleConfirmArchiveDelete,
    deleteLoading,
  });

  const getCompanies = async (query = {}) => {
    const { data, error } = await getAllCompanies({
      params: {
        ...query,
        select: 'name,email,phone,status,archived',
      },
    });

    if (!error && Array.isArray(data?.results)) {
      const results = data?.results;
      const total = data?.total;
      setCompaniesData({ results, total });
    }
  };

  function handleUpdateStatus(status, data) {
    return MySwal.fire({
      title: 'Are you sure?',
      text: 'Are you sure you want to change status ?',
      icon: 'warning',
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonText: 'Yes',
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger ms-1',
      },
      buttonsStyling: false,
    }).then(function (result) {
      if (result.value) {
        const toastId = showToast(TOASTTYPES.loading, '', 'Status Updating...');
        updateCompanyNote(data._id, { status: status.target.checked }).then(
          (res) => {
            if (res.error) {
              showToast(TOASTTYPES.error, toastId, res.error);
            } else {
              const rawData = company;
              rawData.map((raw) => {
                if (raw._id === data._id) {
                  rawData.status = result.value;
                }
              });
              setCompany(rawData);
              showToast(
                TOASTTYPES.success,
                toastId,
                'Status Updated Successfully'
              );
            }
          }
        );
      } else if (result.dismiss === MySwal.DismissReason.cancel) {
        status.target.checked = !status.target.checked;
      }
    });
  }

  async function handleVirtualLogin(id) {
    setVirtualLoginLoading(id);
    const { data, error } = await virtualAdminLogin(id);

    if (!error) {
      if (data?.token && data?.userData) {
        localStorage.setItem('isSuperAdmin', true);
        localStorage.setItem('adminUserId', btoa(data?.userData?._id));
        localStorage.setItem('adminToken', data?.token);
        console.log('window.location.origin', window.location.origin);
        window.open(`${window.location.origin}/admin`, '_blank');
      }
    }
    setVirtualLoginLoading(false);
  }

  async function handleConfirmArchiveDelete(id = null, archived) {
    const isDeleting = archived === undefined;

    const result = await showWarnAlert({
      title: 'Are you sure?',
      text: `${
        isDeleting
          ? 'Are you sure you would like to delete this company?'
          : `Are you sure you would like to ${
              archived ? 'active' : 'archive'
            } this company?`
      } `,
    });

    if (result.value) {
      const { error } = isDeleting
        ? await deleteCompany(id, 'Delete company..')
        : await archiveCompanyAPI(id, { archived: !archived });

      if (!error) {
        getCompanies({ archived: currentTab === 'archive' });
      }
    }
  }

  const Header = useCallback(() => {
    const history = useHistory();
    return (
      <>
        <>
          <CardHeader className='d-flex align-items-center card-header-with-buttons'>
            <div className='d-flex align-items-center'>
              <CardTitle tag='h4' className='text-primary item-table-title'>
                <div className='d-flex'>Company List</div>
              </CardTitle>
            </div>
            <div className='header__btns d-flex'>
              <ExportData
                model={'company'}
                query={{ archived: currentTab === 'archive' }}
              />
              <>
                <Button
                  className='ms-1'
                  color='primary'
                  onClick={() => {
                    history.push(`/companies/add`);
                  }}
                >
                  <Plus size={15} />
                  <span className='align-middle ms-50'>Add Company</span>
                </Button>
              </>
            </div>
          </CardHeader>
        </>
      </>
    );
  }, [currentTab]);

  const Filters = () => {
    return (
      <>
        <div className='new-tab-details-design'>
          <div className='horizontal-new-tab-wrapper'>
            <div className='horizontal-tabbing hide-scrollbar nav nav-tabs'>
              <div className='nav-item'>
                <div
                  className={classnames('nav-link', {
                    active: currentTab === 'active',
                  })}
                  onClick={() => {
                    if (currentTab !== 'active') {
                      setCurrentTab('active');
                      tableRef?.current?.refreshTable({
                        filterArgs: { archived: false },
                        reset: true,
                      });
                    }
                  }}
                >
                  Active
                </div>
              </div>
              <div className='nav-item'>
                <div
                  className={classnames('nav-link', {
                    active: currentTab === 'archive',
                  })}
                  onClick={() => {
                    if (currentTab !== 'archive') {
                      setCurrentTab('archive');
                      tableRef?.current?.refreshTable({
                        filterArgs: { archived: true },
                        reset: true,
                      });
                    }
                  }}
                >
                  Archived
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* <ButtonGroup className={`horizontal-button-tab cml`}>
          <Button
            tag='label'
            className={classnames('btn-icon view-btn grid-view-btn', {
              active: currentTab === 'active',
            })}
            color='primary'
            outline
            onClick={() => {
              if (currentTab !== 'active') {
                setCurrentTab('active');
                tableRef?.current?.refreshTable({
                  filterArgs: { archived: false },
                  reset: true,
                });
              }
            }}
          >
            Active
          </Button>
          <Button
            tag='label'
            className={classnames('btn-icon view-btn list-view-btn', {
              active: currentTab === 'archive',
            })}
            color='primary'
            outline
            onClick={() => {
              if (currentTab !== 'archive') {
                setCurrentTab('archive');
                tableRef?.current?.refreshTable({
                  filterArgs: { archived: true },
                  reset: true,
                });
              }
            }}
          >
            Archived
          </Button>
        </ButtonGroup> */}
      </>
    );
  };

  return (
    <div className='compay__list__superAdmin'>
      <ServerSideTable
        initialTableFilters={{ archived: false }}
        header={Header()}
        ref={tableRef}
        blocking={isLoading}
        columns={columns}
        getRecord={getCompanies}
        data={companiesData}
        itemsPerPage={10}
        filters={Filters()}
        initialDataFetch={true}
      />
    </div>
  );
};

export default CompanyList;
