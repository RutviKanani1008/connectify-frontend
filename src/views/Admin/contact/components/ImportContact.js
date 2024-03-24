import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'react-feather';
import { useForm } from 'react-hook-form';
import Wizard from '@components/wizard';

import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
} from 'reactstrap';

import { showToast, TOASTTYPES } from '../../../../utility/toast-helper';
import { showWarnAlert } from '../../../../helper/sweetalert.helper';
import {
  useDeleteImportContactDetails,
  useFinalUploadContacts,
} from '../service/contact.services';
import { validateImportContacts } from '../../../../api/contacts';

import UploadExcelSheetWithColumn from './UploadExcelSheetWithColumn';
import ViewUploadContact from './ViewUploadContact';
import ImportSuccess from './ImportSuccess';

import MapImportContactFields from './MapImportContactFields';
import ProgressBar from '../../../../components/ProgressBar';

const ImportContact = ({
  openUploadContact,
  closeUploadModal,
  refetchContacts,
}) => {
  const ref = useRef(null);
  const [stepper, setStepper] = useState(null);
  const [stepperIndex, setStepperIndex] = useState(null);

  const [showFile, setFile] = useState(false);
  const [showFileError, setShowFileError] = useState(false);
  const [showMappingError, setShowMappingError] = useState(false);

  const [columnNames, setColumnNames] = useState([]);
  const [mappedColumns, setMappedColumns] = useState({});
  const [customFields, setCustomFields] = useState([]);

  const [importId, setImportId] = useState(0);
  const [socketSessionId, setSocketSessionId] = useState(undefined);
  const [uploadProgress, setUploadProgress] = useState(null);

  const [fileUploading, setFileUploading] = useState(false);
  const [finalImportLoader, setFinalImportLoader] = useState(false);

  const [paginatedImportedContacts, setPaginatedImportedContacts] = useState({
    results: [],
    total: 0,
    totalContactsWithError: 0,
    contactsWithInvalidEmail: 0,
    contactsAlreadyExists: 0,
    contactsWithoutName: 0,
    contactsWithDuplicateEmail: 0,
  });

  const { finalUploadContacts } = useFinalUploadContacts();
  const { deleteImportContactDetails } = useDeleteImportContactDetails();
  const {
    control,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm({
    mode: 'onTouched',
  });

  useEffect(() => {
    const hasMappedFields = Object.keys(mappedColumns).length;
    const hasCustomFields = customFields.some((c) => c.value);

    if (hasMappedFields || hasCustomFields) {
      setShowMappingError(false);
    }
  }, [mappedColumns, customFields]);

  const uploadExcelFile = async () => {
    if (!showFile) return;
    const mappedCustomColumns = customFields.reduce((p, c) => {
      p[c.label] = c.value;
      return p;
    }, {});

    const formData = new FormData();
    formData.append('public', showFile);
    formData.append('mappedColumns', JSON.stringify(mappedColumns));
    formData.append('mappedCustomColumns', JSON.stringify(mappedCustomColumns));

    setFileUploading(true);

    validateImportContacts(formData, socketSessionId)
      .then((res) => {
        setTimeout(() => {
          setUploadProgress(null);
        }, 1500);
        if (res?.data?.data) {
          setImportId(res?.data?.data?._id);
          stepper.next();
        }
        setFileUploading(false);
      })
      .catch(() => {
        setTimeout(() => {
          setUploadProgress(null);
        }, 1500);
        setFileUploading(false);
      });
  };

  const steps = [
    {
      id: 'upload-file',
      title: 'Upload',
      subtitle: 'Upload Excel File',
      content: (
        <UploadExcelSheetWithColumn
          stepper={stepper}
          showFileError={showFileError}
          setFile={setFile}
          setColumnNames={setColumnNames}
        />
      ),
    },
    {
      id: 'map-contact-fields',
      title: 'Map Fields',
      subtitle: 'Map Contacts Fields',
      content: (
        <div className='importContactMap-section'>
          <MapImportContactFields
            stepper={stepper}
            columnNames={columnNames}
            mappedColumns={mappedColumns}
            setMappedColumns={setMappedColumns}
            customFields={customFields}
            setCustomFields={setCustomFields}
          />

          {showMappingError && (
            <div className='import-loader-progress'>
              <p style={{ color: 'red' }}>
                Map at least one field to continue...
              </p>
            </div>
          )}

          <ProgressBar
            progress={uploadProgress}
            setProgress={setUploadProgress}
            setSocketSessionId={setSocketSessionId}
          />
        </div>
      ),
    },
    {
      id: 'view-details',
      title: 'View Contact',
      subtitle: 'view contacts',
      content: (
        <ViewUploadContact
          stepper={stepper}
          customFields={customFields}
          paginatedImportedContacts={paginatedImportedContacts}
          setPaginatedImportedContacts={setPaginatedImportedContacts}
          setValue={setValue}
          watch={watch}
          control={control}
          errors={errors}
          key={importId}
          importId={importId}
        />
      ),
    },
    {
      id: 'Done',
      title: 'Import Done',
      subtitle: 'Contact Imports Done',
      content: <ImportSuccess stepper={stepper} />,
    },
  ];

  const handlePrevious = async () => {
    const result = await showWarnAlert({
      text: 'Are you sure you want to go back? Your progress will be lost.',
      confirmButtonText: 'Yes',
    });

    if (result.isConfirmed) {
      if (stepperIndex === 2) {
        if (importId) {
          deleteImportContactDetails(importId);
          setImportId(0);
        }
        resetContacts();
        reset({});
      } else if (stepperIndex === 1) {
        setFile(false);
        setShowFileError(false);
        setMappedColumns({});
        setCustomFields([]);
      }
      stepper.previous();
    }
  };

  const handleNext = () => {
    switch (stepperIndex) {
      case 0:
        if (!showFile) return setShowFileError(true);
        stepper.next();
        /* */
        break;

      case 1: {
        const hasMappedFields = Object.keys(mappedColumns).length;
        const hasCustomFields = customFields.some((c) => c.value);

        if (!hasMappedFields && !hasCustomFields) {
          return setShowMappingError(true);
        }

        uploadExcelFile();
        /* */
        break;
      }

      case 2:
        handleSubmitFinalContacts();
        /* */
        break;

      case 3:
        resetContacts();
        setShowFileError(false);
        refetchContacts();
        closeUploadModal();
        /* */
        break;

      default:
        break;
    }
  };

  const resetContacts = () => {
    setPaginatedImportedContacts({
      results: [],
      total: 0,
      totalContactsWithError: 0,
      contactsWithInvalidEmail: 0,
      contactsAlreadyExists: 0,
      contactsWithoutName: 0,
      contactsWithDuplicateEmail: 0,
    });
  };

  const handleSubmitFinalContacts = async () => {
    if (!importId) {
      return;
    }
    const result = await showWarnAlert({
      text: `${
        Number(paginatedImportedContacts.totalContactsWithError) > 0
          ? `Are you sure you want to submit and ignore ${paginatedImportedContacts.totalContactsWithError} contacts with issues ?`
          : 'Are you sure you want to submit ?'
      }`,
      confirmButtonText: 'Yes',
    });

    if (result.value) {
      setFinalImportLoader(true);
      try {
        const actionFields = {};
        const tempValues = JSON.parse(JSON.stringify(getValues()));
        if (tempValues?.group?.id) {
          actionFields.group = tempValues?.group?.id;
        }
        if (tempValues?.status?.id) {
          actionFields.status = tempValues?.status?.id;
        }
        if (tempValues?.category?.id) {
          actionFields.category = tempValues?.category?.id;
        }
        if (tempValues?.tags?.length) {
          actionFields.tags = tempValues?.tags?.map((tag) => tag.id);
        }
        if (tempValues?.pipelineDetails?.length) {
          actionFields.pipelineDetails = tempValues?.pipelineDetails?.map(
            (pipeline) => {
              if (pipeline?.pipeline?.id) {
                pipeline.pipeline = pipeline?.pipeline?.id;
              }
              if (pipeline?.status?.id) {
                pipeline.status = pipeline?.status?.id;
              }
              return pipeline;
            }
          );
        }

        const { error } = await finalUploadContacts(importId, {
          actionFields,
        });
        if (!error) {
          setFinalImportLoader(false);
          stepper.next();
        } else {
          setFinalImportLoader(false);
          showToast(TOASTTYPES.error, '', 'Something went wrong!');
        }
      } catch (error) {
        setFinalImportLoader(false);
      }
    }
  };

  const closeImportModal = async () => {
    if (importId && stepper._currentIndex !== 3) {
      const result = await showWarnAlert({
        text: 'Are you sure you want to cancel the import process? Your progress will be lost.',
        confirmButtonText: 'Yes',
      });
      if (result.isConfirmed) {
        deleteImportContactDetails(importId);
        closeUploadModal();
      }
    } else {
      closeUploadModal();
    }
  };

  return (
    <>
      <Modal
        isOpen={openUploadContact}
        toggle={() => {
          closeImportModal();
        }}
        backdrop='static'
        size='xl'
        className={`modal-dialog-centered import-contact-modal`}
      >
        <ModalHeader
          toggle={() => {
            closeImportModal();
          }}
        >
          Import Contact
        </ModalHeader>
        <ModalBody>
          <Wizard
            className='step-wrapper'
            instance={(el) => {
              setStepper(el);
            }}
            ref={ref}
            steps={steps}
            setCurrentActiveIndex={setStepperIndex}
          />
        </ModalBody>
        <ModalFooter>
          {stepperIndex === 1 || stepperIndex === 2 ? (
            <Button
              className='previous-btn'
              color='primary'
              disabled={fileUploading || finalImportLoader}
              onClick={() => handlePrevious()}
            >
              <ArrowLeft size={14} className='align-middle me-sm-25 me-0' />
              <span className='align-middle d-sm-inline-block d-none'>
                Previous
              </span>
            </Button>
          ) : null}

          <Button
            className='next-btn'
            color='primary'
            disabled={fileUploading}
            onClick={handleNext}
          >
            <span className='align-middle d-sm-inline-block d-none'>
              {stepperIndex === 3 ? 'Done' : 'Next'}
              {fileUploading && <Spinner className='ms-50' size='sm' />}
            </span>
            {!fileUploading && stepperIndex !== 3 && (
              <ArrowRight size={14} className='align-middle ms-sm-25 me-0' />
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default ImportContact;
