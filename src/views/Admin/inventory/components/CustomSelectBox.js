import React, { useEffect, useState } from 'react';
import Select, { components } from 'react-select';
import { showWarnAlert } from '../../../../helper/sweetalert.helper';
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
import { SaveButton } from '@components/save-button';
import { Edit2, Plus, Trash } from 'react-feather';
import { userData } from '../../../../redux/user';
import { useSelector } from 'react-redux';
import {
  useCreateSpec,
  useDeleteSpec,
  useUpdateProductSpec,
} from '../hooks/InventoryProductSpecApi';
import { FormField } from './../../../../@core/components/form-fields/index';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { required } from './../../../../configs/validationConstant';

const optionSchema = yup.object().shape({
  name: yup.string().required(required('Option Name')),
});

const CustomSelectBox = ({
  optionList,
  type,
  name,
  onHandleChange,
  addCreateOption,
}) => {
  const user = useSelector(userData);
  const { createProductSpec } = useCreateSpec();
  const { updateProductSpec } = useUpdateProductSpec();
  const { deleteSpec } = useDeleteSpec();
  const {
    control,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    resolver: yupResolver(optionSchema),
  });

  const [options, setOptions] = useState(optionList);
  const [optionValue, setOptionValue] = useState(null);
  const [updateModal, setUpdateModal] = useState(false);
  const [updateValue, setUpdateValue] = useState({});

  useEffect(() => {
    setOptions(optionList);
    setOptionValue(optionList.filter((item) => item.defaultValue)[0]);
  }, [optionList]);

  const styles = {
    option: (css) => ({
      ...css,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      minHeight: '2.5rem',
      span: { cursor: 'pointer' },
      button: { cursor: 'pointer' },
    }),
  };

  const optionEdit = (option) => {
    setUpdateModal(true);
    setUpdateValue(option);
    setValue('name', option.value);
  };

  const optionAdd = () => {
    setUpdateModal(true);
  };

  const onChangeOption = (value) => {
    onHandleChange(name, value);
    setOptionValue(value);
  };
  const optionDelete = async (option) => {
    const result = await showWarnAlert({
      title: 'Are you sure?',
      text: 'Are you sure you would like to delete this Option?',
    });

    if (result.value) {
      const { error } = await deleteSpec(option.id, 'Delete Option..');
      if (!error) {
        const filterOption = [...options].filter(
          (item) => item.id !== option.id
        );
        setOptions(filterOption);
      }
    }
  };

  const onOptionSubmit = async (data) => {
    const updatedData = {
      type,
      name: data.name,
      company: user.company._id,
    };
    if (updateValue.id) {
      const { error } = await updateProductSpec(
        updateValue.id,
        updatedData,
        'Update Option...'
      );
      if (error === 'Option already exists.') {
        setError(
          `name`,
          { type: 'focus', message: `Option name is already exist.` },
          { shouldFocus: true }
        );
        return;
      }
      if (!error) {
        const currentOptionIndex = options.findIndex(
          (option) => option.id === updateValue.id
        );
        const updatedOption = {
          ...options[currentOptionIndex],
          value: data.name,
          label: data.name,
        };
        const newOptions = [...options];
        newOptions[currentOptionIndex] = updatedOption;
        setOptions(newOptions);
        setUpdateModal(false);
        setUpdateValue({});
        setValue('name', '');
      }
    } else {
      const { error, data } = await createProductSpec(
        updatedData,
        'Save Option...'
      );
      if (!error) {
        const newOption = {
          id: data._id,
          label: data.name,
          value: data.name,
        };
        setOptions((prev) => [...prev, newOption]);
        setOptionValue(newOption);
        setUpdateModal(false);
        setUpdateValue({});
        setValue('name', '');
      } else {
        setError(
          `name`,
          { type: 'focus', message: `Option name is already exist.` },
          { shouldFocus: true }
        );
      }
    }
  };

  const Option = ({ children, innerProps, ...props }) => {
    const { selectOption, selectProps, data } = props;
    const { optionEdit, optionDelete } = selectProps;

    const clickWithoutSelect = (e, callback) => {
      callback(data);
      e.stopPropagation();
    };

    const onMouseDown = {
      label: () => selectOption(data),
      add: (e) => clickWithoutSelect(e, optionAdd),
      edit: (e) => clickWithoutSelect(e, optionEdit),
      delete: (e) => clickWithoutSelect(e, optionDelete),
    };

    // const { onClick, ...newInnerProps } = innerProps;
    const { ...newInnerProps } = innerProps;
    return (
      <components.Option {...props} innerProps={newInnerProps}>
        {props.data.create ? (
          <span className='m-auto primary' onClick={onMouseDown.add}>
            <Plus /> Add Unit
          </span>
        ) : (
          <>
            <span onClick={onMouseDown.label}>{children}</span>
            {!!props.isFocused && !children.includes('Create') && (
              <div>
                <Edit2
                  color='green'
                  size={15}
                  className='cursor-pointer'
                  onClick={onMouseDown.edit}
                />
                <Trash
                  color='red'
                  size={15}
                  className='cursor-pointer'
                  onClick={onMouseDown.delete}
                />
              </div>
            )}
          </>
        )}
      </components.Option>
    );
  };

  return (
    <>
      <Select
        classNamePrefix='custom-select'
        styles={styles}
        isClearable
        onChange={(newValue) => onChangeOption(newValue)}
        options={addCreateOption ? [...options, { create: true }] : options}
        value={optionValue}
        components={{ Option }}
        optionEdit={optionEdit}
        optionDelete={optionDelete}
        name={name}
      />
      {updateModal && (
        <Modal
          isOpen={updateModal}
          toggle={() => {
            setUpdateModal(false);
          }}
          className='modal-dialog-centered preview-dialog add-product-category-modal'
          backdrop='static'
        >
          <ModalHeader toggle={() => setUpdateModal(false)}>
            {updateValue.id ? 'Update option' : 'Add Option'}
          </ModalHeader>

          <ModalBody>
            <>
              <Form
                className='auth-login-form'
                onSubmit={(event) => {
                  event.stopPropagation();
                  handleSubmit(onOptionSubmit)(event);
                }}
                autoComplete='off'
              >
                <Row className='mt-1'>
                  <Col md='12' sm='12' lg='12'>
                    <FormField
                      type='text'
                      placeholder='Enter Option'
                      className='form-control'
                      control={control}
                      errors={errors}
                      name='name'
                    />
                  </Col>
                </Row>
              </Form>
            </>
          </ModalBody>
          <ModalFooter>
            <Button color='danger' onClick={() => setUpdateModal(false)}>
              Cancel
            </Button>
            <Form
              onSubmit={(event) => {
                event.stopPropagation();
                handleSubmit(onOptionSubmit)(event);
              }}
              autoComplete='off'
            >
              <SaveButton
                width='171px'
                type='submit'
                name={updateValue.id ? 'Update' : 'Add'}
              ></SaveButton>
            </Form>
          </ModalFooter>
        </Modal>
      )}
    </>
  );
};

export default CustomSelectBox;
