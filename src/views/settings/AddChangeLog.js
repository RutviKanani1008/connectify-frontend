import React, { useEffect, useState } from 'react';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { Card, CardBody, CardHeader, CardTitle, Form, Label } from 'reactstrap';
import CustomDatePicker from '../../@core/components/form-fields/CustomDatePicker';

import UILoader from '@components/ui-loader';
import { FormField } from '../../@core/components/form-fields';
import { SaveButton } from '../../@core/components/save-button';
import { useHistory, useParams } from 'react-router-dom';
import { showToast, TOASTTYPES } from '@src/utility/toast-helper';

import {
  createChangeLog,
  getAllChangeLogs,
  updateChangeLog,
} from '../../api/changeLog';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch, useSelector } from 'react-redux';
import { storeUser, userData } from '../../redux/user';
import SyncfusionRichTextEditor from '../../components/SyncfusionRichTextEditor';

const validationSchema = yup.object().shape({
  version: yup.string().required(),
  date: yup.date().required(),
});

const AddChangeLog = () => {
  const params = useParams();
  const dispatch = useDispatch();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showError, setShowError] = useState(false);
  const [formSetRenderKey, setFormSetRenderKey] = useState(1);
  const [initialValues] = useState({ date: new Date() });
  const user = useSelector(userData);

  const history = useHistory();

  const { formState, control, getValues, setValue, reset, handleSubmit } =
    useForm({
      resolver: yupResolver(validationSchema),
      defaultValues: initialValues,
    });

  const { errors } = formState;

  const onSubmitChangeLog = async (data) => {
    if (data?.date.length) {
      data.date = data?.date?.[0];
    }
    const { features, improvements, bugs } = data;
    if (!features && !improvements && !bugs) {
      setShowError(true);
      return;
    } else {
      setShowError(false);
    }
    setIsSubmitting(true);
    if (params.id !== 'add') {
      const updateLog = await updateChangeLog(params.id, data);
      if (updateLog?.data?.response_type === 'success') {
        showToast(TOASTTYPES.success, '', 'Change log updated successfully');
        reset({});
        history.push('/change-logs');
      } else if (updateLog.error) {
        showToast(TOASTTYPES.error, '', updateLog.error);
      }
    } else {
      const newLog = await createChangeLog(data);
      console.log('newLog.data.data', newLog.data);
      if (newLog.data.data) {
        // dispatch(setLatestChangeLog(newLog.data.data));

        const userClone = JSON.parse(JSON.stringify(user));
        userClone.latestVersion = newLog?.data?.data?.version;
        dispatch(storeUser(userClone));
        showToast(TOASTTYPES.success, '', 'Change log created successfully');
        reset({});
        history.push('/change-logs');
      } else if (newLog.error) {
        showToast(TOASTTYPES.error, '', newLog.error);
      }
    }
    setIsSubmitting(false);
  };

  const getChangeLogDetails = () => {
    getAllChangeLogs({ _id: params.id })
      .then((res) => {
        if (res?.data?.data?.length) {
          const temp = res.data.data?.[0];
          temp.date = new Date(temp.date);
          reset(temp);
          setFormSetRenderKey(Math.random());
        } else {
          history.push('/change-logs');
        }
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    if (params.id) {
      if (params.id !== 'add') {
        getChangeLogDetails();
      }
    }
  }, [params]);

  return (
    <UILoader>
      <Card className='log-details-form'>
        <CardHeader>
          <CardTitle>
            {params.id !== 'add' ? 'Update Change Log' : 'Add Change Log'}
          </CardTitle>
        </CardHeader>
        <CardBody>
          <Form
            className='form-wrapper'
            onSubmit={handleSubmit(onSubmitChangeLog)}
          >
            {/* <h4 className='text-primary mb-2'>Log Details</h4> */}
            <div className='mb-1'>
              <Label for='fname'>Version</Label>
              <FormField
                name='version'
                placeholder='Enter Version'
                type='text'
                errors={errors}
                control={control}
              />
            </div>
            <div className='mb-1'>
              <Label for='date'>Date</Label>
              <CustomDatePicker
                errors={errors}
                name='date'
                enableTime={false}
                dateFormat={'Y-m-d'}
                value={getValues('date')}
                onChange={(e) => {
                  setValue('date', e[0]);
                }}
                placeholder={'Select date'}
              />
            </div>
            <div className='mb-1'>
              <Label for='features'>Features</Label>
              <SyncfusionRichTextEditor
                key={`log_features_${formSetRenderKey}`}
                value={getValues('features') || ''}
                onChange={(e) => {
                  setValue('features', e.value, {
                    shouldValidate: true,
                  });
                }}
              />
            </div>
            <div className='mb-1'>
              <Label for='improvements'>Improvements</Label>
              <SyncfusionRichTextEditor
                key={`log_improvements_${formSetRenderKey}`}
                value={getValues('improvements') || ''}
                onChange={(e) => {
                  setValue('improvements', e.value, {
                    shouldValidate: true,
                  });
                }}
              />
            </div>
            <div className='mb-1'>
              <Label for='bugs'>Bug Fixes</Label>
              <SyncfusionRichTextEditor
                key={`log_bugs_${formSetRenderKey}`}
                value={getValues('bugs') || ''}
                onChange={(e) => {
                  setValue('bugs', e.value, {
                    shouldValidate: true,
                  });
                }}
              />
              {showError ? (
                <span className='d-block text-danger mt-1'>
                  At least one field required*
                </span>
              ) : null}
            </div>

            <div className='d-flex align-items-center justify-content-start submit-btn-wrapper'>
              <SaveButton
                width='200px'
                type='submit'
                loading={isSubmitting}
                name={
                  params.id !== 'add' ? 'Update ChangeLog' : 'Add ChangeLog'
                }
                className='mt-1 align-items-center justify-content-center submit-btn'
              ></SaveButton>
            </div>
          </Form>
        </CardBody>
      </Card>
    </UILoader>
  );
};

export default AddChangeLog;
