import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { useForm } from 'react-hook-form';
import { isArray } from 'lodash';
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
import { required } from '../../../../configs/validationConstant';
import { useSelector } from 'react-redux';
import { userData } from '../../../../redux/user';
import { getGroupDetails, getGroups } from '../../../../api/groups';
import { FormField } from '../../../../@core/components/form-fields';
import { SaveButton } from '../../../../@core/components/save-button';
import { useUpdateImportContact } from '../service/contact.services';

const contactScheme = yup.object().shape({
  firstName: yup.string().required(required('First Name')),
  email: yup.string().email().nullable(),
});

const UploadContactModal = forwardRef(
  ({ importedContacts, setImportedContacts }, ref) => {
    const [modalUpdateContactModal, setModalUpdateContactModal] =
      useState(false);
    const [dropdownList, SetDropdownList] = useState({
      group: [],
      status: [],
      category: [],
      tags: [],
      pipeline: [],
      stage: [],
    });
    const [pipelineData, setPipelineData] = useState([]);
    const {
      control,
      handleSubmit,
      reset,
      getValues,
      setValue,
      formState: { errors },
    } = useForm({
      mode: 'onBlur',
      resolver: yupResolver(contactScheme),
    });
    const user = useSelector(userData);

    const { updateImportContact, isLoading: updatingLoader } =
      useUpdateImportContact();

    useImperativeHandle(ref, () => ({
      async handleEditContact(updateContact) {
        const contact = JSON.parse(JSON.stringify(updateContact));

        // Get Group details
        const groups = await getGroups({ company: user.company._id });

        const groupDetails = groups.data.data;
        const groupObj = [];
        let flag = 0;
        groupDetails.forEach((groupDetail) => {
          // check current group is exis or not
          if (
            groupDetail.groupCode ===
            contact?.group?.replace(/ /g, '-').toLowerCase()
          ) {
            flag = {
              id: groupDetail._id,
              value: groupDetail.groupCode,
              label: groupDetail.groupName,
            };
          }
          if (groupDetail.active) {
            const obj = {};
            obj['label'] = groupDetail.groupName;
            obj['value'] = groupDetail.groupCode;
            obj['id'] = groupDetail._id;
            groupObj.push(obj);
          }
        });
        if (flag === 0 && contact?.group) {
          flag = {
            label: contact.group,
            value: contact.group.replace(/ /g, '-').toLowerCase(),
            id: 'new',
          };
          groupObj.push(flag);
        }

        if (contact.group && flag !== 0) contact.group = flag;

        const statusObj = [];
        if (contact?.status) {
          const obj = {
            id: 'new',
            value: contact.status.replace(/ /g, '-').toLowerCase(),
            label: contact.status,
          };
          contact.status = obj;
          statusObj.push(obj);
        }

        const categoryObj = [];
        if (contact?.category) {
          const obj = {
            id: 'new',
            value: contact.category.replace(/ /g, '-').toLowerCase(),
            label: contact.category,
          };
          contact.category = obj;
          categoryObj.push(obj);
        }
        const tagsObj = [];
        if (contact?.tags) {
          contact.tags = contact?.tags?.map((tag) => {
            const obj = {
              id: 'new',
              value: tag.replace(/ /g, '-').toLowerCase(),
              label: tag,
            };
            tagsObj.push(obj);
            tag = obj;
          });
          contact.tags = tagsObj;
        }
        const pipelineObj = [];
        if (contact?.pipeline) {
          const obj = {
            id: 'new',
            value: contact.pipeline.replace(/ /g, '-').toLowerCase(),
            label: contact.pipeline,
          };
          contact.pipeline = obj;
          pipelineObj.push(obj);
        }
        const stageObj = [];
        if (contact?.stage) {
          const obj = {
            id: 'new',
            value: contact.stage.replace(/ /g, '-').toLowerCase(),
            label: contact.stage,
          };
          contact.stage = obj;
          stageObj.push(obj);
        }
        SetDropdownList({
          ...dropdownList,
          status: statusObj,
          group: groupObj,
          category: categoryObj,
          tags: tagsObj,
          pipeline: pipelineObj,
          stage: stageObj,
        });
        reset(contact);
        setModalUpdateContactModal(true);
      },
    }));

    const resetUpdateContactModal = () => {
      SetDropdownList({
        group: [],
        status: [],
        category: [],
        tags: [],
        pipeline: [],
        stage: [],
      });
      setModalUpdateContactModal(false);
    };
    const onSubmit = async (data) => {
      const { _id: id } = data;
      if (data?.group?.value) data.group = data.group.label;
      if (data?.status?.value) data.status = data.status.label;
      if (data?.category?.value) data.category = data.category.label;
      if (data?.tags?.length) {
        // const tags = data?.tags.reduce((prev, curr) => {
        //   if (!prev.length) return curr.label;
        //   return (prev += `,${curr.label}`);
        // }, '');
        data.tags = (data.tags || []).map((t) => t.value);
      }
      if (data?.pipeline?.value) data.pipeline = data.pipeline.label;
      if (data?.stage?.value) data.stage = data.stage.label;

      delete data?.errors;
      delete data?._id;

      const { data: response, error } = await updateImportContact(id, data);
      if (!error && response) {
        const tempContacts = [...importedContacts.results];
        const index = tempContacts.findIndex((x) => x._id === id);
        tempContacts[index] = {
          ...response.data,
          errors: response.contactErrors,
          _id: response._id,
        };
        setImportedContacts({ ...importedContacts, results: tempContacts });
        resetUpdateContactModal();
      }
    };
    const getAndSetGroupRelatedValue = async (id) => {
      const latestGroupDetails = await getGroupDetails(id);
      const groupValues = latestGroupDetails?.data?.data;

      if (isArray(groupValues?.pipeline)) {
        setPipelineData(groupValues.pipeline);
      }

      const statusListObj = [];
      if (groupValues?.status?.length > 0) {
        groupValues?.status?.forEach((status) => {
          const obj = {};
          obj.id = status._id;
          obj.value = status.statusCode;
          obj.label = status.statusName;
          statusListObj.push(obj);
        });
      }
      const categoryListObj = [];
      if (groupValues?.category?.length > 0) {
        groupValues?.category?.forEach((category) => {
          const obj = {};
          obj.id = category._id;
          obj.value = category.categoryId;
          obj.label = category.categoryName;
          categoryListObj.push(obj);
        });
      }
      const tagsListObj = [];
      if (groupValues?.tags.length > 0) {
        groupValues?.tags?.forEach((tag) => {
          const obj = {};
          obj.id = tag._id;
          obj.value = tag.tagId;
          obj.label = tag.tagName;
          tagsListObj.push(obj);
        });
      }
      const contactPipeline = [];
      let stageList = [];
      if (groupValues?.pipeline) {
        const tempContactObj = groupValues?.pipeline
          ? groupValues?.pipeline
          : [];
        if (tempContactObj && tempContactObj.length > 0) {
          tempContactObj.forEach((temp) => {
            const obj = {};
            obj.label = temp.pipelineName;
            obj.value = temp.pipelineCode;
            obj.id = temp._id;
            contactPipeline.push(obj);
          });
        }

        let stages = (groupValues?.pipeline || pipelineData)?.find(
          (obj) => obj._id === getValues('pipeline')
        )?.stages;
        if (isArray(stages)) {
          stages = stages.map((obj) => ({
            id: obj._id,
            value: obj.code,
            label: obj.title,
          }));
        }
        if (isArray(stages)) {
          stageList = stages;
        }
      }
      setValue('status', null);
      setValue('category', null);
      setValue('tags', null);
      setValue('pipeline', null);
      setValue('stage', null);

      SetDropdownList({
        ...dropdownList,
        status: statusListObj,
        category: categoryListObj,
        tags: tagsListObj,
        pipeline: contactPipeline,
        stage: stageList,
      });
    };

    const handleGroupChange = (value) => {
      if (value.id !== 'new') {
        getAndSetGroupRelatedValue(value.id);
      }
    };

    const handlePipelineChange = (value, tempPipelineData = pipelineData) => {
      setValue('stage', null);

      let stages = tempPipelineData?.find(
        (obj) => obj._id === value.id
      )?.stages;
      if (isArray(stages)) {
        stages = stages.map((obj) => ({
          id: obj._id,
          value: obj.code,
          label: obj.title,
        }));
      }
      if (isArray(stages)) {
        SetDropdownList({ ...dropdownList, stage: stages });
      }
    };

    return (
      <Modal
        isOpen={modalUpdateContactModal}
        toggle={() => {
          setModalUpdateContactModal(false);
        }}
        className='modal-dialog-centered add-contact-modal'
        backdrop='static'
        size='xl'
      >
        <ModalHeader
          toggle={() => {
            setModalUpdateContactModal(false);
          }}
        >
          Update Contact
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
                  <h4 className='fw-bold text-primary mb-1'>Personal Info</h4>
                  <div className='my-2 mt-0'>Fill your basic information.</div>
                  <Row className='mt-3'>
                    <Col md={4}>
                      <FormField
                        name='firstName'
                        label='First Name'
                        placeholder='First Name'
                        type='text'
                        errors={errors}
                        control={control}
                      />
                    </Col>
                    <Col md={4}>
                      <FormField
                        name='lastName'
                        label='Last Name'
                        placeholder='Last Name'
                        type='text'
                        errors={errors}
                        control={control}
                      />
                    </Col>
                    <Col md={4}>
                      <FormField
                        type='text'
                        label='Email'
                        name='email'
                        placeholder='john@example.com'
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
                        type='text'
                        label='Phone Number'
                        name='phone'
                        placeholder='Phone Number'
                        errors={errors}
                        control={control}
                      />
                    </Col>
                    <Col md={4}>
                      <FormField
                        label='Address Line 1'
                        placeholder='Address Line 1'
                        type='text'
                        errors={errors}
                        control={control}
                        name='address1'
                      />
                    </Col>
                    <Col md={4}>
                      <FormField
                        label='Address 2'
                        placeholder='Address 2'
                        type='text'
                        errors={errors}
                        control={control}
                        name='address2'
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
                        type='text'
                        label='City'
                        name='city'
                        placeholder='City'
                        errors={errors}
                        control={control}
                        // {...register(`city`)}
                      />
                    </Col>
                    <Col md={4}>
                      <FormField
                        type='text'
                        label='State'
                        name='state'
                        placeholder='State'
                        errors={errors}
                        control={control}
                        // {...register(`state`)}
                      />
                    </Col>
                    <Col md={4}>
                      <FormField
                        label='Country'
                        placeholder='country'
                        type='text'
                        errors={errors}
                        control={control}
                        name='country'
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
                        type='text'
                        label='Zip'
                        placeholder='Zip'
                        errors={errors}
                        control={control}
                        name='zip'
                        // {...register(`zip`)}
                      />
                    </Col>
                  </Row>
                </Col>
              </Row>
            </div>
            <div className='form-boarder p-2 mt-1'>
              <Row className='auth-inner m-0'>
                <h4 className='text-primary mb-2'>Group Details</h4>

                <Row>
                  <Col md='4' className='mb-2'>
                    <FormField
                      name='group'
                      label='Group'
                      placeholder='Select Group'
                      type='select'
                      errors={errors}
                      control={control}
                      options={dropdownList.group}
                      onChange={handleGroupChange}
                    />
                  </Col>
                  {/* {group && group.value && ( */}
                  <>
                    <Col md='4' className='mb-2'>
                      <FormField
                        name='status'
                        label='Status'
                        placeholder='Select Status'
                        type='select'
                        errors={errors}
                        control={control}
                        options={dropdownList.status}
                        key={getValues('status')}
                      />
                    </Col>
                    <Col md='4' className='mb-2'>
                      <FormField
                        name='category'
                        label='Category'
                        placeholder='Select Category'
                        type='select'
                        errors={errors}
                        control={control}
                        options={dropdownList.category}
                        key={getValues('category')}
                      />
                    </Col>
                  </>
                </Row>
                <Row>
                  <Col md='4' className='mb-2'>
                    <FormField
                      name='tags'
                      label='Tags'
                      placeholder='Select Tags'
                      type='select'
                      errors={errors}
                      control={control}
                      isMulti={'true'}
                      options={dropdownList.tags}
                      key={getValues('tags')}
                    />
                  </Col>
                  <Col md='4' className='mb-2'>
                    <FormField
                      name='pipeline'
                      label='Pipeline'
                      placeholder='Select Pipeline'
                      type='select'
                      errors={errors}
                      control={control}
                      onChange={handlePipelineChange}
                      options={dropdownList.pipeline || []}
                      key={getValues('pipeline')}
                    />
                  </Col>
                  <Col md='4' className='mb-2'>
                    <FormField
                      name='stage'
                      label='Stage'
                      placeholder='Select Stage'
                      type='select'
                      errors={errors}
                      control={control}
                      options={dropdownList.stage || []}
                      key={getValues('stage')}
                    />
                  </Col>
                </Row>
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
              name={'Update Contact'}
              className='align-items-center justify-content-center'
            ></SaveButton>
          </Form>
          <Button
            color='danger'
            onClick={() => {
              setModalUpdateContactModal(false);
            }}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
);

UploadContactModal.displayName = 'UploadContactModal';

export default UploadContactModal;
