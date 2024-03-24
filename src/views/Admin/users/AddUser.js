// ==================== Packages =======================
import React, { useEffect, useState, Fragment } from 'react';
import { useParams } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Button,
  UncontrolledTooltip,
  Input,
  Label,
  Nav,
  NavItem,
  NavLink,
} from 'reactstrap';
// ====================================================
import UILoader from '@components/ui-loader';
import { useGetUser } from './hooks/userApis';
import { companyNavItems } from '../../../navigation/vertical';
import ResetPasswordModal from '../contact/components/ResetPasswordModal';
import AddUserForm from './components/AddUserForm';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { showWarnAlert } from '../../../helper/sweetalert.helper';
import { useUpdateuserDetail } from '../../../api/auth';
import classNames from 'classnames';
import ContactChecklistTab from '../contact/components/ContactChecklistTab';
import ContactFilesTab from '../contact/components/ContactFilesTab';
import ContactActivities from '../contact/components/ContactActivites';
import {
  AVAILABLE_USER_PERSONAL_TABS,
  AVAILABLE_USER_TAB_KEYS,
} from '../../settings/UserProfile/constants';
import UserTaskTab from '../../settings/UserTaskTab';
import TaskTimerReport from '../TaskManager/TaskTimerReport';
import { ArrowLeft } from 'react-feather';
import UserNotificationSettings from './components/UserSettingsTab';
import { useSelector } from 'react-redux';
import { userData } from '../../../redux/user';
import useGetBasicRoute from '../../../hooks/useGetBasicRoute';
import NoteDetails from '../contact/components/NotesDetails';

