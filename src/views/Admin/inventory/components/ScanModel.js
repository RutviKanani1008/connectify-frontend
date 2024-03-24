import { useState } from "react";
import { Camera, Radio } from "react-feather";
import { Modal, ModalBody, ModalHeader } from "reactstrap";
import ScanBarcode from "./ScanBarcode";
import ScannergunModel from "./ScannergunModel";

const ScanModel = ({ setScanModal, scanModal }) => {
  const [scanBarcode, setScanBarcode] = useState({ toggle: false });
  const [scanguncode, setScanGuncode] = useState({ toggle: false });

  const handleScanProduct = () => {
    setScanBarcode({ toggle: true });
  };

  const handleScanGunProduct = () => {
    setScanGuncode({ toggle: true });
  };

  return (
    <>
       <Modal
        isOpen={scanModal.toggle}
        toggle={() => {
          setScanModal({ toggle: false });
        }}
        className='modal-dialog-centered add-inventory-product-modal'
        backdrop='static'
      >
        <ModalHeader toggle={() => setScanModal({ toggle: false })}>
         Scan Product
        </ModalHeader>
        <ModalBody>
          <div className='add-items-row'>
            <div onClick={handleScanProduct} className='add-item-box'>
              <div className='inner-wrapper'>
                <span className='icon-wrapper'>
                  <Camera />
                </span>
                <span className='name'>Scan Product Using Camera</span>
              </div>
            </div>
            <div onClick={handleScanGunProduct} className='add-item-box'>
              <div className='inner-wrapper'>
                <span className='icon-wrapper'>
                  <Radio/>
                </span>
                <span className='name'>Scan Product Using ScannerGun</span>
              </div>
            </div>
          </div>
        </ModalBody>
      </Modal>
      {scanBarcode.toggle ? (
      <ScanBarcode setScanModal={setScanBarcode} scanModal={scanBarcode} />
      ) : null}
      {scanguncode.toggle ? (
      <ScannergunModel setScanGunModal={setScanGuncode} scanGunModal={scanguncode} />
      ) : null}
    </>
  )
}

export default ScanModel