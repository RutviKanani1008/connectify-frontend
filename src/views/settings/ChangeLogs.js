import { Fragment, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Button,
  UncontrolledTooltip,
} from 'reactstrap';
import {
  Edit2,
  Plus,
  PlusCircle,
  Tool,
  Trash,
  TrendingUp,
} from 'react-feather';
import { isSuperAdmin } from '../../helper/user.helper';
import {
  deleteChangeLog,
  getAllChangeLogs,
  latestChangeLog,
} from '../../api/changeLog';
import { useDispatch, useSelector } from 'react-redux';
import { storeUpdateUser, storeUser, userData } from '../../redux/user';
import moment from 'moment';
import useGetBasicRoute from '../../hooks/useGetBasicRoute';
import { showToast, TOASTTYPES } from '@src/utility/toast-helper';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import { updateUser } from '../../api/auth';
import SyncfusionRichTextEditor from '../../components/SyncfusionRichTextEditor';
import SpinnerLoader from '../../components/SpinnerLoader';
// import SyncfusionRichTextEditor from '../../components/SyncfusionRichTextEditor';

const MySwal = withReactContent(Swal);

const ChangeLogPage = () => {
  const history = useHistory();
  const [changeLogsDetails, setChangeLogDetail] = useState([]);
  const [changeLogsLoading, setChaneLogsLoading] = useState([]);
  const user = useSelector(userData);
  const { basicRoute } = useGetBasicRoute();

  const dispatch = useDispatch();

  const updateUserChangeLogTime = async () => {
    try {
      setChaneLogsLoading(true);
      const res = await getAllChangeLogs();
      if (res.data.data?.length) {
        setChangeLogDetail(res.data.data);
        if (user.role !== 'superadmin') {
          const userDetails = JSON.parse(JSON.stringify(user));
          userDetails.lastChangeLogTime = new Date();
          await updateUser(userDetails);
          userDetails.pendingChangeLogCount = 0;
          dispatch(storeUser(userDetails));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setChaneLogsLoading(false);
    }
  };

  useEffect(() => {
    updateUserChangeLogTime();
  }, []);

  const handleDeleteChangeLog = (item) => {
    return MySwal.fire({
      title: 'Are you sure?',
      text: `Are you sure you want to delete this change log?`,
      icon: 'warning',
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonText: 'Yes',
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger ms-1',
      },
      buttonsStyling: false,
    }).then(async (result) => {
      if (result.value) {
        const res = await deleteChangeLog(item._id);
        if (res.error) {
          showToast(TOASTTYPES.error, '', res.error);
        } else {
          showToast(TOASTTYPES.success, '', 'Log deleted successfully');
          updateUserChangeLogTime();
          latestChangeLog().then((res) => {
            if (res.data?.data) {
              const userClone = JSON.parse(JSON.stringify(user));
              userClone.latestVersion = res.data.data.version;
              dispatch(storeUpdateUser(userClone));
            }
          });
        }
      }
    });
  };

  return (
    <div className={`change-log-page ${isSuperAdmin() && 'superAdmin'}`}>
      <div className='page-header'>
        <h3 className='title'>Change Logs</h3>
        {isSuperAdmin() && (
          <Button
            className='ms-2'
            color='primary'
            onClick={() => {
              if (isSuperAdmin()) history.push('/change-logs/add');
            }}
            id={`add-btn`}
          >
            <Plus size={15} />
            <span className='align-middle ms-50'>Add New</span>
          </Button>
        )}
      </div>
      {changeLogsDetails && changeLogsDetails?.length > 0 ? (
        <>
          {changeLogsDetails.map((log, index) => {
            return (
              <Fragment key={index}>
                <Card>
                  <CardHeader>
                    <CardTitle className='d-flex justify-content-between w-100'>
                      <h3 className='card-title'>
                        v{log?.version} (
                        {moment(new Date(log.date)).format('DD MMM, YYYY')})
                      </h3>
                      <div className='action-btn-wrapper d-flex'>
                        {isSuperAdmin() ? (
                          <>
                            <div className='action-btn edit-btn'>
                              <Edit2
                                size={15}
                                className='me-1 cursor-pointer'
                                onClick={() => {
                                  if (user.role === 'superadmin') {
                                    history.push(
                                      `${basicRoute}/change-logs/${log._id}`
                                    );
                                  }
                                }}
                                id={`edit_${log._id}`}
                              />
                              <UncontrolledTooltip
                                placement='top'
                                autohide={true}
                                target={`edit_${log._id}`}
                              >
                                Edit Change Log
                              </UncontrolledTooltip>
                            </div>
                            <div className='action-btn delete-btn'>
                              <Trash
                                size={15}
                                color='red'
                                className='cursor-pointer'
                                onClick={() => {
                                  handleDeleteChangeLog(log);
                                }}
                                id={`delete_${log._id}`}
                              />
                              <UncontrolledTooltip
                                placement='top'
                                autohide={true}
                                target={`delete_${log._id}`}
                              >
                                Delete
                              </UncontrolledTooltip>
                            </div>
                          </>
                        ) : null}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardBody>
                    <div className='change-logs-inner-iBox'>
                      <div className='haader-wrapper'>
                        <div className='icon-wrapper'>
                          <PlusCircle size={15} />
                        </div>
                        <h4 className='heading'>Feature</h4>
                      </div>
                      <div className='change-log-list-wrapper'>
                        {log?.features ? (
                          <SyncfusionRichTextEditor
                            key={`log_features_list_${log._id}`}
                            name={`rte_feature_${index}`}
                            list={`#rte_feature_${index}_rte-edit-view`}
                            value={log.improvements}
                            enabled={false}
                            toolbarSettings={{ enable: false }}
                          />
                        ) : (
                          <div className='no-data'>
                            <h5 className='chang-log-empty'>No new feature!</h5>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className='change-logs-inner-iBox'>
                      <div className='haader-wrapper'>
                        <div className='icon-wrapper'>
                          <TrendingUp size={15} />
                        </div>
                        <h4 className='heading'>Improvements</h4>
                      </div>
                      <div className='change-log-list-wrapper'>
                        {/* REVIEW - STYLE */}
                        {log?.improvements ? (
                          <SyncfusionRichTextEditor
                            key={`log_improvements_list_${log._id}`}
                            name={`rte_improvements_${index}`}
                            list={`#rte_improvements_${index}_rte-edit-view`}
                            value={log.improvements}
                            enabled={false}
                            toolbarSettings={{ enable: false }}
                          />
                        ) : (
                          <div className='no-data'>
                            <h5 className='chang-log-empty'>
                              No new improvements!
                            </h5>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className='change-logs-inner-iBox'>
                      <div className='haader-wrapper'>
                        <div className='icon-wrapper'>
                          <Tool size={15} />
                        </div>
                        <h4 className='heading'>Bug Fixes</h4>
                      </div>
                      <div className='change-log-list-wrapper'>
                        {/* REVIEW - STYLE */}
                        {log?.bugs ? (
                          <SyncfusionRichTextEditor
                            key={`log_bugs_list_${log._id}`}
                            name={`rte_bugs_${index}`}
                            list={`#rte_bugs_${index}_rte-edit-view`}
                            value={log.bugs}
                            enabled={false}
                            toolbarSettings={{ enable: false }}
                          />
                        ) : (
                          <div className='no-data'>
                            <h5 className='chang-log-empty'>
                              No new bugs fixes!
                            </h5>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Fragment>
            );
          })}
        </>
      ) : changeLogsLoading ? (
        <SpinnerLoader />
      ) : (
        <>No Change Logs</>
      )}
    </div>
  );
};

export default ChangeLogPage;
