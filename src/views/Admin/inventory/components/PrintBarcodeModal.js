import React, { useState, useRef, useEffect } from 'react';
import Barcode from 'react-barcode';
import {
  Button,
  Col,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
  Input,
  Label,
} from 'reactstrap';

const PrintBarcodeModal = ({ setBarcodeModal, barcodeModal, product }) => {
  const barcode_ref = useRef(null);
  const [barcodeSelected, setBarcodeSelected] = useState();

  const printBarcode = () => {
    const elem = barcode_ref.current;
    const printWindow = window.open('', 'PrintMap', 'width=500,height=500');
   
    printWindow.document.write('<html><head><title>Form</title>');
    printWindow.document.write('<style>');
    printWindow.document.write(`
      @media print {
        @page {
          size: A3 Portrait; /* auto is default portrait; */
      }
    } 

  .list-barcode .product-barcode svg {
      width: 216px;
      height: 96px;
  }
    .product-barcode {
      font-size: 12px;    
      padding-top: 0.1in;  
      border: 1px dotted #ccc;
      text-transform: uppercase;  
      text-align: center; 
      padding: 24px 10px 0px;
      margin-bottom: 5px;
    } 

    `);
    printWindow.document.write('</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(elem.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
    // printWindow.close();
  };

  useEffect(() => {
    setBarcodeSelected(product.sku);
  }, [product]);

  return (
    <>
      <Modal
        isOpen={barcodeModal}
        toggle={() => {
          setBarcodeModal(false);
        }}
        className='modal-dialog-centered print-barcode-modal'
        backdrop='static'
      >
        <ModalHeader toggle={() => setBarcodeModal(false)}>
          Print Product
        </ModalHeader>
        <ModalBody>
          <div className='select-per-sheet'>
            <Row>
              <Col className='mb-1' md={6} xs={12}>
                <div className='inner-wrapper'>
                  <label className='form-label form-label'>Product Name</label>
                  <div className='value'>{product.title}</div>
                </div>
              </Col>
              <Col className='mb-1' md={6} xs={12}>
                <div className='inner-wrapper'>
                  <label className='form-label form-label'>Quantity</label>
                  <div className='value'>{product.quantity}</div>
                </div>
              </Col>
              <Col className='mb-1' md={12} xs={12}>
                <div className='inner-wrapper'>
                  <label className='form-label form-label'>
                    Select Barcode
                  </label>
                  <div className='radio-btn-wrapper d-flex flex-inline'>
                    <div className='form-check radio-btn-repeater me-2'>
                      <Input
                        type='radio'
                        name='barcode'
                        id='system-barcode'
                        value={product.sku}
                        onChange={() => {
                          setBarcodeSelected(product.sku);
                        }}
                        defaultChecked={product.sku === barcodeSelected}
                      />
                      <Label className='form-check-label' for='system-barcode'>
                        System Barcode
                      </Label>
                    </div>
                    <div className='form-check radio-btn-repeater me-2'>
                      <Input
                        type='radio'
                        name='barcode'
                        id='manufacture-barcode'
                        value={product.manufacturerBarcode || ''}
                        disabled={!product.manufacturerBarcode}
                        onChange={() => {
                          setBarcodeSelected(product.manufacturerBarcode);
                        }}
                      />
                      <Label
                        className='form-check-label'
                        for='manufacture-barcode'
                      >
                        Manufacture Barcode
                      </Label>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
            <div className='print-barcode-btn'>
              <Button color='primary' onClick={printBarcode}>
                Print Barcode
              </Button>
            </div>       
          </div>
          <div className='add-items'>
          <div className='list-barcode-table-wrapper' ref={barcode_ref}>
          <table className='list-barcode-table'>
          <tr>
            {product.quantity > 0 ? (
              <>
                {/* old-start */}
                {/* <div ref={barcode_ref}>
                  <div className='list-barcode'>
                      <div className={`product-barcode`}>
                        <div className='inner-wrapper'>
                            <div className='header'>
                              <span className='title'>{product.title}</span>
                            </div>
                            <Barcode
                              value={barcodeSelected}
                              format='CODE128'
                              width={1}
                              height={40}
                            />
                          </div>
                      </div>                  
                    </div>
                </div> */}
                {/* old-end */}
                {/* new-start */}
                  <td>
                    <h3 className='title'>{product.title}</h3>
                    <Barcode
                      value={barcodeSelected}
                      format='CODE128'
                    />
                  </td>
                {/* new-end */}
              </>
            ) : null}
            </tr>
            </table>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </>
  );
};

export default PrintBarcodeModal;
