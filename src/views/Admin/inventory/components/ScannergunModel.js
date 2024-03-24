import { Col, Modal, ModalBody, ModalHeader, Row, Spinner } from 'reactstrap';
import { useGetProductByBarcode } from '../hooks/InventoryProductApi';
import { useHistory } from 'react-router-dom';
import { RefreshCw } from 'react-feather';
import useGetBasicRoute from '../../../../hooks/useGetBasicRoute';
import _ from 'lodash';
import { useState } from 'react';

const ScannergunModel = ({ setScanGunModal, scanGunModal, addModel}) => {
  const { getProduct } = useGetProductByBarcode();
  const { basicRoute } = useGetBasicRoute();
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  const getProductDetails = _.debounce(async (e) => {
    setSearch(e.target.value);
    setLoading(true);
    const { data, error } = await getProduct(e.target.value);
    if (!error) {
      const productData = data; 
      addModel ? history.push(`${basicRoute}/product/${productData?._id}`) :
      history.push(`${basicRoute}/product-details/${productData?._id}`);     
      setScanGunModal({ toggle: false });
      setLoading(false);
    } else {
      addModel ?  history.push(`${basicRoute}/product/add?manufacturerBarcode=${e.target.value}`) : ''
      setLoading(false);
    }
  }, 500);

  return (
    <Modal
      autoFocus={false}
      isOpen={scanGunModal.toggle}
      toggle={() => {
        setScanGunModal({ toggle: false });
      }}
      className='modal-dialog-centered inventory-scan-product-modal'
      backdrop='static'
    >
      <ModalHeader toggle={() => setScanGunModal({ toggle: false })}>
        Scan Product
      </ModalHeader>
      <ModalBody>
        <div className='barcode-wrapper'>
          <div className='instruction-list'>
            <ol>
              <li>Connect Scanner gun to Laptop/Computer</li>
              <li>Scan Barcode using Scanner gun</li>
              <li>Below You can see the Barcode value</li>
              <li>If scan is successful, this page will automatically update </li>
            </ol>
          </div>
          <Row>
            <Col md={8} xs={12}>
              <input
                key={search}
                defaultValue={search}
                className='form-control'
                autoFocus={true}
                placeholder='Barcode'
                type='text'
                onChange={(e) => {
                  getProductDetails(e);
                }}
              />
            </Col>
            <Col md={4} xs={12}>
              {loading ? <Spinner /> : <RefreshCw onClick={() => { setSearch('') }} />}
            </Col>
          </Row>
        </div>
      </ModalBody>
    </Modal>
  );
};
export default ScannergunModel;