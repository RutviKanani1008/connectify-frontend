import { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'react-feather';
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
} from 'reactstrap';
import Wizard from '@components/wizard';
import { showWarnAlert } from '../../../../helper/sweetalert.helper';
import ProgressBar from '../../../../components/ProgressBar';
import UploadProductExcel from './UploadProductExcel';
import ViewUploadedProducts from './ViewUploadedProducts';
import { useForm } from 'react-hook-form';
import { useDeleteImportProductDetails, useFinalUploadProducts } from '../hooks/InventoryProductApi';
import { TOASTTYPES, showToast } from '../../../../utility/toast-helper';
import ImportProductSuccess from './ImportProductSuccess';

const ImportProduct = ({
  openUploadProduct,
  closeUploadModal,
  refetchProducts
}) => {
   const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    mode: 'onTouched',
  });

  const [fileUploading, setFileUploading] = useState(false);
  const [stepper, setStepper] = useState(null);
  const [stepperIndex, setStepperIndex] = useState(null);
  const ref = useRef(null);
  const [finalImportLoader, setFinalImportLoader] = useState(false);
  const [showFileError, setShowFileError] = useState(false);
  const [showFile, setFile] = useState(false);
  const [paginatedImportedProducts, setPaginatedImportedProducts] = useState({
    results: [],
    total: 0,
    totalProductsWithError: 0,
  });
  const [socketSessionId, setSocketSessionId] = useState(undefined);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [importId, setImportId] = useState(0);
  const { finalUploadProducts } = useFinalUploadProducts();
  const { deleteImportProductDetails } = useDeleteImportProductDetails();

  const steps = [
    {
      id: 'upload-file',
      title: 'Upload',
      subtitle: 'Upload Excel File',
      content: (
        <>
          {!fileUploading ? (
            <UploadProductExcel
              stepper={stepper}
              setFileUploading={setFileUploading}
              setFile={setFile}
              showFileError={showFileError}
              setShowFileError={setShowFileError}
              socketSessionId={socketSessionId}
              setUploadProgress={setUploadProgress}
              setImportId={setImportId}
            />
          ) : (
            <>
              <div className='import-loader-wrapper'>
                <div className='img-wrapper'>
                  <iframe
                    className='loading-img'
                    src='https://lottie.host/?file=eae44841-f1b9-43f2-8823-79d151be4c51/sl9f5AT0N8.json'
                  ></iframe>
                </div>
              </div>
            </>
          )}
          <div className='import-loader-progress'>
            <ProgressBar
              progress={uploadProgress}
              setProgress={setUploadProgress}
              setSocketSessionId={setSocketSessionId}
            />
          </div>
        </>
      ),
    },
    {
      id: 'view-details',
      title: 'View Product',
      subtitle: 'view products',
      content: 
       <ViewUploadedProducts
          stepper={stepper}
          paginatedImportedProducts={paginatedImportedProducts}
          setPaginatedImportedProducts={setPaginatedImportedProducts}
          setValue={setValue}
          watch={watch}
          control={control}
          errors={errors}
          key={importId}
          importId={importId}
        />,
    },
   {
      id: 'Done',
      title: 'Import Done',
      subtitle: 'Products Imports Done',
      content: <ImportProductSuccess stepper={stepper} />,
    },
  ];

  const closeImportModal = async () => {
    if (importId && stepper._currentIndex !== 2) {
      const result = await showWarnAlert({
        text: 'Are you sure you want to cancel the import process? Your progress will be lost.',
        confirmButtonText: 'Yes',
      });
      if (result.isConfirmed) {
        deleteImportProductDetails(importId)
        closeUploadModal();
      }
    } else {
      closeUploadModal();
    }
  };

  const handlePrevious = async () => {
    const result = await showWarnAlert({
      text: 'Are you sure you want to go back? Your progress will be lost.',
      confirmButtonText: 'Yes',
    });

    if (result.isConfirmed) {
      if (importId) {
        deleteImportProductDetails(importId);
        setImportId(0);
      }
      setFile(false);
      setShowFileError(false);   
      stepper.previous(); 
    }
  };

  
  const resetProducts = () => {
    setPaginatedImportedProducts({
      results: [],
      total: 0,
      totalContactsWithError: 0,
      contactsWithInvalidEmail: 0,
      contactsAlreadyExists: 0,
      contactsWithoutEmail: 0,
      contactsWithDuplicateEmail: 0,
    });
  };

  const handleSubmitFinalProducts = async () => {
    if (!importId) {
      return;
    }
    const result = await showWarnAlert({
      text: `${
        Number(paginatedImportedProducts.totalContactsWithError) > 0
          ? `Are you sure you want to submit and ignore ${paginatedImportedProducts.totalContactsWithError} products with issues ?`
          : 'Are you sure you want to submit ?'
      }`,
      confirmButtonText: 'Yes',
    });

    if (result.value) {
      setFinalImportLoader(true);
      try {
        const { error } = await finalUploadProducts(importId);
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

  return (
  
    <>
      <Modal
        isOpen={openUploadProduct}
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
          Import Products
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
          {stepperIndex === 1 ? (
            <Button
              className='previous-btn'
              color='primary'
              disabled={fileUploading || finalImportLoader}
              onClick={() => {
                handlePrevious();
              }}
            >
              <ArrowLeft
                size={14}
                className='align-middle me-sm-25 me-0'
              ></ArrowLeft>
              <span className='align-middle d-sm-inline-block d-none'>
                Previous
              </span>
            </Button>
          ) : null}
          <Button
            className='next-btn'
            color='primary'
            disabled={fileUploading}
            onClick={() => {
              if (stepperIndex === 0 && showFile) {
                stepper.next();
              } else if (stepperIndex === 1) {
                handleSubmitFinalProducts()
              } else if (stepperIndex === 2) {
                resetProducts();
                setShowFileError(false);
                refetchProducts(); // check
                closeUploadModal();
              } else {
                if (stepperIndex === 0) {
                  setShowFileError(true);
                }
              }
            }}
          >
            <span className='align-middle d-sm-inline-block d-none'>
              {stepperIndex === 2 ? 'Done' : 'Next'}
              {fileUploading && <Spinner className='ms-50' size='sm' />}
            </span>
            {!fileUploading && stepperIndex !== 2 && (
              <ArrowRight
                size={14}
                className='align-middle ms-sm-25 me-0'
              ></ArrowRight>
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  )
}
export default ImportProduct