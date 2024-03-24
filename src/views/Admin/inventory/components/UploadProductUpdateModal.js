import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { useForm } from 'react-hook-form';
import {
  Button,
  Col,
  Form,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from 'reactstrap';
import { FormField } from '../../../../@core/components/form-fields';
import { SaveButton } from '../../../../@core/components/save-button';
import { required } from '../../../../configs/validationConstant';
import { useUpdateImportProduct } from '../hooks/InventoryProductApi';

const productScheme = yup.object().shape({
  title: yup.string().required(required('Title')),
  quantity: yup.number().nullable().required(required('Quantity')),
  sku: yup.string().required(required('Sku')),

});
const UploadProductUpdateModal = forwardRef(({ importedProducts, setImportedProducts }, ref) => {
  const [modalUpdateProductModal, setModalUpdateProductModal] = useState(false);
 const {
      control,
      handleSubmit,
      reset,
      formState: { errors },
    } = useForm({
      mode: 'onBlur',
      resolver: yupResolver(productScheme),
    });

    const { updateImportProduct, isLoading: updatingLoader } = useUpdateImportProduct();
      useImperativeHandle(ref, () => ({
      async handleEditProduct(updateContact) {
        const contact = JSON.parse(JSON.stringify(updateContact));
        reset(contact);
        setModalUpdateProductModal(true);
      },
    }));
  
  const onSubmit = async (data) => {
    const { _id: id } = data;
    delete data?.errors;
    delete data?._id;
    const { data: response, error } = await updateImportProduct(id, data);
    if (!error && response) {
      const tempProducts = [...importedProducts.results];
      const index = tempProducts.findIndex((x) => x._id === id);
      tempProducts[index] = {
        ...response.data,
        errors: response.productErrors,
        _id: response._id,
      };
      setImportedProducts({ ...importedProducts, results: tempProducts });
      setModalUpdateProductModal(false);
    }
  }
     return (
      <Modal
        isOpen={modalUpdateProductModal}
        toggle={() => {
          setModalUpdateProductModal(false);
        }}
        className='modal-dialog-centered add-contact-modal'
        backdrop='static'
        size='xl'
      >
        <ModalHeader
          toggle={() => {
            setModalUpdateProductModal(false);
          }}
        >
          Update Product
        </ModalHeader>
        <ModalBody>
          <Form
            className='auth-login-form'
            onSubmit={handleSubmit(onSubmit)}
            autoComplete='off'
          >
            <div className='form-boarder p-2'>
              <Row className='auth-inner m-0'>
                <Col className='px-0' md='12'>
                  <h4 className='fw-bold text-primary mb-1'>Product Info</h4>
                  <Row className='mt-3'>
                    <Col md={4}>
                      <FormField
                        name='title'
                        label='Product Title'
                        placeholder='Product title'
                        type='text'
                        errors={errors}
                        control={control}
                      />
                    </Col>
                    <Col md={4}>
                      <FormField
                        name='category'
                        label='Category'
                        placeholder='Category'
                        type='text'
                        errors={errors}
                        control={control}
                      />
                    </Col>
                    <Col md={4}>
                      <FormField
                        type='number'
                        label='Price'
                        name='price'
                        placeholder='Price'
                        errors={errors}
                        control={control}
                      />
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row className='auth-inner m-0 mt-3'>
                <Col className='px-0' md='12'>
                  <Row>
                    <Col md={4}>
                      <FormField
                        type='number'
                        label='Sale Price'
                        name='salePrice'
                        placeholder='Sale Price'
                        errors={errors}
                        control={control}
                      />
                    </Col>
                    <Col md={4}>
                      <FormField
                        label='Quantity'
                        placeholder='Quantity'
                        type='number'
                        errors={errors}
                        control={control}
                        name='quantity'
                      />
                    </Col>
                    <Col md={4}>
                      <FormField
                        label='SKU'
                        placeholder='SKU'
                        type='text'
                        errors={errors}
                        control={control}
                        name='sku'
                        // {...register(`address2`)}
                      />
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row className='auth-inner m-0 mt-3'>
                <Col className='px-0' md='12'>
                  <Row>
                    <Col md={4}>
                      <FormField
                        type='number'
                        label='Width'
                        name='width'
                        placeholder='Width'
                        errors={errors}
                        control={control}
                        // {...register(`city`)}
                      />
                    </Col>
                    <Col md={4}>
                      <FormField
                        type='number'
                        label='Height'
                        name='height'
                        placeholder='Height'
                        errors={errors}
                        control={control}
                        // {...register(`state`)}
                      />
                    </Col>
                    <Col md={4}>
                      <FormField
                        label='Length'
                        placeholder='Length'
                        type='number'
                        errors={errors}
                        control={control}
                        name='length'
                        // {...register(`country`)}
                      />
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row className='auth-inner m-0 mt-3'>
                <Col className='px-0' md='12'>
                  <Row>
                    <Col md={4}>
                      <FormField
                        type='number'
                        label='Weight'
                        placeholder='Weight'
                        errors={errors}
                        control={control}
                        name='weight'
                        // {...register(`zip`)}
                      />
                    </Col>
                  </Row>
                </Col>
              </Row>
            </div>
           
          </Form>
        </ModalBody>

        <ModalFooter>
          <Form
            className='auth-login-form'
            onSubmit={handleSubmit(onSubmit)}
            autoComplete='off'
          >
            <SaveButton
              loading={updatingLoader}
              disabled={updatingLoader}
              width='180px'
              type='submit'
              name={'Update Product'}
              className='align-items-center justify-content-center'
            ></SaveButton>
          </Form>
          <Button
            color='danger'
            onClick={() => {
              setModalUpdateProductModal(false);
            }}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    );
})
UploadProductUpdateModal.displayName = 'UploadProductUpdateModal';

export default UploadProductUpdateModal