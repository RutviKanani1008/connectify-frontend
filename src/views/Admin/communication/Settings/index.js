import { useForm } from 'react-hook-form';
import { FormField } from '../../../../@core/components/form-fields';
import { Spinner } from 'reactstrap';
import { useEffect, useState } from 'react';
import { EMAIL_VIEW_TYPE } from '../Email/constant';
import {
  useLazyGetCommunicationSettingsQuery,
  useUpdateCommunicationSettingMutation,
} from '../../../../redux/api/communicationSettingsApi';
import { selectThemeColors, validateEmail } from '../../../../utility/Utils';
import { SaveButton } from '../../../../@core/components/save-button';
import SyncfusionRichTextEditor from '../../../../components/SyncfusionRichTextEditor';

const CommunicationSettings = () => {
  const defaultValues = {
    defaultBCCEmails: [],
    defaultCCEmails: [],
    view: EMAIL_VIEW_TYPE.STANDARD,
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    mode: 'onBlur',
    defaultValues,
  });
  const view = watch('view');

  // ** State **
  const [loading, setLoading] = useState(true);
  const [signatureBody, setSignatureBody] = useState('');

  // ** APIS **
  const [getCommunicationSettings] = useLazyGetCommunicationSettingsQuery();
  const [updateCommunicationSetting, { isLoading: updateLoading }] =
    useUpdateCommunicationSettingMutation();

  useEffect(() => {
    getCommunicationSettingsFunc();
  }, []);

  const getCommunicationSettingsFunc = async () => {
    const { data } = await getCommunicationSettings({}, true);
    if (data?.data) {
      const {
        defaultBCCEmails = [],
        defaultCCEmails = [],
        view,
        signature = '',
      } = data.data;
      reset({
        view,
        defaultBCCEmails: defaultBCCEmails.map((email) => ({
          value: email,
          label: email,
        })),
        defaultCCEmails: defaultCCEmails.map((email) => ({
          value: email,
          label: email,
        })),
        signature,
      });
      // setSignatureBody(signature);
      setSignatureBody(signature || '');
    }
    setLoading(false);
  };

  const onSubmit = async (values) => {
    const { view, defaultBCCEmails, defaultCCEmails, signature } = values;

    const body = {
      view,
      defaultBCCEmails: defaultBCCEmails.map((obj) => obj.value),
      defaultCCEmails: defaultCCEmails.map((obj) => obj.value),
      signature,
    };
    updateCommunicationSetting({ data: body });
  };

  const handleChangeEmail = (emails) => {
    if (emails.length) {
      const tempEmails = JSON.parse(JSON.stringify(emails));
      setValue(
        'emails',
        tempEmails.filter((email) => validateEmail(email.value))
      );
    }
  };

  return (
    <>
      <div className='email-setting-page hide-scrollbar'>
        {loading ? (
          <div className='loader-wrapper'>
            <Spinner />
          </div>
        ) : (
          <>
            <div className='contant-wrapper'>
              <div className='sec-wrapper'>
                <h3 className='sec-heading'>Reading view</h3>
                <FormField
                  type='radio'
                  key={view}
                  error={errors}
                  control={control}
                  options={[
                    { label: 'Standard View', value: EMAIL_VIEW_TYPE.STANDARD },
                    {
                      label: 'Side By Side View',
                      value: EMAIL_VIEW_TYPE.SIDE_BY_SIDE,
                    },
                  ]}
                  name='view'
                  defaultValue={view}
                />
              </div>
              <div className='sec-wrapper'>
                <h3 className='sec-heading'>Default BCC Emails</h3>
                <FormField
                  name='defaultCCEmails'
                  placeholder='Add Label'
                  type='creatableselect'
                  errors={errors}
                  control={control}
                  theme={selectThemeColors}
                  isMulti={'true'}
                  options={[]}
                  className={`react-select ${
                    errors?.['defaultCCEmails']?.message ? 'is-invalid' : ''
                  }`}
                  styles={{
                    singleValue: (base) => ({
                      ...base,
                      display: 'flex',
                      alignItems: 'center',
                    }),
                  }}
                  onChange={(value) => {
                    handleChangeEmail(value);
                  }}
                />
              </div>
              <div className='sec-wrapper'>
                <h3 className='sec-heading'>Default CC Emails</h3>
                <FormField
                  name='defaultBCCEmails'
                  placeholder='Add Label'
                  type='creatableselect'
                  errors={errors}
                  control={control}
                  theme={selectThemeColors}
                  isMulti={'true'}
                  options={[]}
                  className={`react-select ${
                    errors?.['defaultBCCEmails']?.message ? 'is-invalid' : ''
                  }`}
                  styles={{
                    singleValue: (base) => ({
                      ...base,
                      display: 'flex',
                      alignItems: 'center',
                    }),
                  }}
                  onChange={(value) => {
                    handleChangeEmail(value);
                  }}
                />
              </div>
              <div className='sec-wrapper mt-2'>
                <h3 className='sec-heading'>Signature</h3>
                <SyncfusionRichTextEditor
                  key={`communication-signature`}
                  onChange={(e) => {
                    setSignatureBody(e.value);
                    setValue('signature', e.value);
                  }}
                  value={signatureBody}
                />
              </div>

              <div className='save-btn-wrapper'>
                <SaveButton
                  loading={updateLoading}
                  width='150px'
                  type='submit'
                  name='Save'
                  onClick={handleSubmit(onSubmit)}
                ></SaveButton>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default CommunicationSettings;
