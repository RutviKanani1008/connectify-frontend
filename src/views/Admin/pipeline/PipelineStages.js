/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import UILoader from '@components/ui-loader';
import { useSelector } from 'react-redux';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  UncontrolledTooltip,
  UncontrolledButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';
import { userData } from '../../../redux/user';
import { useHistory, useParams } from 'react-router-dom';
import { getPipeline, updateMemberContactStage } from '../../../api/pipeline';
import { ArrowLeft, Plus, Share, FileText } from 'react-feather';
import { SaveButton } from '@components/save-button';
import { showWarnAlert } from '../../../helper/sweetalert.helper';
import { getContactDetails } from '../../../api/contacts';
import PipelineStagesTable from './components/PipelineStagesTable';
import ContactListModal from '../../../@core/components/kanban-view/component/ContactList';

const Pipeline = () => {
  const params = useParams();
  const history = useHistory();

  const [, setAvailableStages] = useState([]);
  const [currentPipeline, setCurrentPipeline] = useState(false);

  const [fetching, setFetching] = useState(false);
  const user = useSelector(userData);
  const [openTagModal, setOpenTagModal] = useState(false);
  const [currentPipelineText, setCurrentPipelineText] = useState({ text: '' });
  const [isUpdatePipeline, setIsUpdatePipeline] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [submitStageLoading, setSubmitStageLoading] = useState(false);
  const [isContactModalVisible, setIsContactModalVisible] = useState(false);
  const [currentStage, setCurrentStage] = useState(null);

  const [pipelineContacts, setPipelineContacts] = useState([]);

  useEffect(() => {
    if (params.id) loadPipelineContacts();
  }, [params.id]);

  const loadPipelineContacts = async () => {
    try {
      const pipelineId = params.id;

      const res = await getContactDetails({
        'pipelineDetails.pipeline.id': pipelineId,
      });

      if (res.data.data && Array.isArray(res.data.data)) {
        setPipelineContacts(res.data.data);
      } else {
        setPipelineContacts([]);
      }
    } catch (error) {
      console.log(error);
      setPipelineContacts([]);
    }
  };

  const stageContainContacts = (stageId) => {
    return pipelineContacts.some((contact) =>
      contact.pipelineDetails.some(
        (pipelineDetail) =>
          pipelineDetail.status && pipelineDetail.status.id === stageId
      )
    );
  };

  const getRecords = (stagesDetails = null) => {
    setFetching(true);

    getPipeline({
      company: user.company._id,
      _id: params.id,
    })
      .then((res) => {
        setFetching(false);
        const pipelines = res.data.data;

        if (pipelines && pipelines.length > 0) {
          setCurrentPipeline({
            ...pipelines[0],
            id: pipelines[0]._id,
            tite: pipelines[0].pipelineName,
          });
          if (stagesDetails) {
            const contactCurrentStage = stagesDetails;
            const contactStages = pipelines[0].stages;
            const newStages = [];
            contactStages.forEach((stage) => {
              const obj = {};
              obj.code = stage?.code;
              obj.title = stage?.title;
              obj.order = stage?.order;
              let flag = 0;
              contactCurrentStage.forEach((contact) => {
                if (
                  contact &&
                  contact.pipelineDetails &&
                  contact.pipelineDetails.length > 0
                ) {
                  const isExist = contact.pipelineDetails.find(
                    (company) =>
                      company?.pipeline?.id === params.id &&
                      company?.status?.code === stage?.code
                  );
                  if (isExist && !flag) {
                    flag = 1;
                  }
                  if (isExist) {
                    // obj.isExist = true;
                  } else {
                    // obj.isExist = false;
                  }
                }
              });
              if (flag) {
                obj.isExist = true;
              } else {
                obj.isExist = false;
              }
              newStages.push(obj);
            });
            pipelines[0].stages = newStages;
            setCurrentPipeline({
              ...pipelines[0],
              id: pipelines[0]._id,
              title: pipelines[0].pipelineName,
            });
            setAvailableStages(res.data.data);
          } else {
            setAvailableStages(res.data.data);
          }
        }
      })
      .catch(() => {
        setFetching(false);
      });
  };

  useEffect(() => {
    if (user && user.company && user.company._id && params.id) {
      getRecords();
    }
  }, [params]);

  const handleEditStage = (stage) => {
    if (currentPipeline && currentPipeline.stages.length > 0) {
      let stageDetail;
      currentPipeline.stages.forEach((stg) => {
        if (stg._id === stage._id) {
          stageDetail = stg;
        }
      });
      if (stageDetail && stageDetail.title) {
        setIsUpdatePipeline(stageDetail);
        setCurrentPipelineText({ text: stageDetail.title });
        setOpenTagModal(!openTagModal);
      }
    }
  };

  const handleConfirmDelete = async (stageObj) => {
    const result = await showWarnAlert({
      title: 'Are you sure?',
      text: 'Are you sure you would like to delete this stage?',
      confirmButtonText: 'Yes',
      inputAttributes: {
        autocapitalize: 'off',
      },
      showCancelButton: true,
      loaderHtml: '<div class="spinner-border text-primary"></div>',
      showLoaderOnConfirm: true,
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger ms-1',
        loader: 'custom-loader',
      },
      preConfirm: () => {
        let stages = currentPipeline.stages;
        const deleteStage = stages.find((stage) => stage._id === stageObj._id);
        stages.forEach((stage) => {
          if (stage.order > deleteStage.order) {
            stage.order = stage.order - 1;
          }
        });
        stages = stages.filter((stage) => stage._id !== deleteStage._id);
        return updateMemberContactStage(currentPipeline._id, {
          stage: stages,
        }).then((res) => {
          if (res.error) {
            // showToast(TOASTTYPES.error, toastId, res.error);
          } else {
            getRecords();
          }
        });
      },
    });

    if (result.isConfirmed) {
      //
    }
  };

  const addNewStage = () => {
    setOpenTagModal(!openTagModal);
  };

  const getStageContacts = (stageId) => {
    const stageContacts = [];
    pipelineContacts.forEach((contact) => {
      if (contact.pipelineDetails && contact.pipelineDetails.length > 0) {
        contact.pipelineDetails.forEach((companyDetail) => {
          if (
            companyDetail.status.id === stageId &&
            companyDetail.pipeline.id === String(currentPipeline._id)
          ) {
            stageContacts.push(contact);
          }
        });
      }
    });
    return stageContacts;
  };

  const createStage = () => {
    if (isUpdatePipeline && currentPipeline) {
      const stageDetail = currentPipeline.stages;
      const isExist = currentPipeline.stages.find(
        (stage) =>
          stage.code ===
            currentPipelineText.text.replace(/ /g, '-').toLowerCase() &&
          stage.code !== isUpdatePipeline.code
      );
      if (
        !isExist &&
        currentPipelineText.text.replace(/ /g, '-').toLowerCase() !==
          isUpdatePipeline.code
      ) {
        setSubmitStageLoading(true);
        // const toastId = showToast(TOASTTYPES.loading);
        stageDetail.forEach((stagePipeline) => {
          if (stagePipeline._id === isUpdatePipeline._id) {
            stagePipeline.title = currentPipelineText.text;
            stagePipeline.code = currentPipelineText.text
              .replace(/ /g, '-')
              .toLowerCase();
          }
        });

        updateMemberContactStage(currentPipeline._id, {
          stage: stageDetail,
        }).then((res) => {
          setSubmitStageLoading(false);
          if (res.error) {
            // showToast(TOASTTYPES.error, toastId, res.error);
          } else {
            // showToast(
            //   TOASTTYPES.success,
            //   toastId,
            //   'Stage Updated Successfully'
            // );
            getRecords();
          }
          setOpenTagModal(!openTagModal);
          setCurrentPipelineText({ text: '' });
          setIsUpdatePipeline(false);
        });
      } else if (isExist) {
        setShowError(true);
        setErrorMessage('Stage name must be unique');
      } else {
        setOpenTagModal(!openTagModal);
        setCurrentPipelineText({ text: '' });
        setIsUpdatePipeline(false);
      }
    } else {
      const isExist = currentPipeline.stages.find(
        (stage) =>
          stage.code ===
          currentPipelineText.text.replace(/ /g, '-').toLowerCase()
      );
      if (!isExist) {
        setSubmitStageLoading(true);

        // const toastId = showToast(TOASTTYPES.loading);

        const currentStages = JSON.parse(
          JSON.stringify(currentPipeline.stages)
        );
        const obj = {};
        obj.title = currentPipelineText.text;
        obj.code = currentPipelineText.text.replace(/ /g, '-').toLowerCase();
        obj.order = currentStages.length;
        currentStages.push(obj);
        updateMemberContactStage(currentPipeline._id, {
          stage: currentStages,
        }).then((res) => {
          setSubmitStageLoading(false);
          if (res.error) {
            // showToast(TOASTTYPES.error, toastId, res.error);
          } else {
            // showToast(TOASTTYPES.success, toastId, 'Stage Added Successfully');
            getRecords();
          }
          setOpenTagModal(!openTagModal);
          setCurrentPipelineText({ text: '' });
          setIsUpdatePipeline(false);
        });
      } else {
        setShowError(true);
        setErrorMessage('Stage name must be unique');
      }
    }
  };

  // ** Converts table to CSV
  function convertArrayOfObjectsToCSV(array) {
    let result;
    const columnDelimiter = ',';
    const lineDelimiter = '\n';
    const keys = Object.keys(array[0]).filter(
      (item) =>
        item !== '__v' && item !== '_id' && item !== 'order' /* updated */
    );
    result = '';
    result += keys.join(columnDelimiter);
    result += lineDelimiter;
    array.forEach((item) => {
      let ctr = 0;
      keys.forEach((key) => {
        if (key !== '__v' && key !== '_id') {
          if (ctr > 0) result += columnDelimiter;
          result += item[key];
          ctr++;
        }
      });
      result += lineDelimiter;
    });
    return result;
  }

  // ** Downloads CSV
  function downloadCSV(array) {
    const link = document.createElement('a');
    let csv = convertArrayOfObjectsToCSV(array);
    if (csv === null) return;
    const filename = 'export.csv';
    if (!csv.match(/^data:text\/csv/i)) {
      csv = `data:text/csv;charset=utf-8,${csv}`;
    }
    link.setAttribute('href', encodeURI(csv));
    link.setAttribute('download', filename);
    link.click();
  }

  const handleViewContacts = (stage) => {
    setCurrentStage(stage);
    setIsContactModalVisible(true);
  };

  return (
    <>
      <div className='view-pipline-single-page'>
        <UILoader blocking={fetching}>
          <Card>
            <CardHeader className='card-header-with-buttons'>
              <CardTitle tag='h4' className='card-title'>
                <div
                  id={'goback'}
                  onClick={() => history.goBack()}
                  className='back-arrow'
                ></div>
                <UncontrolledTooltip placement='top' target={`goback`}>
                  Go Back
                </UncontrolledTooltip>
                <span className='text'>Pipeline Stages</span>
              </CardTitle>
              <div className='button-wrapper'>
                <UncontrolledButtonDropdown>
                  <DropdownToggle color='secondary' caret outline>
                    <Share size={15} />
                    <span className='align-middle ms-50'>Export</span>
                  </DropdownToggle>
                  <DropdownMenu>
                    <DropdownItem
                      className='w-100'
                      onClick={() => downloadCSV(currentPipeline.stages)}
                    >
                      <FileText size={15} />
                      <span className='align-middle ms-50'>Export to CSV</span>
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledButtonDropdown>
                <Button className='' color='primary' onClick={addNewStage}>
                  <Plus size={15} />
                  <span className='align-middle ms-50'>Add Stages</span>
                </Button>
              </div>
            </CardHeader>

            <CardBody>
              <div className='rdt_Table_wrapper'>
                {currentPipeline && (
                  <PipelineStagesTable
                    currentPipeline={currentPipeline}
                    pipelineStages={currentPipeline.stages || []}
                    stageContainContacts={stageContainContacts}
                    handleEditStage={handleEditStage}
                    handleConfirmDelete={handleConfirmDelete}
                    setCurrentPipelineStages={(stages) =>
                      setCurrentPipeline({
                        ...currentPipeline,
                        stages,
                      })
                    }
                    handleViewContacts={handleViewContacts}
                  />
                )}
              </div>
            </CardBody>
          </Card>

          <Modal
            isOpen={openTagModal}
            toggle={() => setOpenTagModal(!openTagModal)}
            className='modal-dialog-centered'
            backdrop='static'
          >
            <ModalHeader
              toggle={() => {
                setCurrentPipelineText({ text: '' });
                setOpenTagModal(!openTagModal);
                setIsUpdatePipeline(false);
                setShowError(false);
              }}
            >
              {isUpdatePipeline ? 'Update Stage' : 'Add Stage'}
            </ModalHeader>
            <ModalBody>
              <div className='mb-1 mt-1'>
                <Input
                  label='Stage Name'
                  name='stage'
                  placeholder='Stage Name'
                  type='text'
                  value={currentPipelineText.text}
                  onChange={(e) => {
                    if (showError) {
                      setShowError(false);
                    }
                    setCurrentPipelineText({
                      text: e.target.value,
                    });
                  }}
                />
                {showError ? (
                  <>
                    <div className='mt-1 text-danger'>
                      {errorMessage ? errorMessage : 'Please Enter stage Name.'}
                    </div>
                  </>
                ) : null}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                color='danger'
                onClick={() => {
                  setCurrentPipelineText({ text: '' });
                  setOpenTagModal(!openTagModal);
                  setIsUpdatePipeline(false);
                  setShowError(false);
                }}
              >
                Cancel
              </Button>
              <SaveButton
                color='primary'
                loading={submitStageLoading}
                width={isUpdatePipeline ? '35%' : '30%'}
                name={isUpdatePipeline ? 'Update Stage' : 'Add Stage'}
                onClick={() => {
                  if (currentPipelineText.text === '') {
                    setShowError(true);
                  } else {
                    createStage();
                  }
                }}
              />
            </ModalFooter>
          </Modal>
        </UILoader>
      </div>
      {isContactModalVisible && currentStage && (
        <>
          <ContactListModal
            currentStage={currentStage}
            currentPipeline={currentPipeline}
            isModalOpen={isContactModalVisible}
            setIsModalOpen={() => {
              setIsContactModalVisible(false);
            }}
            contacts={getStageContacts(currentStage?._id)}
          />
        </>
      )}
    </>
  );
};

export default Pipeline;
