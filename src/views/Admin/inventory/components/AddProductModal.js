import React, { useState } from 'react';
import { Camera, Plus, Radio } from 'react-feather';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';
import { useHistory } from 'react-router-dom';
import useGetBasicRoute from '../../../../hooks/useGetBasicRoute';
import ReadBarcode from './ReadBarcode';
import { useGetProductByBarcode } from '../hooks/InventoryProductApi';
import ScannergunModel from './ScannergunModel';

const AddProductModal = ({ setAddModal, addModal }) => {
  const history = useHistory();
  const { basicRoute } = useGetBasicRoute();
  const [scanBarcode, setScanBarcode] = useState({ toggle: false });
  const [scanguncode, setScanGuncode] = useState({ toggle: false });
  const { getProduct } = useGetProductByBarcode();

  const handleScanProduct = () => {
    setScanBarcode({ toggle: true });
  };
  const handleAddProduct = () => {
    history.push(`${basicRoute}/product/add`);
    setAddModal({ toggle: false });
  };
  const handleScanGunProduct = () => {
    setScanGuncode({ toggle: true });
  };

  const onNewScanResult = (decodedText) => {
    if (decodedText) {
      getProductDetails(decodedText);
    }
  };
  const getProductDetails = async (id) => {
    const { data, error } = await getProduct(id);
    if (!error) {
      const productData = data;
      setScanBarcode({ toggle: false });
      setAddModal({ toggle: false });
      history.push(`${basicRoute}/product/${productData?._id}`);
    } else {
      setScanBarcode({ toggle: false });
      setAddModal({ toggle: false });
      history.push(`${basicRoute}/product/add?manufacturerBarcode=${id}`);
    }
  };
  return (
    <>
      <Modal
        isOpen={addModal.toggle}
        toggle={() => {
          setAddModal({ toggle: false });
        }}
        className='modal-dialog-centered add-inventory-product-modal'
        backdrop='static'
      >
        <ModalHeader toggle={() => setAddModal({ toggle: false })}>
          Add Product
        </ModalHeader>
        <ModalBody>
          <div className='add-items-row'>
            <div onClick={handleScanProduct} className='add-item-box'>
              <div className='inner-wrapper'>
                <span className='icon-wrapper'>
                  <Camera />
                </span>
                <span className='name'>Scan using camera</span>
              </div>
            </div>
            <div onClick={handleScanGunProduct} className='add-item-box'>
              <div className='inner-wrapper'>
                <span className='icon-wrapper'>
                  <Radio />
                </span>
                <span className='name'>Scan using scanner gun</span>
              </div>
            </div>
            <div onClick={handleAddProduct} className='add-item-box'>
              <div className='inner-wrapper'>
                <span className='icon-wrapper'>
                  <Plus />
                </span>
                <span className='name'>Manually add</span>
              </div>
            </div>
          </div>
        </ModalBody>
      </Modal>
      {scanBarcode.toggle ? (
        <Modal
          isOpen={scanBarcode.toggle}
          toggle={() => {
            setScanBarcode({ toggle: false });
          }}
          className='modal-dialog-centered inventory-scan-product-modal'
          backdrop='static'
        >
          <ModalHeader toggle={() => setScanBarcode({ toggle: false })}>
            Scan Product
          </ModalHeader>
          <ModalBody>
            <div className='barcod-wrapper'>
              <ReadBarcode
                fps={10}
                qrbox={{ width: 400, height: 150 }}
                disableFlip={false}
                qrCodeSuccessCallback={onNewScanResult}
              />
            </div>
          </ModalBody>
        </Modal>
      ) : null}
      {scanguncode.toggle ? (
        <ScannergunModel
          addModel={true}
          setScanGunModal={setScanGuncode}
          scanGunModal={scanguncode}
        />
      ) : null}
    </>
  );
};

export default AddProductModal;
