import {
  Accordion,
  AccordionBody,
  AccordionItem,
  Button,
  Input,
} from 'reactstrap';
import { getCurrentUser } from '../../../../helper/user.helper';
import { FormField } from '@components/form-fields';
import { useEffect, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Plus,
  XCircle,
} from 'react-feather';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import moment from 'moment';
import { useLoadMentionUsers } from '../hooks/useHelper';
import SyncfusionRichTextEditor from '../../../../components/SyncfusionRichTextEditor';

const ChecklistDetailTaskManager = (props) => {
  const {
    fields,
    setValue,
    errors,
    control,
    register,
    getValues,
    append,
    remove,
    assignedUsers = [],
  } = props;

  const [open, setOpen] = useState(false);
  const [currentTitleIndex, setCurrentTitleIndex] = useState(null);
  const user = getCurrentUser();

  // Helper function hooks
  const { mentionUsers, loadMentionUsers } = useLoadMentionUsers({
    assignedUsers,
  });
  useEffect(() => {
    loadMentionUsers({ assignedUsers });
  }, [assignedUsers]);

  const toggle = (id) => {
    if (open === id) {
      setOpen();
    } else {
      setOpen(id);
    }
  };

  const onDragEnd = (result) => {
    if (result.destination) {
      const rowData = JSON.parse(
        JSON.stringify(getValues('checklistDetails.checklist'))
      );
      rowData.forEach((field, index) => {
        if (
          result.destination.index > result.source.index &&
          field?.['sort'] >= result.source.index &&
          field?.['sort'] <= result.destination.index
        ) {
          field['sort'] = field?.['sort'] - 1;
        }
        if (
          result.source.index > result.destination.index &&
          field?.['sort'] >= result.destination.index &&
          field?.['sort'] <= result.source.index
        ) {
          field['sort'] = field?.['sort'] + 1;
        }
        if (`sort-${fields?.[index]?.['sort']}` === result.draggableId) {
          field['sort'] = result.destination.index;
        }
      });
      rowData.sort(({ sort: a }, { sort: b }) => a - b);
      setValue('checklistDetails.checklist', rowData);
    }
  };

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId='droppable'>
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className='checklist__wp'
            >
              {fields
                ?.sort(({ sort: a, sort: b }) => a - b)
                ?.map((field, index) => (
                  <Draggable
                    key={`sort-${field['sort']}`}
                    draggableId={`sort-${field['sort']}`}
                    index={index}
                  >
                    {(provided) => (
                      <>
                        <div
                          className='d-flex file__card checklist__list__wrapper'
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <Accordion
                            className={`accordion-margin ${
                              open === `${index}` ? 'active' : ''
                            }`}
                            key={index}
                            open={open}
                          >
                            <AccordionItem className='checklist-box'>
                              <div
                                className='checklist-header'
                                onClick={() => {
                                  setCurrentTitleIndex(index);
                                  // console.log('INNNNNNNNNNNNNNNNNnnnn');
                                }}
                              >
                                <div className='left-wrapper'>
                                  <div className='move-icon-wrapper'>
                                    <MoreVertical
                                      className='cursor-pointer'
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                    <MoreVertical
                                      className='cursor-pointer'
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  </div>
                                  <Input
                                    key={getValues(
                                      `checklistDetails.checklist[${index}].checked`
                                    )}
                                    style={{ width: '22px' }}
                                    className='form-check-input'
                                    type='checkbox'
                                    defaultChecked={getValues(
                                      `checklistDetails.checklist[${index}].checked`
                                    )}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      setValue(
                                        `checklistDetails.checklist[${index}].checked`,
                                        e.target.checked
                                      );
                                      if (e.target.checked) {
                                        setValue(
                                          `checklistDetails.checklist[${index}].checkedTimeAt`,
                                          new Date()
                                        );
                                        setValue(
                                          `checklistDetails.checklist[${index}].updatedBy`,
                                          user?._id
                                        );
                                      } else {
                                        setValue(
                                          `checklistDetails.checklist[${index}].checkedTimeAt`,
                                          null
                                        );
                                        setValue(
                                          `checklistDetails.checklist[${index}].updatedBy`,
                                          null
                                        );
                                      }
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <div className='title-field-wrapper'>
                                    {currentTitleIndex === index ? (
                                      <FormField
                                        className={`input-field ${
                                          errors?.checklistDetails?.checklist?.[
                                            index
                                          ]?.title
                                            ? 'is-invalid'
                                            : ''
                                        }`}
                                        key={`${field.title}_{${index}`}
                                        name={`checklistDetails.checklist[${index}].title`}
                                        placeholder='Enter Title...'
                                        type='text'
                                        errors={errors}
                                        control={control}
                                        {...register(
                                          `checklistDetails.checklist[${index}].title`
                                        )}
                                        onBlur={() => {
                                          setCurrentTitleIndex(null);
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    ) : (
                                      <>
                                        <div
                                          className={`${
                                            open === `${index}`
                                              ? 'show-checklist-full-title'
                                              : 'show-checklist-short-title'
                                          }`}
                                          style={{
                                            ...(open === String(index) && {
                                              whiteSpace: 'unset',
                                            }),
                                          }}
                                        >
                                          {getValues(
                                            `checklistDetails.checklist[${index}].title`
                                          ) || 'Enter Title...'}
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <div className='action-btn-wrapper'>
                                  {getValues(
                                    `checklistDetails.checklist[${index}].details`
                                  ) !== '' ? (
                                    <div className='badge-dot-wrapper'>
                                      <span className='badge-dot badge-dot-warning'></span>
                                    </div>
                                  ) : null}
                                  {open === `${index}` ? (
                                    <div className='action-btn down-arrow-btn'>
                                      <ChevronUp
                                        className=''
                                        size={34}
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          setCurrentTitleIndex(index);
                                          toggle(`${index}`);
                                          setCurrentTitleIndex(null);
                                        }}
                                      />
                                    </div>
                                  ) : (
                                    <div className='action-btn down-arrow-btn'>
                                      <ChevronDown
                                        className=''
                                        size={34}
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          toggle(`${index}`);
                                          setCurrentTitleIndex(null);
                                        }}
                                      />
                                    </div>
                                  )}

                                  <div className={`action-btn close-btn`}>
                                    <XCircle
                                      color='red'
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        remove(index);
                                      }}
                                      size={24}
                                    />
                                  </div>
                                </div>
                              </div>
                              <AccordionBody
                                accordionId={`${index}`}
                                key={open}
                              >
                                <div
                                  className='contact-note'
                                  key={`${index}_editor`}
                                >
                                  {open === `${index}` && (
                                    <SyncfusionRichTextEditor
                                      key={`checklist_${index}_details`}
                                      name={`rte${index}`}
                                      list={`#rte${index}_rte-edit-view`}
                                      onChange={(e) => {
                                        setValue(
                                          `checklistDetails.checklist[${index}].details`,
                                          e.value
                                        );
                                      }}
                                      value={getValues(
                                        `checklistDetails.checklist[${index}].details`
                                      )}
                                      mentionEnable
                                      mentionOption={mentionUsers}
                                    />
                                  )}
                                </div>
                                {field?.checked && field?.updatedBy && (
                                  <div className='markeyBy-name-time'>
                                    <span className='title'>Marked By :</span>
                                    <span className='markeyBy-name'>
                                      {field?.updatedBy?.firstName}{' '}
                                      {field?.updatedBy?.lastName}
                                    </span>
                                    <span className='markeyBy-time'>
                                      {moment(
                                        field?.checkedTimeAt || new Date()
                                      ).format(
                                        `${
                                          user?.company?.dateFormat ||
                                          'MM/DD/YYYY'
                                        } | HH:mm A`
                                      )}
                                    </span>
                                  </div>
                                )}
                              </AccordionBody>
                            </AccordionItem>
                          </Accordion>
                        </div>
                      </>
                    )}
                  </Draggable>
                ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <div className='add-more-btn-wrapper'>
        <Button
          className='add-more-btn'
          outline
          color='primary'
          onClick={() =>
            append({
              title: '',
              details: '',
              checked: false,
              sort: fields.length,
            })
          }
        >
          <Plus size={15} />
          Add More
        </Button>
      </div>
    </>
  );
};

export default ChecklistDetailTaskManager;
