import React, {useRef, useState } from 'react';
import Barcode from 'react-barcode';
import { Button } from 'reactstrap';

const GenerateBarcode = ({setBarcodeValue}) => {
  const [barcode, setBarcode] = useState('');
  const barcode_ref = useRef();

  const generateBarcode = () => {
    const uniqueBarcode = Math.floor(new Date().valueOf() * Math.random()).toString();
    setBarcode(uniqueBarcode);
    setBarcodeValue(uniqueBarcode);
  }

  return (
  <>   
    {barcode ? (
      <>
        <div ref={barcode_ref} className="barcode-details">
          <h3 className='title'>System Barcode</h3>
          <Barcode value={barcode} format="CODE128" width="3" />
        </div>
      </>
    ) : <Button className='d-inline-flex align-item-center me-1' color='primary'onClick={generateBarcode}>Generate Barcode</Button>}
  </>
)
}

export default GenerateBarcode