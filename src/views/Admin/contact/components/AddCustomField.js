import React, { useState, Fragment } from 'react';
import { Edit2, Plus, X } from 'react-feather';
import { useFieldArray } from 'react-hook-form';
import {
  Button,
  // Col,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  // Row,
} from 'reactstrap';

import { FormField } from '@components/form-fields';
import { showWarnAlert } from '../../../../helper/sweetalert.helper';

const AddCustomField = ({ register, control, setValue, errors, name }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });
  const [openAddQuestion, setOpenAddQuestion] = useState(false);
  const [showError, setShowError] = useState(false);
  const [currentQuestionText, setCurrentQuestionText] = useState({
    text: '',
  });
  const [updateQuestion, setUpdateQuestion] = useState(false);

  const addQuestion = () => {
    if (currentQuestionText.text !== '' && updateQuestion !== false) {
      fields.forEach((field, index) => {
        if (index === updateQuestion) {
          fields[index].question = currentQuestionText.text;

          setValue(
            `${name}[${updateQuestion}].question`,
            currentQuestionText.text
          );
        }
      });
      setCurrentQuestionText({ text: '' });
      setOpenAddQuestion(false);
      setUpdateQuestion(false);
    } else {
      append({ question: currentQuestionText.text, answer: '' });
      setCurrentQuestionText({ text: '' });
      setOpenAddQuestion(false);
    }
  };

  const editQuestion = (key) => {
    if (fields && fields.length > 0) {
      fields.forEach((field, index) => {
        if (index === key) {
          setCurrentQuestionText({ text: fields[index].question });
          setUpdateQuestion(key);
          setOpenAddQuestion(true);
        }
      });
    }
  };

  const removeQuestion = async (pos) => {
    const result = await showWarnAlert({
      text: 'are you want to Delete this question?',
    });

    if (result.value) remove(pos);
  };

  return (
    <div className='custom-field-wrapper'>
      <div className='custom-field-header'>
        <h4 className='title'>Custom Fields</h4>
        <p className='text'>
          You can answer below fields for the contact or remove / edit the
          fields as required from this section.
        </p>
      </div>
      {fields &&
        fields.length > 0 &&
        fields.map((questionObj, index) => {
          return (
            <Fragment key={index}>
              <div className='custom-field-box'>
                <FormField
                  infoElement={
                    <div className='action-btn-wrapper' key={`${index}_btn`}>
                      <div className='action-btn edit-btn'>
                        <Edit2
                          className='text-primary cursor-pointer'
                          size={12}
                          onClick={() => editQuestion(index)}
                        />
                      </div>
                      <div className='action-btn delete-btn'>
                        <X
                          size={14}
                          className='text-primary cursor-pointer'
                          onClick={() => {
                            removeQuestion(index);
                          }}
                        />
                      </div>
                    </div>
                  }
                  label={questionObj.question}
                  name={`${name}[${index}].answer`}
                  placeholder={questionObj.question}
                  type='text'
                  errors={errors}
                  control={control}
                  {...register(`${name}[${index}].answer`)}
                />
              </div>
            </Fragment>
          );
        })}
      <Button
        className='add-custom-filed-button'
        type='button'
        color='primary'
        size='md'
        onClick={() => setOpenAddQuestion(!openAddQuestion)}
        outline
      >
        <Plus size={15} />
        <span className='align-middle ms-25'>Add Custom Field</span>
      </Button>
      <Modal
        isOpen={openAddQuestion}
        toggle={() => setOpenAddQuestion(!openAddQuestion)}
        className='modal-dialog-centered add-custom-filed-modal'
        backdrop='static'
      >
        <ModalHeader toggle={() => setOpenAddQuestion(!openAddQuestion)}>
          {updateQuestion !== false
            ? 'Update Custom Field'
            : 'Add Custom Field'}
        </ModalHeader>
        <ModalBody>
          <div className='mb-1 mt-1'>
            <Input
              label='Question'
              name='question'
              placeholder='Enter Custom Field'
              type='text'
              value={currentQuestionText.text}
              onChange={(e) => {
                if (showError) {
                  setShowError(false);
                }
                setCurrentQuestionText({
                  ...currentQuestionText,
                  text: e.target.value,
                });
              }}
            />
            {showError ? (
              <>
                <div className='mt-1 text-danger'>
                  Please Enter Custom Field.
                </div>
              </>
            ) : null}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color='primary'
            onClick={() => {
              if (currentQuestionText.text === '') {
                setShowError(true);
              } else {
                addQuestion();
              }
            }}
          >
            {updateQuestion !== false ? 'Update' : 'Add'}
          </Button>
          <Button
            color='danger'
            onClick={() => setOpenAddQuestion(!openAddQuestion)}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default AddCustomField;
