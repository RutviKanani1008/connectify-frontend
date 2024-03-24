import React from 'react';
// import { Col, Row } from 'reactstrap';
import { FormField } from '@components/form-fields';
import { useWatch } from 'react-hook-form';
// import { ArrowRight } from 'react-feather';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { userData } from '../../../../redux/user';
// import { Col } from 'reactstrap';
const AddGroups = ({
  groups,
  handleGroupChange,
  errors,
  control,
  initialValue,
}) => {
  const groupHistoryDetails = useWatch({
    control,
    name: 'groupHistory',
  });
  const reversedGroupHistory = [...(groupHistoryDetails ?? [])].reverse();

  const user = useSelector(userData);

  return (
    <>
      {/* <Col md={6}> */}
      <div className='accordian-loyal-box groups active'>
        <div className='accordian-loyal-header'>
          <div className='inner-wrapper'>
            <h3 className='title'>Groups</h3>
            <button className='down-arrow' type='button'></button>
          </div>
        </div>
        <div className='accordian-loyal-body mb-2'>
          <p className='normal-text'>
            Assign contact to one of the group from list below.
          </p>
          <div style={{ width: '500px', maxWidth: '100%' }}>
            <FormField
              name='group'
              // label='Group'
              placeholder='Select Group'
              type='select'
              errors={errors}
              control={control}
              options={groups}
              onChange={handleGroupChange}
            />
          </div>
          <div className='group-history-title'>Group History</div>
          <>
            <div className='group-history-box-wrapper'>
              {reversedGroupHistory && reversedGroupHistory.length > 0 ? (
                reversedGroupHistory.map((status, index) => {
                  if (index === 0) {
                    return (
                      <>
                        <div className='group-history-box' key={index}>
                          <div className='group-change-row'>
                            <div className='group-name'>
                              {reversedGroupHistory[index]?.group?.id?.groupName
                                ? `${reversedGroupHistory[index]?.group?.id?.groupName}`
                                : 'Unassigned'}
                            </div>
                            <span className='change-arrow'></span>
                            <div className='group-name change'>
                              {initialValue?.group?.label || 'Unassigned'}
                            </div>
                          </div>
                          <div className='author-date'>
                            <span className='author-name'>
                              {status?.changedBy?.firstName}{' '}
                              {status?.changedBy?.lastName}
                            </span>{' '}
                            <span className='date'>
                              {moment(new Date(status.createdAt)).format(
                                `${
                                  user?.company?.dateFormat
                                    ? user?.company?.dateFormat
                                    : 'MM/DD/YYYY'
                                }, HH:mm A`
                              )}
                            </span>
                          </div>
                        </div>
                      </>
                    );
                  }
                  return (
                    <>
                      <div className='group-history-box' key={index}>
                        <div className='group-change-row'>
                          <div className='group-name'>
                            <div>
                              {reversedGroupHistory[index]?.group?.id
                                ?.groupName || 'Unassigned'}
                            </div>
                          </div>
                          <span className='change-arrow'></span>
                          <div className='group-name change'>
                            {reversedGroupHistory[index - 1]?.group?.id
                              ?.groupName
                              ? reversedGroupHistory[index - 1]?.group?.id
                                  ?.groupName
                              : 'Unassigned'}
                          </div>
                        </div>
                        <div className='author-date'>
                          <span className='author-name'>
                            {status?.changedBy?.firstName}{' '}
                            {status?.changedBy?.lastName}
                          </span>{' '}
                          <span className='date'>
                            {moment(new Date(status.createdAt)).format(
                              `${
                                user?.company?.dateFormat
                                  ? user?.company?.dateFormat
                                  : 'MM/DD/YYYY'
                              }, HH:mm A`
                            )}
                          </span>
                        </div>
                      </div>
                    </>
                  );
                })
              ) : (
                <div className='no-record-found-table'>
                  <div className='img-wrapper'>
                    <img src='/images/no-result-found.png' />
                  </div>
                  <div className='title'>No record found</div>
                  <p className='text'>
                    Whoops... we do not see any records for this table in our
                    database
                  </p>
                </div>
              )}
            </div>
          </>
        </div>
      </div>
      {/* </Col> */}
    </>
  );
};

export default AddGroups;
