import React, { useEffect, useState } from 'react';
import {
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Button,
  UncontrolledTooltip,
} from 'reactstrap';
import UILoader from '@components/ui-loader';
import ItemTable from '../../../@core/components/data-table';
import { userData } from '../../../redux/user';
import { useSelector } from 'react-redux';
import { showToast, TOASTTYPES } from '@src/utility/toast-helper';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useHistory, useParams } from 'react-router-dom';
import { Edit2, Eye, Trash } from 'react-feather';
import { getGroups } from '../../../api/groups';
import { SaveButton } from '@components/save-button';

import {
  createPipeline,
  deletePipeline,
  getPipeline,
  updatePipeline,
} from '../../../api/pipeline';
import CustomSelect from '../../../@core/components/form-fields/CustomSelect';
import useGetBasicRoute from '../../../hooks/useGetBasicRoute';
import { showWarnAlert } from '../../../helper/sweetalert.helper';
import useGroupPersist from '../groups/hooks/useGroupPersist';
import ExportData from '../../../components/ExportData';

const MySwal = withReactContent(Swal);
const Pipeline = () => {
  const { basicRoute } = useGetBasicRoute();
  const [initialGroup, setInitialGroup] = useGroupPersist();

  const [groupName, setGroupName] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(initialGroup);
  const [pipeline, setPipeline] = useState([]);
  const [fetching, setFetching] = useState(false);
  const user = useSelector(userData);
  const history = useHistory();
  const [openPipelineModal, setOpenPipelineModal] = useState(false);
  const [currentPipeline, setCurrentPipeline] = useState({ text: '' });
  const [isUpdatePIpeline, setIsUpdatePipeline] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);

  const params = useParams();
  const getRecords = (id) => {
    setFetching(true);
    getPipeline({ company: user.company._id, groupId: id })
      .then((pipelineRes) => {
        const pipelineObj = pipelineRes?.data?.data;
        setFetching(false);
        setPipeline(pipelineObj);
      })
      .catch(() => {
        setFetching(false);
      });
  };
  const getGroupNames = async () => {
    setFetching(true);
    getGroups({
      company: user.company._id,
      active: true,
    })
      .then((res) => {
        setFetching(false);
        const groups = [];
        res?.data?.data?.forEach((group) => {
          const obj = {};
          obj['value'] = group._id;
          obj['label'] = group.groupName;
          groups.push(obj);
        });
        if (groups && groups.length > 0) {
          if (selectedGroup) {
            getRecords(selectedGroup.value);
          } else {
            setInitialGroup(groups[0]);
            setSelectedGroup(groups[0]);
            const groupObj = groups[0]?.value || null;
            groupObj && getRecords(groupObj);
          }
        } else {
          getRecords(selectedGroup.value.label);
        }
        setGroupName(groups);
      })
      .catch(() => {
        setFetching(false);
      });
  };

  useEffect(() => {
    getGroupNames();
  }, [params]);

  const handleConfirmDelete = async (id) => {
    const result = await showWarnAlert({
      title: 'Are you sure?',
      text: 'Are you sure you would like to delete this Pipeline?',
      confirmButtonText: 'Yes',
      inputAttributes: {
        autocapitalize: 'off',
      },
      loaderHtml: '<div class="spinner-border text-primary"></div>',
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger ms-1',
        loader: 'custom-loader',
      },
      preConfirm: () => {
        return deletePipeline(id).then((res) => {
          if (res?.status === 200) {
            getRecords(selectedGroup.value);
          }
        });
      },
    });
    if (result.isConfirmed) {
      //
    }
  };

  const handleEditPipeline = (id) => {
    const selectTag = pipeline.find((pipe) => pipe._id === id);
    if (selectTag && selectTag.pipelineName) {
      setIsUpdatePipeline(selectTag);
      setCurrentPipeline({ text: selectTag.pipelineName });
      setOpenPipelineModal(!openPipelineModal);
    }
  };

  const handleChangeStatus = async (status, row) => {
    const result = await showWarnAlert({
      title: 'Are you sure?',
      text: `Are you sure you would like to change status to ${
        status.target.checked ? 'active' : 'inactive'
      }?`,
      confirmButtonText: 'Yes',
      inputAttributes: {
        autocapitalize: 'off',
      },
      loaderHtml: '<div class="spinner-border text-primary"></div>',
      showLoaderOnConfirm: true,
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger ms-1',
        loader: 'custom-loader',
      },
      preConfirm: () => {
        const obj = {};
        obj.company = row.company;
        obj.active = !row.active;
        obj.pipelineName = row.pipelineName;
        obj.groupId = row.groupId;
        obj.type = 'status';

        return updatePipeline(row._id, obj).then((res) => {
          if (res?.data?.data) {
            getRecords(selectedGroup.value);
          }
        });
      },
    });

    if (result.isConfirmed) {
      //
    } else if (result.dismiss === MySwal.DismissReason.cancel) {
      status.target.checked = !status.target.checked;
    }
  };

  const columns = [
    {
      name: 'Name',
      minWidth: '250px',
      sortable: (row) => row?.pipelineName,
      selector: (row) => row?.pipelineName,
    },
    {
      name: 'Status',
      allowOverflow: true,
      cell: (row) => {
        return (
          <>
            <div className='switch-checkbox' id={`status_${row?._id}`}>
              <Input
                type='switch'
                label='Status'
                name='status'
                disabled={row?.isExist}
                defaultChecked={row?.active}
                onChange={(e) => handleChangeStatus(e, row)}
              />
              <span className='switch-design'></span>
            </div>

            <UncontrolledTooltip placement='top' target={`status_${row?._id}`}>
              {row?.isExist
                ? 'This pipeline contain one or more contacts. so you cannot change status of this pipeline.'
                : row?.active
                ? 'Deactivate'
                : 'Activate'}
            </UncontrolledTooltip>
          </>
        );
      },
    },
    {
      name: 'Actions',
      allowOverflow: true,
      cell: (row) => {
        return (
          <div className='action-btn-wrapper'>
            <div className='action-btn edit-btn'>
              <Edit2
                // color={'#64c664'}
                size={15}
                className={'cursor-pointer'}
                onClick={() => {
                  handleEditPipeline(row?._id);
                }}
                id={`edit_${row?._id}`}
              />
              <UncontrolledTooltip placement='top' target={`edit_${row?._id}`}>
                Edit
              </UncontrolledTooltip>
            </div>
            <div className='action-btn delete-btn'>
              <Eye
                // color={'#a3db59'}
                size={15}
                className='cursor-pointer'
                onClick={() => {
                  history.push(`${basicRoute}/pipeline/${row._id}`);
                }}
                id={`view_${row?._id}`}
              ></Eye>
              <UncontrolledTooltip placement='top' target={`view_${row?._id}`}>
                View Stage
              </UncontrolledTooltip>
            </div>
            <div className='action-btn delete-btn'>
              <Trash
                color={!row?.isExist ? 'red' : 'grey'}
                size={15}
                className={
                  !row?.isExist ? 'cursor-pointer' : 'cursor-not-allowed'
                }
                onClick={() => {
                  if (!row?.isExist) {
                    handleConfirmDelete(row?._id);
                  }
                }}
                id={`delete_${row?._id}`}
              />
              <UncontrolledTooltip
                placement='top'
                target={`delete_${row?._id}`}
              >
                {!row?.isExist
                  ? 'delete'
                  : 'This pipeline contain one or more contacts. so you cannot delete this pipeline.'}
              </UncontrolledTooltip>
            </div>
          </div>
        );
      },
    },
  ];

  const addNewTag = () => {
    setOpenPipelineModal(!openPipelineModal);
  };

  const createOrUpdatePipeline = () => {
    setButtonLoading(true);

    if (isUpdatePIpeline) {
      const obj = {};
      obj.pipelineName = currentPipeline?.text;
      obj.active = isUpdatePIpeline?.active;
      obj.company = isUpdatePIpeline?.company;
      obj.groupId = isUpdatePIpeline?.groupId;
      obj.type = 'updateName';

      obj.type = isUpdatePIpeline.type;
      updatePipeline(isUpdatePIpeline._id, obj).then((res) => {
        if (res.error) {
          setShowError(true);
          setErrorMessage(res.error);

          showToast(TOASTTYPES.error, '', res.error);
        } else {
          setShowError(false);
          setErrorMessage(false);
          showToast(TOASTTYPES.success, '', 'Pipeline Updated Successfully');
          getRecords(selectedGroup.value);
          setOpenPipelineModal(!openPipelineModal);
          setCurrentPipeline({ text: '' });
          setIsUpdatePipeline(false);
        }
        setButtonLoading(false);
      });
    } else {
      const obj = {};

      obj.pipelineName = currentPipeline.text;
      obj.active = true;
      obj.company = user.company._id;
      obj.groupId = selectedGroup.value;
      createPipeline(obj).then((res) => {
        if (res.error) {
          setShowError(true);
          setErrorMessage(res.error);
          showToast(TOASTTYPES.error, '', res.error);
        } else {
          setShowError(false);
          setErrorMessage(false);
          showToast(TOASTTYPES.success, '', 'Pipeline Added Successfully');
          getRecords(selectedGroup.value);
          setOpenPipelineModal(!openPipelineModal);
          setCurrentPipeline({ text: '' });
          setIsUpdatePipeline(false);
        }
        setButtonLoading(false);
      });
    }
  };

  const handleGroupChange = (e) => {
    setSelectedGroup(e);
    setInitialGroup(e);
    getRecords(e.value);
  };

  const childDropdown = (
    <div className='select-group'>
      <CustomSelect
        classNamePrefix='custom-select'
        value={selectedGroup}
        options={groupName}
        onChange={(e) => {
          handleGroupChange(e);
        }}
        label='Select Group'
      />
    </div>
  );

  return (
    <div className='pipeline-list-view-wrapper'>
      <UILoader blocking={fetching}>
        <ItemTable
          ExportData={<ExportData model='pipeline' />}
          columns={columns}
          data={pipeline}
          title={'Pipeline'}
          childDropdown={childDropdown}
          addItemLink={false}
          onClickAdd={addNewTag}
          buttonTitle={'Add Pipeline'}
          itemsPerPage={10}
        />
      </UILoader>
      <Modal
        isOpen={openPipelineModal}
        toggle={() => setOpenPipelineModal(!openPipelineModal)}
        className='modal-dialog-centered add-update-pipline-modal'
        backdrop='static'
      >
        <ModalHeader
          toggle={() => {
            setCurrentPipeline({ text: '' });
            setOpenPipelineModal(!openPipelineModal);
            setIsUpdatePipeline(false);
            setShowError(false);
          }}
        >
          {isUpdatePIpeline ? 'Update Pipeline' : 'Add Pipeline'}
        </ModalHeader>
        <ModalBody>
          <div className='normal-text'>
            {isUpdatePIpeline ? 'Updating' : 'Adding'} pipeline{' '}
            {isUpdatePIpeline ? 'of' : 'into'}
            <span className='text-primary'>{` ${selectedGroup?.label}`} </span>
          </div>
          <div className='mb-1'>
            <Input
              label='Stage Name'
              name='stage'
              placeholder='Pipeline Name'
              type='text'
              value={currentPipeline.text}
              onChange={(e) => {
                if (showError) {
                  setShowError(false);
                }
                setCurrentPipeline({
                  text: e.target.value,
                });
              }}
            />
            {showError ? (
              <>
                <div className='mt-1 text-danger'>
                  {errorMessage ? errorMessage : 'Please Enter Pipeline Name.'}
                </div>
              </>
            ) : null}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color='danger'
            onClick={() => {
              setCurrentPipeline({ text: '' });
              setOpenPipelineModal(!openPipelineModal);
              setIsUpdatePipeline(false);
              setShowError(false);
            }}
          >
            Cancel
          </Button>
          <SaveButton
            name={isUpdatePIpeline ? 'Update Pipeline' : 'Add Pipeline'}
            loading={buttonLoading}
            color='primary'
            onClick={() => {
              if (currentPipeline.text === '') {
                setShowError(true);
              } else {
                createOrUpdatePipeline();
              }
            }}
            width={isUpdatePIpeline ? '35%' : '30%'}
          ></SaveButton>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default Pipeline;
