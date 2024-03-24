import React from 'react';
// import { Col, Row } from 'reactstrap';
import { FormField } from '@components/form-fields';
import { useWatch } from 'react-hook-form';
import moment from 'moment';
import AddQuestions from './AddQuestions';
import { useSelector } from 'react-redux';
import { userData } from '../../../../redux/user';
import AddGroupTags from './AddGroupTags';
import { AVAILABLE_PERSONAL_TABS } from '../../../../constant/contact.constant';

const AddGroupSections = ({
  errors,
  control,
  register,
  getValues,
  setValue,
  personalInfoTab,
  isGroupSelected = false,
  selectedGroup = null,
  currentTagFolders = [],
  currentOpenTags = {},
  setCurrentOpenTags = () => {},
  initialValue,
}) => {
  const user = useSelector(userData);

  const statusList = useWatch({ control, name: 'statusList' });
  const categoryList = useWatch({ control, name: 'categoryList' });

  const statusHistoryDetails = useWatch({
    control,
    name: 'statusHistory',
  });
  const reversedStatusHistory = [...(statusHistoryDetails ?? [])].reverse();
  const categoryHistoryDetails = useWatch({
    control,
    name: 'categoryHistory',
  });
  const reversedCategoryHistory = [...(categoryHistoryDetails ?? [])].reverse();

  return (
    <>
      {/* Status Section */}
      {isGroupSelected &&
        personalInfoTab === AVAILABLE_PERSONAL_TABS.status && (
          <div className='accordian-loyal-box status active'>
            <div className='accordian-loyal-header'>
              <div className='inner-wrapper'>
                <h3 className='title'>Status</h3>
                <button className='down-arrow' type='button'></button>
              </div>
            </div>
            <div className='accordian-loyal-body mb-2'>
              <p className='normal-text'>
                Select current status of the contact from the list below.
              </p>
              <div style={{ width: '500px', maxWidth: '100%' }}>
                <FormField
                  name='status'
                  placeholder='Select Status'
                  type='select'
                  errors={errors}
                  control={control}
                  options={statusList ? statusList : []}
                  key={getValues('status')}
                />
              </div>
              <div className='status-history-title'>Status History</div>
              <>
                <div className='status-history-box-wrapper'>
                  {reversedStatusHistory && reversedStatusHistory.length > 0 ? (
                    reversedStatusHistory
                      ?.sort(
                        ({ createdAt: a }, { createdAt: b }) =>
                          moment(b) - moment(a)
                      )
                      .map((status, index) => {
                        if (index === 0) {
                          return (
                            <div className='status-history-box' key={index}>
                              <div className='status-change-row'>
                                <div className='status-name'>
                                  {reversedStatusHistory[index]?.status?.title
                                    ? `${reversedStatusHistory[index]?.status?.title}`
                                    : 'Unassigned'}
                                </div>
                                <span className='change-arrow'></span>
                                <div className='status-name change'>
                                  {initialValue?.status?.label || 'Unassigned'}
                                </div>
                              </div>
                              <div className='author-date'>
                                <span className='author-name'>
                                  {status?.changedBy?.firstName}{' '}
                                  {status?.changedBy?.lastName}
                                </span>
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
                          );
                        }
                        return (
                          <div className='status-history-box' key={index}>
                            <div className='status-change-row'>
                              <div className='status-name'>
                                <div>
                                  {reversedStatusHistory[index].status?.title ||
                                    'Unassigned'}
                                </div>
                              </div>
                              <span className='change-arrow'></span>
                              <div className='status-name change'>
                                {reversedStatusHistory[index - 1]?.status?.title
                                  ? reversedStatusHistory[index - 1]?.status
                                      ?.title
                                  : 'Unassigned'}
                              </div>
                            </div>
                            <div className='author-date'>
                              <span className='author-name'>
                                {status?.changedBy?.firstName}{' '}
                                {status?.changedBy?.lastName}
                              </span>
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
                        );
                      })
                  ) : (
                    <div className='no-record-found-table'>
                      <div className='img-wrapper'>
                        <img src='/images/no-result-found.png' />
                      </div>
                      <div className='title'>No record found</div>
                      <p className='text'>
                        Whoops... we do not see any records for this table in
                        our database
                      </p>
                    </div>
                  )}
                </div>
              </>
            </div>
          </div>
        )}

      {/* Category Section */}
      {isGroupSelected &&
        personalInfoTab === AVAILABLE_PERSONAL_TABS.category && (
          <div className='accordian-loyal-box category active'>
            <div className='accordian-loyal-header'>
              <div className='inner-wrapper'>
                <h3 className='title'>Category</h3>
                <button className='down-arrow' type='button'></button>
              </div>
            </div>
            <div className='accordian-loyal-body mb-2'>
              <p className='normal-text'>
                Select category of the contact from the list below.
              </p>
              <div style={{ width: '500px', maxWidth: '100%' }}>
                <FormField
                  name='category'
                  placeholder='Select Category'
                  type='select'
                  errors={errors}
                  control={control}
                  options={categoryList ? categoryList : []}
                  key={getValues('category')}
                />
              </div>
              <div className='category-history-title'>Category History</div>
              <>
                <div className='category-history-box-wrapper'>
                  {reversedCategoryHistory &&
                  reversedCategoryHistory.length > 0 ? (
                    reversedCategoryHistory
                      ?.sort(
                        ({ createdAt: a }, { createdAt: b }) =>
                          moment(b) - moment(a)
                      )
                      .map((status, index) => {
                        if (index === 0) {
                          return (
                            <div className='category-history-box' key={index}>
                              <div className='category-change-row'>
                                <div className='category-name'>
                                  {reversedCategoryHistory[index]?.category
                                    ?.title
                                    ? `${reversedCategoryHistory[index]?.category?.title}`
                                    : 'Unassigned'}
                                </div>
                                <span className='change-arrow'></span>
                                <div className='category-name change'>
                                  {initialValue?.category?.label ||
                                    'Unassigned'}
                                </div>
                              </div>
                              <div className='author-date'>
                                <span className='author-name'>
                                  {status?.changedBy?.firstName}{' '}
                                  {status?.changedBy?.lastName}
                                </span>
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
                          );
                        }
                        return (
                          <div className='category-history-box' key={index}>
                            <div className='category-change-row'>
                              <div className='category-name'>
                                <div>
                                  {reversedCategoryHistory[index].category
                                    ?.title || 'Unassigned'}
                                </div>
                              </div>
                              <span className='change-arrow'></span>
                              <div className='category-name change'>
                                {reversedCategoryHistory[index - 1]?.category
                                  ?.title
                                  ? reversedCategoryHistory[index - 1]?.category
                                      ?.title
                                  : 'Unassigned'}
                              </div>
                            </div>
                            <div className='author-date'>
                              <span className='author-name'>
                                {status?.changedBy?.firstName}{' '}
                                {status?.changedBy?.lastName}
                              </span>
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
                        );
                      })
                  ) : (
                    <div className='no-record-found-table'>
                      <div className='img-wrapper'>
                        <img src='/images/no-result-found.png' />
                      </div>
                      <div className='title'>No record found</div>
                      <p className='text'>
                        Whoops... we do not see any records for this table in
                        our database
                      </p>
                    </div>
                  )}
                </div>
              </>
            </div>
          </div>
        )}

      {/* Tags Section */}
      {isGroupSelected && personalInfoTab === AVAILABLE_PERSONAL_TABS.tags && (
        <AddGroupTags
          getValues={getValues}
          setValue={setValue}
          control={control}
          errors={errors}
          selectedGroup={selectedGroup}
          currentTagFolders={currentTagFolders}
          currentOpenTags={currentOpenTags}
          setCurrentOpenTags={setCurrentOpenTags}
          initialValue={initialValue}
        />
      )}

      {/* Questions Section */}
      {personalInfoTab === AVAILABLE_PERSONAL_TABS.custom_field && (
        <AddQuestions
          register={register}
          control={control}
          setValue={setValue}
          errors={errors}
        />
      )}
    </>
  );
};

export default AddGroupSections;
