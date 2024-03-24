import React from 'react';
import ReadBarcode from './ReadBarcode';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';
import { useGetProductByBarcode } from '../hooks/InventoryProductApi';
import { useHistory } from 'react-router-dom';
import useGetBasicRoute from '../../../../hooks/useGetBasicRoute';

const ScanBarcode = ({ setScanModal, scanModal }) => {
  const { getProduct } = useGetProductByBarcode();
  const { basicRoute } = useGetBasicRoute();
  const history = useHistory();

  const onNewScanResult = (decodedText) => {
    if (decodedText) {
      getProductDetails(decodedText);
    }
  };
  const getProductDetails = async (id) => {
    const { data, error } = await getProduct(id);
    if (!error) {
      const productData = data;
      history.push(`${basicRoute}/product-details/${productData?._id}`);
      setScanModal({ toggle: false });
    }
  };
  return (
    <Modal
      isOpen={scanModal.toggle}
      toggle={() => {
        setScanModal({ toggle: false });
      }}
      className='modal-dialog-centered inventory-scan-product-modal'
      backdrop='static'
    >
      <ModalHeader toggle={() => setScanModal({ toggle: false })}>
        Scan Product
      </ModalHeader>
      <ModalBody>
        <div className='barcod-wrapper'>
          {/* <div className='icon-wrapper'>
            <div className='inner-wrapper'>
              <img src='/images/barcode-scanner.svg' alt='' />
            </div>
          </div> */}
          <ReadBarcode
            fps={10}
            qrbox={{ width: 400, height: 150 }}
            disableFlip={false}
            qrCodeSuccessCallback={onNewScanResult}
          />
        </div>
      </ModalBody>
    </Modal>
  );
};

export default ScanBarcode;
