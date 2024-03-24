import React from 'react';
import { Modal, ModalBody, ModalHeader, UncontrolledTooltip } from 'reactstrap';
import parse from 'html-react-parser';
import { Icon } from '@iconify/react';

const PinnedNotesModal = ({ notes, unpinNote, isOpen, onClose }) => {
  const hasPinnedNotes = (notes || []).filter((n) => n.isPinned).length > 0;

  return (
    <Modal
      isOpen={isOpen}
      toggle={onClose}
      className='modal-dialog-centered pinned-notes-modal modal-dialog-mobile'
      backdrop='static'
      size='lg'
      fade={false}
    >
      <ModalHeader toggle={onClose}>Pinned Notes</ModalHeader>
      <ModalBody>
        <>
          {hasPinnedNotes ? (
            notes.map((note, index) => {
              return (
                note.isPinned && (
                  <div key={index} className='notes-card-box'>
                    <div className='text'>
                      {note.text ? parse(note.text) : ''}
                    </div>
                    <UncontrolledTooltip target='unpin-note'>
                      Unpin Note
                    </UncontrolledTooltip>
                    <div className='action-btn-wrapper'>
                      <div className='action-btn'>
                        <div id='unpin-note'>
                          <Icon
                            className='cursor-pointer'
                            icon='ic:baseline-pin-off'
                            width='20'
                            onClick={() => unpinNote(index)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              );
            })
          ) : (
            <div className='no-data-wrapper'>
              <div className='icon-wrapper'>
                <svg
                  version='1.1'
                  id='Layer_1'
                  x='0px'
                  y='0px'
                  viewBox='0 0 204 204'
                >
                  <path
                    style={{ fill: 'var(--primaryColor)' }}
                    d='M169.2,80.2c0,4.2-1.9,7-5.2,8.1c-3.1,1.1-6.4,0.1-8.5-2.5c-1.5-1.8-1.7-3.9-1.7-6.1
                  c0-14.9,0-29.7,0-44.6c0-5.4-1.7-10-6-13.5c-2.8-2.2-6.1-3.2-9.6-3.2c-31.3,0-62.6-0.1-94,0c-8.6,0-14.9,6.1-15.5,14.6
                  c0,0.6-0.1,1.3-0.1,1.9c0,44.3,0,88.5,0,132.8c0,5.5,1.7,10,6.1,13.4c2.9,2.3,6.4,3.2,10,3.2c8.3,0,81.5,0.1,89.8,0.1
                  c3.6,0,6.4,2,7.4,5.3c1,3,0.1,6.5-2.5,8.2c-1.5,1-3.4,1.7-5.1,1.7c-8.5,0.2-81.9,0-90.4,0C27,199.8,13,186,13.1,168
                  c0.2-25.4,0.1-50.8,0.1-76.3c0-19,0-37.9,0-56.9c0-12.1,5-21.4,15.4-27.5c3.2-1.9,7-2.6,10.6-3.8c0.5-0.2,1-0.3,1.5-0.4h101.1
                  c0.9,0.2,1.7,0.4,2.6,0.6c14.8,3,24.7,15.3,24.8,30.8C169.3,49.7,169.2,64.9,169.2,80.2z M130.2,49.2c-13,0-26,0-39,0H81
                  c-9.7,0-19.3,0-29,0c-4.9,0-8.4,3.6-8,8.3c0.3,4.3,3.6,7.1,8.5,7.1c25.8,0,51.6,0,77.4,0c0.5,0,1,0,1.5,0c3.7-0.3,6.6-3.2,6.9-6.8
                  C138.8,52.8,135.3,49.2,130.2,49.2z M130,79.9c-25.9,0-51.7,0-77.6,0c-0.5,0-1,0-1.5,0.1c-3.6,0.4-6.4,3-6.8,6.5
                  c-0.6,4.9,2.8,8.8,8,8.8c13,0,26,0,39,0h15.2c8.1,0,16.1,0,24.2,0c4.7,0,8-3.4,8-7.8C138.3,83,134.9,79.9,130,79.9z M120.5,141.4
                  c-25.9,0-42.2,0-68.1,0c-0.5,0-1,0-1.5,0.1c-3.6,0.4-6.4,3-6.8,6.5c-0.6,4.9,2.8,8.8,8,8.8c13,0,26,0,39,0h15.2c8.1,0,6.6,0,14.7,0
                  c4.7,0,8-3.4,8-7.8C128.8,144.5,125.4,141.4,120.5,141.4z M99.4,110.7c-7.9-0.1-15.9,0-23.8,0s-15.7,0-23.6,0
                  c-4.2,0-7.4,2.6-7.9,6.3c-0.8,4.9,2.7,9,7.8,9c7.9,0.1,15.9,0,23.8,0s15.7,0,23.6,0c4.2,0,7.4-2.6,7.9-6.3
                  C107.9,114.7,104.5,110.7,99.4,110.7z M179,148.1c-1.9-5.3-4.5-9.5-7.8-12.8c-0.4-0.4-0.6-0.8-0.6-1.5c-0.3-3.6-0.6-7.3-0.9-10.9
                  c-0.1-0.6,0-1,0.3-1.3c2.8-3.7,4.4-8.4,4.6-14.1c0.1-2.2-0.4-3.7-1.5-5c-1.5-1.7-3.2-2.4-5-3c-4.1-1.3-8.2-1.3-12.3-0.2
                  c-1.9,0.5-3.7,1.2-5.4,2.8c-1.1,1-1.9,2.4-1.9,4.5c0,1.6,0.2,3.2,0.4,4.8c0.7,4.1,2.1,7.5,4.2,10.2c0.3,0.4,0.4,0.7,0.3,1.3
                  c-0.3,3.6-0.6,7.3-0.9,10.9c-0.1,0.7-0.2,1.1-0.6,1.5c-3.3,3.3-5.9,7.5-7.8,12.8c-1.8,4.9-0.6,11.4,2.5,13.7c2.7,2,5.6,3.1,8.6,3.7
                  c1.3,0.3,2.6,0.4,3.9,0.6c0,0.8,0.1,1.5,0.1,2.2c0.3,7.7,0.6,15.4,0.9,23.1c0,1.2,0.3,2.1,1,2.7h0.7c0.7-0.6,0.9-1.6,1-2.8
                  c0.3-7.4,0.6-14.8,0.9-22.2c0-1,0.1-2,0.1-2.9c0.6-0.1,1.1-0.2,1.6-0.2c3.6-0.4,7-1.6,10.3-3.7C179.5,160,180.9,153.1,179,148.1z'
                  />
                </svg>
              </div>
              <p className='text'>No any note pinned</p>
            </div>
          )}
        </>
      </ModalBody>
    </Modal>
  );
};

export default PinnedNotesModal;
