import {
  Accordion,
  AccordionBody,
  AccordionItem,
  Button,
  Input,
  Label,
  UncontrolledTooltip,
} from 'reactstrap';
import { FormField } from '@components/form-fields';
import { useState } from 'react';
import { ChevronDown, ChevronUp, MoreVertical, XCircle } from 'react-feather';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useWatch } from 'react-hook-form';
import SyncfusionRichTextEditor from '../../../components/SyncfusionRichTextEditor';

const ChecklistDetailFromFields = (props) => {
  const {
    fields,
    setValue,
    errors,
    control,
    register,
    getValues,
    append,
    remove,
    disabled = false,
    showCompletedWatch,
  } = props;

  const [open, setOpen] = useState(false);

  const toggle = (id) => {
    if (open === id) {
      setOpen();
    } else {
      setOpen(id);
    }
  };

  const onDragEnd = (result) => {
    if (result.destination) {
      const rowData = JSON.parse(JSON.stringify(getValues('checklist')));
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
      setValue('checklist', rowData);
    }
  };
  const checklistWatch = useWatch({ control, name: 'checklist' });

  return (
    <>
      <div className='d-flex align-items-center justify-content-between mb-1 mt-2'>
        <Label className='form-label me-1 mb-0'>Checklist</Label>
        <div className='d-inline-flex align-items-center'>
          <Label
            style={{ position: 'relative', top: '3px', marginRight: '10px' }}
          >
            Show Completed
          </Label>
          <div className='switch-checkbox' id={`showCompleted`}>
            <FormField
              type='switch'
              errors={errors}
              control={control}
              name='showCompleted'
              defaultValue={showCompletedWatch}
              key={getValues('showCompleted')}
            />
            <span className='switch-design'></span>
          </div>
        </div>
        <UncontrolledTooltip
          placement='top'
          autohide={true}
          target={`showCompleted`}
        >
          {!showCompletedWatch ? 'Show Completed' : 'Show Pending'}
        </UncontrolledTooltip>
      </div>
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
                ?.map((field, index) => {
                  if (checklistWatch[index]?.checked === showCompletedWatch) {
                    const firstIndex = checklistWatch.findIndex(
                      (checklist) => checklist.checked === showCompletedWatch
                    );
                    console.log({ firstIndex, index }, index >= firstIndex);
                    return (
                      <Draggable
                        key={`sort-${field['sort']}`}
                        draggableId={`sort-${field['sort']}`}
                        index={index}
                      >
                        {(provided) => (
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
                              toggle={() => {
                                toggle(`${index}`);
                              }}
                            >
                              <AccordionItem className='checklist-box'>
                                <div className='checklist-header'>
                                  <div className='left-wrapper'>
                                    {!disabled && (
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
                                    )}
                                    {!disabled && (
                                      <Input
                                        key={`${field.title}_${index}_${field.id}`}
                                        disabled={disabled}
                                        className=''
                                        type='checkbox'
                                        defaultChecked={getValues(
                                          `checklist[${index}].checked`
                                        )}
                                        // defaultChecked={field.checked}
                                        onChange={(e) => {
                                          e.stopPropagation();
                                          setValue(
                                            `checklist[${index}].checked`,
                                            e.target.checked
                                          );
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    )}
                                    <div className='title-field-wrapper'>
                                      <FormField
                                        disabled={disabled}
                                        className={`input-field ${
                                          errors['checklist']?.[index]?.title
                                            ? 'error'
                                            : ''
                                        }`}
                                        key={`${field.title}_${index}`}
                                        name={`checklist[${index}].title`}
                                        placeholder='Enter Title...'
                                        type='text'
                                        errors={errors}
                                        control={control}
                                        {...register(
                                          `checklist[${index}].title`
                                        )}
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    </div>
                                  </div>
                                  <div className='action-btn-wrapper'>
                                    {getValues(
                                      `checklist[${index}].details`
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
                                          onClick={() => {
                                            toggle(`${index}`);
                                          }}
                                        />
                                      </div>
                                    ) : (
                                      <div className='action-btn down-arrow-btn'>
                                        <ChevronDown
                                          className=''
                                          size={34}
                                          onClick={() => {
                                            toggle(`${index}`);
                                          }}
                                        />
                                      </div>
                                    )}
                                    {!disabled && index > firstIndex && (
                                      <div
                                        className={`action-btn close-btn ${
                                          index
                                            ? 'cursor-pointer'
                                            : 'cursor-not-allowed'
                                        }`}
                                      >
                                        <XCircle
                                          color='red'
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            index && remove(index);
                                          }}
                                          size={24}
                                        />
                                      </div>
                                    )}
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
                                    {/* REVIEW - STYLE */}
                                    <SyncfusionRichTextEditor
                                      key={`checklist_detail_${index}`}
                                      onChange={(e) => {
                                        setValue(
                                          `checklist[${index}].details`,
                                          e.value,
                                          { shouldValidate: true }
                                        );
                                      }}
                                      value={
                                        getValues(
                                          `checklist[${index}].details`
                                        ) || ''
                                      }
                                      readonly={disabled}
                                      name={`rte_${index}`}
                                      list={`#rte_${index}_rte-edit-view`}
                                      // toolbarSettings={{ enable: false }}
                                    />
                                    {/* editorStyle=
                                    {{
                                      border: '1px solid',
                                      minHeight: '175px',
                                    }}
                                    toolbarClassName={`${
                                        disabled && 'hide-toolbar-options'
                                      }`}
                                    wrapperClassName='template-editor-wrapper' 
                                    editorClassName='editor-class'*/}
                                  </div>
                                </AccordionBody>
                              </AccordionItem>
                            </Accordion>
                          </div>
                        )}
                      </Draggable>
                    );
                  }
                })}

              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <div className={`d-flex ${disabled && 'cursor-not-allowed'}`}>
        <Button
          disabled={disabled}
          className={`add-more-btn`}
          onClick={() =>
            append({
              title: '',
              details: '',
              checked: showCompletedWatch,
              sort: fields.length,
            })
          }
        >
          + Add More
        </Button>
      </div>
    </>
  );
};

export default ChecklistDetailFromFields;
