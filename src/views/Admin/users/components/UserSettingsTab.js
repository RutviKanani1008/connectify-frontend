import { Fragment, useEffect, useState } from 'react';
import {
  useGetUserNotificationSettings,
  useUpdateUserNotificationSettings,
} from '../hooks/userApis';
import { FormField } from '../../../../@core/components/form-fields';
import { useFieldArray, useForm } from 'react-hook-form';
import { Card, CardBody, Form, Label } from 'reactstrap';
import { SaveButton } from '../../../../@core/components/save-button';
import _ from 'lodash';
import UILoader from '@components/ui-loader';

export const AVAILABLE_NOTIFICATION_TYPE = {
  email: 'email',
  platForm: 'platForm',
};

export const AVAILABLE_USER_NOTIFICATION = [
  {
    eventModule: {
      label: 'Task Manager',
      value: 'taskManager',
    },
    availableNotificationDetails: [
      {
        label: 'All Task Notifications',
        value: 'allTaskNotifications',
        isSelectAll: true,
        disabledOnSelectAll: false,
        disabledNotificationType: [],
      },
      {
        label: 'Task Notifications',
        value: 'taskNotifications',
        isSelectAll: false,
        disabledOnSelectAll: true,
        disabledNotificationType: [],
      },
    ],
  },
  {
    eventModule: {
      label: 'Form',
      value: 'form',
    },
    availableNotificationDetails: [
      {
        label: 'Contact Creation',
        value: 'contactCreationNotifications',
        isSelectAll: false,
        disabledOnSelectAll: false,
        disabledNotificationType: ['email'],
      },
    ],
  },
];

// TODO - REVIEW
const FORM_INITIAL_VALUES = {
  notifications: [
    {
      eventModule: AVAILABLE_USER_NOTIFICATION[0].eventModule.value,
      notificationDetail:
        AVAILABLE_USER_NOTIFICATION[0].availableNotificationDetails[0].value,
      notificationType: [],
    },
    {
      eventModule: AVAILABLE_USER_NOTIFICATION[0].eventModule.value,
      notificationDetail:
        AVAILABLE_USER_NOTIFICATION[0].availableNotificationDetails[1].value,
      notificationType: [],
    },
    {
      eventModule: AVAILABLE_USER_NOTIFICATION[1].eventModule.value,
      notificationDetail:
        AVAILABLE_USER_NOTIFICATION[1].availableNotificationDetails[0].value,
      notificationType: [],
    },
  ],
};

const UserNotificationSettings = ({ currentUser }) => {
  const { getUserNotificationSettings, isLoading } =
    useGetUserNotificationSettings();
  const {
    updateNotificationSettings,
    isLoading: updateUserNotificationSettingsLoading,
  } = useUpdateUserNotificationSettings();
  const [currentUserNotificationSetting, setCurrentUserNotificationSetting] =
    useState(null);

  const {
    control,
    handleSubmit,
    reset,
    // getValues,
    setValue,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
    // resolver: yupResolver(formScheme),
    defaultValues: FORM_INITIAL_VALUES,
  });
  const getUserNotificationSettingDetails = async () => {
    const { data, error } = await getUserNotificationSettings(currentUser);
    if (!error && data) {
      if (!data?.notifications?.length) {
        data.notifications = FORM_INITIAL_VALUES.notifications;
      }
      reset(data);
      setCurrentUserNotificationSetting(data);
    }
  };

  useEffect(() => {
    getUserNotificationSettingDetails();
  }, []);

  const handleUserSettingSubmit = async (values) => {
    await updateNotificationSettings(
      currentUserNotificationSetting?._id,
      values
    );
  };

  const { fields: notificationDetails } = useFieldArray({
    control,
    name: 'notifications',
  });

  const handleChangePermission = (
    value,
    eventModule,
    permissionName,
    notificationType
  ) => {
    notificationDetails.map((notifiction) => {
      if (
        notifiction.eventModule === eventModule &&
        permissionName?.isSelectAll
      ) {
        //
        if (!value) {
          notifiction.notificationType = notifiction.notificationType.filter(
            (type) => type !== notificationType
          );
        } else {
          notifiction.notificationType = [
            ...notifiction?.notificationType,
            notificationType,
          ];
        }
      } else {
        if (
          notifiction.eventModule === eventModule &&
          notifiction?.notificationDetail === permissionName.value
        ) {
          if (!value) {
            notifiction.notificationType = notifiction.notificationType.filter(
              (type) => type !== notificationType
            );
          } else {
            notifiction.notificationType = [
              ...notifiction?.notificationType,
              notificationType,
            ];
          }
        }
      }
      return notifiction;
    });
    setValue('notifications', notificationDetails);
  };
  return (
    <UILoader blocking={isLoading}>
      <Card>
        <CardBody>
          <Form
            className='auth-login-form mt-2'
            onSubmit={handleSubmit(handleUserSettingSubmit)}
            autoComplete='off'
          >
            <div className='task-title'>
              <label></label>
              <Label>Email Notifications</Label>
              {'  '}
              <Label>Platform Notifications</Label>
            </div>
            <div className='task-notification-wrap'>
              {AVAILABLE_USER_NOTIFICATION.map((notification, index1) => {
                return (
                  <div className='task-inner' key={index1}>
                    <Label>{notification.eventModule.label}</Label>
                    {notification.availableNotificationDetails.map(
                      (notificationTypeDetail, index2) => {
                        const currentPermission = notificationDetails.find(
                          (details) =>
                            details.eventModule ===
                              notification.eventModule.value &&
                            details.notificationDetail ===
                              notificationTypeDetail.value
                        );

                        const moduleWiseData = notificationDetails.find(
                          (details) =>
                            details.eventModule ===
                            notification.eventModule.value
                        );
                        return (
                          <div
                            className='task-notification'
                            key={`${index1}_${index2}`}
                          >
                            <Label>{notificationTypeDetail.label}</Label>
                            {Object.keys(AVAILABLE_NOTIFICATION_TYPE).map(
                              (notificationType, index3) => {
                                const defaultChecked =
                                  (currentPermission?.notificationType &&
                                    _.isArray(
                                      currentPermission?.notificationType
                                    ) &&
                                    currentPermission?.notificationType?.includes(
                                      notificationType
                                    )) ||
                                  false;
                                return (
                                  <Fragment
                                    key={`${index1}_${index2}_${index3}`}
                                  >
                                    <FormField
                                      type='checkbox'
                                      errors={errors}
                                      control={control}
                                      name={notificationType}
                                      defaultValue={defaultChecked}
                                      key={defaultChecked}
                                      disabled={
                                        notificationTypeDetail?.disabledNotificationType?.includes(
                                          notificationType
                                        ) ||
                                        (notificationTypeDetail?.disabledOnSelectAll &&
                                          moduleWiseData.notificationType?.includes(
                                            notificationType
                                          ))
                                      }
                                      onChange={(event) => {
                                        handleChangePermission(
                                          event?.target?.checked,
                                          notification.eventModule.value,
                                          notificationTypeDetail,
                                          notificationType
                                        );
                                      }}
                                    />
                                  </Fragment>
                                );
                              }
                            )}
                          </div>
                        );
                      }
                    )}
                  </div>
                );
              })}
            </div>

            <div className='mt-2'>
              <SaveButton
                name={'Update Settings'}
                loading={updateUserNotificationSettingsLoading}
                color='primary'
                width='200px'
                onClick={handleSubmit(handleUserSettingSubmit)}
              />
            </div>
          </Form>
        </CardBody>
      </Card>
    </UILoader>
  );
};

export default UserNotificationSettings;
