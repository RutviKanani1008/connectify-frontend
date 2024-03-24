// ** React Imports
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';

// ** Reactstrap Imports
import { SaveButton } from '@components/save-button';
import { CardTitle, CardText, Form, Card, CardBody, Spinner } from 'reactstrap';
import '@styles/react/pages/page-authentication.scss';
import { FormField } from '../../../@core/components/form-fields';
import * as yup from 'yup';
import { required } from '../../../configs/validationConstant';
import { useForm, useWatch } from 'react-hook-form';
import themeConfig from '@configs/themeConfig';
import { addRSVPResponse, getSpecificEvent } from '../../../api/event';
import { showToast, TOASTTYPES } from '@src/utility/toast-helper';
import moment from 'moment';
import { RSVP_OPTION } from '../../../constant';
// import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

const forgotPasswordSchema = yup.object().shape({
  email: yup.string().email().required(required('Email')),
});

const ForgotPassword = () => {
  // const { executeRecaptcha } = useGoogleReCaptcha();
  const [loading, setLoading] = useState(false);
  const [eventDetails, setEventDetails] = useState(false);
  const [isEventLive, setIsEventLive] = useState(true);
  const [rsvpSubmitted, setRSVPSubmitted] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    resolver: yupResolver(forgotPasswordSchema),
  });
  const params = useParams();

  const getEventRSVPDetails = async () => {
    if (params?.id) {
      setLoading(true);
      const event = await getSpecificEvent({
        slug: params?.id,
      });
      if (event?.data?.data) {
        if (new Date(event?.data?.data?.start) < new Date()) {
          setIsEventLive(false);
        }
        setEventDetails(event?.data?.data);
      }
      setLoading(false);
    } else {
      //   history.push('/');
    }
  };

  useEffect(() => {
    getEventRSVPDetails();
    reset({
      are_you_bringing_any_guests: 'no',
      are_you_coming: 'yes',
    });
  }, []);

  const onSubmit = async (value) => {
    // if (!executeRecaptcha) {
    //   return;
    // }
    setSubmitLoading(true);
    // const recaptchaToken = await executeRecaptcha('forms');
    addRSVPResponse(params.id, { ...value }).then((res) => {
      if (res.error) {
        setSubmitLoading(false);
        showToast(TOASTTYPES.error, '', res.error);
      } else {
        setRSVPSubmitted(true);
        setSubmitLoading(false);
      }
    });
  };

  const showLogo =
    eventDetails?.rsvpFormInfo?.showLogo !== undefined
      ? eventDetails?.rsvpFormInfo?.showLogo
      : true;
  const showLogoName =
    eventDetails?.rsvpFormInfo?.showLogoName !== undefined
      ? eventDetails?.rsvpFormInfo?.showLogoName
      : true;

  const ShowReason = () => {
    const are_you_coming = useWatch({
      control,
      name: 'are_you_coming',
    });
    return (
      <>
        {are_you_coming && are_you_coming === 'no' ? (
          <>
            <div className='mb-1'>
              <FormField
                name={`reason`}
                label='Reason'
                type='text'
                errors={errors}
                control={control}
              />
            </div>
          </>
        ) : null}
      </>
    );
  };

  const ShowGuestCount = () => {
    const are_you_bringing_any_guests = useWatch({
      control,
      name: 'are_you_bringing_any_guests',
    });
    return (
      <>
        {are_you_bringing_any_guests &&
        are_you_bringing_any_guests === 'yes' ? (
          <>
            <div className='mb-1'>
              <FormField
                name={`number_of_guest`}
                label='How many guests you are bringing in the event?'
                type='number'
                errors={errors}
                control={control}
              />
            </div>
          </>
        ) : null}
      </>
    );
  };

  return (
    <div className='auth-wrapper auth-basic px-1'>
      <div className='auth-inner my-1'>
        <Card className='mb-0'>
          <CardBody>
            <Link
              // className='brand-logo'
              to='/'
              onClick={(e) => e.preventDefault()}
            >
              {showLogo && (
                <span className='brand-logo'>
                  <img
                    // sizes='10%'
                    style={{ height: '48px' }}
                    src={
                      eventDetails?.company?.companyLogo
                        ? `${process.env.REACT_APP_S3_BUCKET_BASE_URL}${eventDetails?.company?.companyLogo}`
                        : // themeConfig.app.smallLogo
                          themeConfig.app.smallLogo
                    }
                    alt='logo'
                  />
                </span>
              )}

              {showLogoName && (
                <h2 className='brand-text text-center text-primary mt-1 mb-2'>
                  {eventDetails?.company?.name
                    ? eventDetails?.company?.name
                    : process.env.REACT_APP_COMPANY_NAME}
                </h2>
              )}
            </Link>
            {loading ? (
              <>
                <div className='text-center'>
                  <Spinner className='mb-1' />
                </div>
              </>
            ) : (
              <>
                {eventDetails && isEventLive ? (
                  <>
                    {!rsvpSubmitted ? (
                      <>
                        <CardTitle tag='h4' className='mb-1 text-center'>
                          {eventDetails && eventDetails.name
                            ? eventDetails.name
                            : ''}
                        </CardTitle>
                        <CardText className='mb-2'>
                          <div className='text-center'>
                            {eventDetails && eventDetails.description
                              ? eventDetails.description
                              : ''}
                          </div>
                          <div className=''>
                            <hr className='invoice-spacing' />
                            <div className='mt-1 text-primary text-center h5'>
                              Event Details
                            </div>

                            <div className='d-flex mt-1 me-3 justify-content-between'>
                              <div>Event Start Time </div>
                              <div className='ms-1 text-center'>
                                {eventDetails && eventDetails.start
                                  ? moment(new Date(eventDetails.start)).format(
                                      'MM/DD/YYYY, HH:mm A'
                                    )
                                  : '-'}
                              </div>
                            </div>
                            <div className='d-flex mt-1 me-3 justify-content-between'>
                              <div>Event End Time </div>
                              <div className='ms-1 text-center'>
                                {eventDetails && eventDetails.end
                                  ? moment(new Date(eventDetails.end)).format(
                                      'MM/DD/YYYY, HH:mm A'
                                    )
                                  : '-'}
                              </div>
                            </div>
                          </div>
                          <hr className='invoice-spacing' />
                        </CardText>
                        <Form
                          className='auth-reset-password-form mt-2'
                          onSubmit={handleSubmit(onSubmit)}
                        >
                          <div className='mb-1'>
                            <FormField
                              name={`are_you_coming`}
                              label='Are you coming to this event?'
                              defaultValue={getValues('are_you_coming')}
                              options={RSVP_OPTION}
                              type='radio'
                              errors={errors}
                              control={control}
                            />
                          </div>
                          <ShowReason />
                          <div className='mb-1'>
                            <FormField
                              name={`are_you_bringing_any_guests`}
                              label='Are you bringing any guests?'
                              defaultValue={getValues(
                                'are_you_bringing_any_guests'
                              )}
                              options={[
                                {
                                  label: 'Yes',
                                  value: 'yes',
                                },
                                { label: 'No', value: 'no' },
                              ]}
                              type='radio'
                              errors={errors}
                              control={control}
                            />
                          </div>
                          <ShowGuestCount />
                          <div className='mb-1'>
                            <FormField
                              label='Email'
                              name='email'
                              placeholder='john@example.com'
                              type='text'
                              errors={errors}
                              control={control}
                            />
                          </div>
                          <SaveButton
                            width='100%'
                            type='submit'
                            loading={submitLoading}
                            name='Confirm'
                          ></SaveButton>
                        </Form>
                      </>
                    ) : (
                      <>
                        <CardBody>
                          <CardTitle tag='h4' className='mb-2 mt-2 text-center'>
                            Thank you for confirm your Availability.
                          </CardTitle>
                        </CardBody>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <CardBody>
                      <CardTitle tag='h4' className='mb-2 mt-2 text-center'>
                        {isEventLive
                          ? `Event you are looking for doesn't exists`
                          : eventDetails &&
                            new Date() < new Date(eventDetails?.end)
                          ? 'Event has been started'
                          : `Event has been ended`}
                      </CardTitle>
                    </CardBody>
                  </>
                )}
              </>
            )}
            <div className='text-center mt-1'>
              <div>
                Powered by <a href={process.env.REACT_APP_APP_URL}>xyz.com</a>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
