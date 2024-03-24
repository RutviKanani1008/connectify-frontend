import React, { Fragment } from 'react';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { isArray } from 'lodash';
import { useWatch } from 'react-hook-form';
import { ChevronDown, ChevronUp } from 'react-feather';

import { userData } from '../../../../redux/user';

import { FormField } from '../../../../@core/components/form-fields';

const AddGroupTags = ({
  getValues,
  setValue,
  control,
  errors,
  showHistory = true,
  currentTagFolders = [],
  currentOpenTags = {},
  setCurrentOpenTags = () => {},
  initialValue,
}) => {
  const user = useSelector(userData);

  const selectedTags = useWatch({ control, name: 'tags' });
  const tagList = useWatch({ control, name: 'tagList' });

  const tagHistoryDetails = useWatch({
    control,
    name: 'tagsHistory',
  });
  const reversedTagHistory = [...(tagHistoryDetails ?? [])].reverse();

  const filterdByFolder = (folderId) => {
    return (selectedTags || []).filter((tag) => tag.folder === folderId);
  };
  return (
    <div>
      <div className='accordian-loyal-box tags active'>
        <div className='accordian-loyal-header'>
          <div className='inner-wrapper'>
            <h3 className='title'>Tags</h3>
            <button className='down-arrow' type='button'></button>
          </div>
        </div>
        <div className='accordian-loyal-body mb-2'>
          <p className='normal-text'>
            Assign one or more tags to contact from the list below
          </p>
          <div className='tag-selector-select-box'>
            <form onSubmit={(e) => e.preventDefault()}>
              <FormField
                menuPlacement='auto'
                name='tags'
                placeholder='Select Tag'
                type='select'
                errors={errors}
                control={control}
                isMulti={'true'}
                options={tagList ? tagList : []}
                key={getValues('tags')}
                controlShouldRenderValue={false}
              />
            </form>
          </div>

          {currentTagFolders
            .filter(({ _id }) => filterdByFolder(_id).length)
            .map(({ _id, folderName }) => (
              <Fragment key={_id}>
                <div className='tags-folder-box collapse-folder-box'>
                  <div className='inner-wrapper'>
                    <div className='header-title'>
                      <h3 className='folder-name'>{folderName}</h3>
                      <button
                        className='action-btn down-arrow'
                        type='button'
                        onClick={() => {
                          setCurrentOpenTags((prev) => ({
                            ...prev,
                            [_id]: !prev[_id],
                          }));
                        }}
                      >
                        {currentOpenTags[_id] ? (
                          <ChevronUp color='#000000' className='' size={34} />
                        ) : (
                          <ChevronDown color='#000000' className='' size={34} />
                        )}
                      </button>
                    </div>
                    {currentOpenTags[_id] && (
                      <div className='contant-tags-wrapper'>
                        {filterdByFolder(_id).map((tag) => (
                          <div key={tag.value} className='tag-badge'>
                            <span className='tag-name'>{tag.label}</span>
                            <span
                              className='cross-btn'
                              onClick={() => {
                                const updatedTags = (
                                  selectedTags || []
                                )?.filter((t) => t.value !== tag.value);
                                setValue('tags', updatedTags);
                              }}
                            ></span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Fragment>
            ))}

          {showHistory && (
            <>
              <div className='tags-history-title'>Tags History</div>
              <div className='tags-history-box-wrapper'>
                {reversedTagHistory && reversedTagHistory?.length > 0 ? (
                  reversedTagHistory.map((tag, index) => {
                    if (index === 0) {
                      return (
                        <div className='tags-history-box' key={index}>
                          <div className='tags-change-row'>
                            <div className='tags-name old-tag'>
                              <h3 className='title'>Old Tag</h3>
                              <div className='inner-wrapper'>
                                {reversedTagHistory[index]?.['tags']?.map(
                                  (obj, childIndex) => {
                                    if (
                                      childIndex ===
                                      reversedTagHistory[index]?.['tags']
                                        ?.length -
                                        1
                                    )
                                      return (
                                        <>
                                          <span className='badge-tag'>
                                            {obj.title}
                                          </span>
                                        </>
                                      );
                                    else
                                      return (
                                        <>
                                          <span className='badge-tag'>
                                            {obj.title}
                                          </span>
                                        </>
                                      );
                                  }
                                )}
                              </div>
                            </div>
                            <div className='tags-name new-tag'>
                              <h3 className='title'>New Tag</h3>
                              <div className='inner-wrapper'>
                                {isArray(initialValue.tags) &&
                                  initialValue.tags?.map((obj, childIndex) => {
                                    if (
                                      childIndex ===
                                      initialValue.tags.length - 1
                                    )
                                      return (
                                        <span
                                          className='badge-tag'
                                          key={childIndex}
                                        >
                                          {obj.label}
                                        </span>
                                      );
                                    else
                                      return (
                                        <span
                                          className='badge-tag'
                                          key={childIndex}
                                        >
                                          {obj.label}
                                        </span>
                                      );
                                  })}
                              </div>
                            </div>
                          </div>
                          <div className='author-date'>
                            <span className='author-name'>
                              {tag?.changedBy?.firstName}{' '}
                              {tag?.changedBy?.lastName}
                            </span>
                            <span className='date'>
                              {moment(new Date(tag.createdAt)).format(
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
                      <div className='tags-history-box' key={index}>
                        <div className='tags-change-row'>
                          <div className='tags-name old-tag'>
                            <h3 className='title'>Old Tag</h3>
                            <div className='inner-wrapper'>
                              {reversedTagHistory[index]?.['tags']?.map(
                                (obj, childIndex) => {
                                  if (
                                    childIndex ===
                                    reversedTagHistory[index]?.['tags']
                                      ?.length -
                                      1
                                  ) {
                                    return (
                                      <span
                                        className='badge-tag'
                                        key={childIndex}
                                      >
                                        {obj.title}
                                      </span>
                                    );
                                  } else
                                    return (
                                      <span
                                        className='badge-tag'
                                        key={childIndex}
                                      >
                                        {obj.title}
                                      </span>
                                    );
                                }
                              )}
                            </div>
                          </div>
                          <div className='tags-name new-tag'>
                            <h3 className='title'>New Tag</h3>
                            <div className='inner-wrapper'>
                              {reversedTagHistory[index - 1]?.['tags']?.map(
                                (obj, childIndex) => {
                                  if (
                                    childIndex ===
                                    reversedTagHistory[index - 1]?.['tags']
                                      ?.length -
                                      1
                                  )
                                    return (
                                      <span
                                        className='badge-tag'
                                        key={childIndex}
                                      >
                                        {obj.title}
                                      </span>
                                    );
                                  else
                                    return (
                                      <span
                                        className='badge-tag'
                                        key={childIndex}
                                      >
                                        {obj.title}
                                      </span>
                                    );
                                }
                              )}
                            </div>
                          </div>
                        </div>
                        <div className='author-date'>
                          <span className='author-name'>
                            {tag?.changedBy?.firstName}{' '}
                            {tag?.changedBy?.lastName}
                          </span>
                          <span className='date'>
                            {moment(new Date(tag.createdAt)).format(
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
                      Whoops... we do not see any records for this table in our
                      database
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddGroupTags;
