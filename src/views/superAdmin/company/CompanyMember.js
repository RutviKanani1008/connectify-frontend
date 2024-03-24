import React, { useEffect, useState } from 'react';
import UILoader from '@components/ui-loader';
import { Input, UncontrolledTooltip } from 'reactstrap';
import Select from 'react-select';
import { selectThemeColors } from '@utils';
import ItemTable from '../../../@core/components/data-table';
import {
  getCompany,
  companyUser,
  updateCompanyMemberDetail,
} from '../../../api/company';
import { showToast, TOASTTYPES } from '@src/utility/toast-helper';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { Eye } from 'react-feather';
import { useHistory } from 'react-router-dom';
const MySwal = withReactContent(Swal);

const CompanyMemberList = () => {
  const [companyName, setCompanyName] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(false);
  const [companyMember, setCompanyMember] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const history = useHistory();
  const getRecords = (value) => {
    setFetching(true);
    companyUser({ company: value })
      .then((res) => {
        if (res && res.data && res.data.data && res.data.data.length > 0) {
          const companyUserData = res.data.data;
          setCompanyMember(companyUserData);
        }
        setFetching(false);
      })
      .catch(() => {
        setFetching(false);
      });
  };
  const getCompanyNames = async () => {
    const companyName = await getCompany({ select: 'name' });
    const company = [];
    companyName?.data?.data?.forEach((companyData) => {
      const obj = {};
      obj['value'] = companyData._id;
      obj['label'] = companyData.name;
      company.push(obj);
    });

    if (company && company.length > 0) {
      setSelectedCompany(company[0]);
      getRecords(company[0].value);
    }
    setCompanyName(company);
  };

  useEffect(() => {
    getCompanyNames();
  }, []);

  const handleCompanyChange = (e) => {
    setSelectedCompany(e);
    getRecords(e.value);
  };

  const handleChangeStatus = (status, data) => {
    return MySwal.fire({
      title: 'Are you sure?',
      text: 'Are you sure you would like to change status?',
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
        data.active = !data.active;
        updateCompanyMemberDetail(data._id, data).then((res) => {
          if (res.error) {
            showToast(TOASTTYPES.error, toastId, res.error);
          } else {
            history.push(`/company-member`);
            showToast(
              TOASTTYPES.success,
              toastId,
              'Company Member Updated Successfully'
            );
          }
        });
      } else if (result.dismiss === MySwal.DismissReason.cancel) {
        status.target.checked = !status.target.checked;
      }
    });
  };

  const columns = [
    {
      name: 'Title',
      minWidth: '250px',
      sortable: (row) => row?.relation,
      selector: (row) => row?.relation,
      cell: (row) => {
        return (
          <div>
            <span
              className='cursor-pointer'
              onClick={() =>
                history.push(
                  `/member/${row?._id}?company=${selectedCompany.value}&name=${selectedCompany.label}`
                )
              }
            >
              {row?.relation}
            </span>
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
            <span
              className='cursor-pointer'
              onClick={() =>
                history.push(
                  `/member/${row?._id}?company=${selectedCompany.value}&name=${selectedCompany.label}`
                )
              }
            >
              {`${row?.firstName} ${row?.firstName}`}
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
              onClick={() =>
                history.push(
                  `/member/${row?._id}?company=${selectedCompany.value}&name=${selectedCompany.label}`
                )
              }
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
              onClick={() =>
                history.push(
                  `/member/${row?._id}?company=${selectedCompany.value}&name=${selectedCompany.label}`
                )
              }
            >
              {row?.phone}
            </span>
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
            <span
              className='cursor-pointer'
              onClick={() =>
                history.push(
                  `/member/${row?._id}?company=${selectedCompany.value}&name=${selectedCompany.label}`
                )
              }
            >
              {row?.role}
            </span>
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
                  onChange={(e) => handleChangeStatus(e, row)}
                />
              </div>
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
            <div
              className='action-btn archive-btn'
              onClick={() => {
                history.push(
                  `/member/${row?._id}?company=${selectedCompany.value}&name=${selectedCompany.label}`
                );
              }}
              id={`view_${row?._id}`}
            >
              <Eye size={15} className='cursor-pointer me-1'></Eye>
            </div>
            <UncontrolledTooltip placement='top' target={`view_${row?._id}`}>
              View
            </UncontrolledTooltip>
          </div>
        );
      },
    },
  ];

  // eslint-disable-next-line no-unused-vars
  const addNewCategory = () => {
    setOpenCategoryModal(!openCategoryModal);
  };

  const childDropdown = (
    <div className='mr-2'>
      <Select
        id={'company_details'}
        theme={selectThemeColors}
        style={{ width: '30%' }}
        placeholder={'Select Company'}
        classNamePrefix='select'
        options={companyName}
        value={selectedCompany}
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
  );
  return (
    <div>
      <UILoader blocking={fetching}>
        <ItemTable
          columns={columns}
          data={companyMember}
          title={'Company Members'}
          addItemLink={
            selectedCompany
              ? `/member/add?company=${selectedCompany.value}&name=${selectedCompany.label}`
              : ''
          }
          buttonTitle={'Add Member'}
          itemsPerPage={10}
          childDropdown={childDropdown}
        />
      </UILoader>
    </div>
  );
};

export default CompanyMemberList;
