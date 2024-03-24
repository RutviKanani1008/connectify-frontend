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

const AddQuestions = ({ register, control, setValue, errors }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions',
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
            `questions[${updateQuestion}].question`,
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

  const handleCloseQuestionModal = () => {
    setCurrentQuestionText({
      text: '',
    });
    setOpenAddQuestion(!openAddQuestion);
    setUpdateQuestion(false);
  };

  return (
    <>
      {/* <Col md={6}> */}
      <div className='accordian-loyal-box questions active'>
        <div className='accordian-loyal-header'>
          <div className='inner-wrapper'>
            <h3 className='title'>Custom Fields</h3>
            <button className='down-arrow' type='button'></button>
          </div>
        </div>
        <div className='accordian-loyal-body mb-2'>
          <p className='normal-text'>
            You can answer below fields for the contact or remove / edit the
            fields as required from this section.
          </p>
          {fields &&
            fields.length > 0 &&
            fields.map((questionObj, index) => {
              return (
                <div className='contact-que-box' key={index}>
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
                    name={`questions[${index}].answer`}
                    placeholder={questionObj.question}
                    type='text'
                    errors={errors}
                    control={control}
                    {...register(`questions[${index}].answer`)}
                  />
                </div>
              );
            })}
          <Button
            className='contact-add-question-btn'
            type='button'
            color='primary'
            size='md'
            onClick={() => setOpenAddQuestion(!openAddQuestion)}
            outline
          >
            <Plus size={15} />
            <span className='align-middle ms-25'>Add Question</span>
          </Button>
        </div>
      </div>
      {/* </Col> */}

      <Modal
        isOpen={openAddQuestion}
        toggle={() => handleCloseQuestionModal()}
        className='modal-dialog-centered add-question-modal'
        backdrop='static'
      >
        <ModalHeader toggle={() => setOpenAddQuestion(!openAddQuestion)}>
          {updateQuestion !== false ? 'Update Question' : 'Add Question'}
        </ModalHeader>
        <ModalBody>
          <div className='mb-1'>
            <Input
              label='Question'
              name='question'
              placeholder='Enter Question'
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
                <div className='mt-1 text-danger'>Please Enter Question.</div>
              </>
            ) : null}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color='danger' onClick={() => handleCloseQuestionModal()}>
            Cancel
          </Button>
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
        </ModalFooter>
      </Modal>
    </>
  );
};

export default AddQuestions;
