import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  UncontrolledTooltip,
} from 'reactstrap';
import AddProductDetailForm from '../components/AddProductDetailForm';

const AddProduct = () => {
  const params = useParams();
  const history = useHistory();

  return (
    <div>
      {/* <Card className='inventory_product__card__wrapper'> */}
      <Card className='inventory-product-add-uodate-card'>
        <CardHeader>
          <CardTitle className='d-flex align-items-center'>
            <div
              className='back-arrow'
              onClick={() => history.goBack()}
              id={'goback'}
            >
              <UncontrolledTooltip placement='top' target={`goback`}>
                Go Back
              </UncontrolledTooltip>
            </div>
            <h4 className={`title card-title`}>
              {params.id !== 'add' ? 'Update Product' : 'Add New Product'}
            </h4>
          </CardTitle>
        </CardHeader>
        <CardBody>
          <AddProductDetailForm />
        </CardBody>
      </Card>
    </div>
  );
};

export default AddProduct;