const AddUser = () => {
  // ========================== Hooks =================================
  const params = useParams();
  const history = useHistory();
  const user = useSelector(userData);
  const { basicRoute } = useGetBasicRoute();

  // ========================== states ================================
  const [userDetails, setUserDetails] = useState(null);
  const [currentTab, setCurrentTab] = useState(
    params.tab || AVAILABLE_USER_TAB_KEYS?.['personal-information']
  );
  const [initialValue, setInitialValue] = useState({});
  const [fileUploadURL, setFileUploadURL] = useState(false);
  const [openResetPassword, setOpenResetPassword] = useState(false);
  const [userStatus, setUserStatus] = useState(false);
  const tempPermissionsObj = {};
  companyNavItems
    // .filter((obj) => obj.id !== 'home' && obj.id !== 'setting')
    .forEach((obj) => {
      tempPermissionsObj[obj.id] = false;
      obj?.children?.forEach((obj) => {
        tempPermissionsObj[obj.id] = false;
      });
    });
  const [permissionsObj, setPermissionsObj] = useState(tempPermissionsObj);

  // ========================== Custom Hooks ==========================
  const { getUser, isLoading: getUserLoading } = useGetUser();

  useEffect(() => {
    if (params.id === 'add') setPermissionsObj({});
  }, [params.id]);

  useEffect(async () => {
    if (params.id !== 'add') {
      getUserDetails();
    }
  }, [params]);

  useEffect(() => {
    if (params.tab !== '' && params.id === 'add') {
      switchToTab(AVAILABLE_USER_TAB_KEYS?.['personal-information']);
    }
  }, [params.tab]);

  const getUserDetails = async () => {
    const { data, error } = await getUser(params.id);

    if (!error) {
      const userDetail = data;
      setFileUploadURL(userDetail?.userProfile);
      const tempPermissionsArray = { ...permissionsObj };
      Object.keys(tempPermissionsArray).forEach((key) => {
        if (userDetail?.permissions?.includes?.(key))
          tempPermissionsArray[key] = true;
      });

      userDetail['task-users'] = userDetail.taskManagerUsers;

      setUserStatus(userDetail.active || false);
      setUserDetails(userDetail);
      setInitialValue(userDetail);
      setPermissionsObj(tempPermissionsArray);
    }
  };
  const { UpdateuserDetail } = useUpdateuserDetail();

  const handleChangeUserStatus = async (currentStatus) => {
    const result = await showWarnAlert({
      title: 'Are you sure?',
      text: 'Are you sure you would like to change the status of this user?',
    });

    if (result.value) {
      //
      const { error } = await UpdateuserDetail(
        params.id,
        { active: currentStatus },
        'Update User...'
      );

      if (!error) {
        //
        setUserDetails((prev) => {
          return { ...prev, active: currentStatus };
        });
      }
    } else {
      setUserStatus(!currentStatus);
    }
  };

  const switchToTab = (tab) => {
    setCurrentTab(tab);
    history.replace({
      pathname: `${basicRoute}/users/${params.id}/${tab}`,
      status: history.location.state,
    });
  };

  return (
    <>
      <CardHeader className='custom-card-header'>
        <div
          className='back-arrow'
          id={'goback'}
          onClick={() => {
            history.goBack();
          }}
        >
          <ArrowLeft className='cursor-pointer me-1' id={'goback'} />
          <UncontrolledTooltip placement='top' target={`goback`}>
            Go Back
          </UncontrolledTooltip>
        </div>
        <CardTitle className='text-primary'>
          {params.id !== 'add'
            ? `${
                initialValue?.firstName || initialValue?.lastName
                  ? `${initialValue?.firstName || ''}  ${
                      initialValue?.lastName || ''
                    }`
                  : 'Update User'
              }`
            : 'Add New User'}
        </CardTitle>
        <CardTitle className='text-primary button-wrapper d-inline-flex flex-wrap'>
          <>
            {params.id !== 'add' ? (
              <>
                <div className='active-inactive-toggle d-inline-flex align-items-center'>
                  <Label className=''>
                    {userStatus ? 'Active' : 'Inactive'}
                  </Label>
                  <div className='input-wrapper d-inline-flex'>
                    <div id='active-status' className='switch-checkbox'>
                      <Input
                        inline='true'
                        type={'switch'}
                        checked={userStatus}
                        defaultChecked={userStatus}
                        onChange={(e) => {
                          setUserStatus(e.target.checked);
                          handleChangeUserStatus(e.target.checked);
                        }}
                      />
                      <div className='switch-design'></div>
                    </div>
                    <UncontrolledTooltip
                      placement='top'
                      autohide={true}
                      target='active-status'
                    >
                      {userStatus ? 'Active' : 'Inactive'}
                    </UncontrolledTooltip>
                  </div>
                </div>
                <div className=''>
                  <Button
                    color='primary'
                    onClick={() => {
                      setOpenResetPassword(!openResetPassword);
                    }}
                  >
                    Reset Password
                  </Button>
                </div>
              </>
            ) : null}
          </>
        </CardTitle>
      </CardHeader>

      <div className='new-tab-details-design user-details-page-new'>
        <div className='horizontal-new-tab-wrapper'>
          <Nav className='horizontal-tabbing hide-scrollbar' tabs>
            {AVAILABLE_USER_PERSONAL_TABS.map((individualTabs, index) => {
              return (
                <Fragment key={index}>
                  {((user?.role !== 'admin' &&
                    !individualTabs?.isAdminLoginOnly) ||
                    user?.role === 'admin') && (
                    <NavItem>
                      <NavLink
                        className={classNames({
                          active: currentTab === individualTabs.tabCode,
                        })}
                        onClick={() => {
                          if (
                            !(
                              params.id === 'add' &&
                              individualTabs.isDisabledOnAdd
                            )
                          ) {
                            setCurrentTab(individualTabs.tabCode);
                          }
                        }}
                        // disabled={
                        //   params.id === 'add' && individualTabs.isDisabledOnAdd
                        // }
                        id={individualTabs.tabCode}
                      >
                        {individualTabs.tabName}
                      </NavLink>
                      <UncontrolledTooltip
                        placement='top'
                        autohide={true}
                        target={individualTabs.tabCode}
                      >
                        {params.id === 'add' && individualTabs.isDisabledOnAdd
                          ? 'Add user first'
                          : individualTabs.tabName}
                      </UncontrolledTooltip>
                    </NavItem>
                  )}
                </Fragment>
              );
            })}
          </Nav>
        </div>
        <div className='user-details-page-new'>
          <UILoader blocking={getUserLoading}>
            {currentTab ===
              AVAILABLE_USER_TAB_KEYS?.['personal-information'] && (
              <Card className='company-detail-card add-new-user-card'>
                <CardBody className='fancy-scrollbar'>
                  <AddUserForm
                    userDetails={userDetails}
                    initialValue={initialValue}
                    permissionsObj={permissionsObj}
                    setPermissionsObj={setPermissionsObj}
                    fileUploadURL={fileUploadURL}
                    setFileUploadURL={setFileUploadURL}
                  />
                </CardBody>
              </Card>
            )}

            {currentTab === AVAILABLE_USER_TAB_KEYS?.notes && (
              <NoteDetails
                modelName='Users'
                currentContactDetail={[]}
                key={params.id}
                params={params}
              />
            )}
            {currentTab === AVAILABLE_USER_TAB_KEYS?.checklists && (
              <ContactChecklistTab contactId={params.id} type={'Users'} />
            )}
            {currentTab === AVAILABLE_USER_TAB_KEYS?.files && (
              <ContactFilesTab contactId={params.id} modelType={'Users'} />
            )}
            {currentTab === AVAILABLE_USER_TAB_KEYS?.activities && (
              <ContactActivities
                key={params.id}
                params={{ id: params.id }}
                setCurrentTab={setCurrentTab}
                modelType={'Users'}
                isUserProfile={true}
                // currentTab={'user-detail'}
              />
            )}

            {currentTab === AVAILABLE_USER_TAB_KEYS?.tasks &&
              userDetails?._id && <UserTaskTab initialUserData={userDetails} />}
            {currentTab === AVAILABLE_USER_TAB_KEYS?.['tasks-timer-report'] && (
              <TaskTimerReport
                extraFilers={{ user: params.id }}
                key={params.id}
                currentPage={'user'}
              />
            )}
            {currentTab === AVAILABLE_USER_TAB_KEYS?.['user-settings'] && (
              <UserNotificationSettings
                extraFilers={{ user: params.id }}
                currentUser={params.id}
                key={params.id}
                currentPage={'user'}
              />
            )}
          </UILoader>
          <div>
            <ResetPasswordModal
              email={initialValue?.email}
              openResetPassword={openResetPassword}
              setOpenResetPassword={setOpenResetPassword}
            />
          </div>
        </div>
      </div>
    </>
  );
};
AddUser.displayName = 'AddUser';

export default AddUser;
