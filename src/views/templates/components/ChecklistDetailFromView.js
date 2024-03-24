import { Accordion, AccordionBody, AccordionItem, Label } from 'reactstrap';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'react-feather';

const ChecklistDetailFromFieldsView = (props) => {
  const { currentChecklistDetails } = props;

  const [open, setOpen] = useState(false);

  const toggle = (id) => {
    if (open === id) {
      setOpen();
    } else {
      setOpen(id);
    }
  };

  return (
    <>
      {currentChecklistDetails?.checklist
        ?.sort(({ sort: a, sort: b }) => a - b)
        ?.map((field, index) => (
          <div
            key={index}
            className='d-flex file__card checklist__list__wrapper view__checklist'
          >
            <Accordion
              className='accordion-margin'
              open={open}
              toggle={() => {
                toggle(`${index}`);
              }}
            >
              <AccordionItem className='checklist-box'>
                <div className='checklist-header'>
                  <div className='left-wrapper'>
                    <div
                      className={`title-field-wrapper ${
                        open === String(index)
                          ? 'checklist-show-full-title'
                          : ''
                      }`}
                      // className={'title-field-wrapper'}
                      style={{
                        ...(open === String(index) && { whiteSpace: 'unset' }),
                      }}
                    >
                      {field?.title || '-'}{' '}
                    </div>
                  </div>
                  <div className='action-btn-wrapper'>
                    {field?.details !== '' ? (
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
                  </div>
                </div>
                <AccordionBody accordionId={`${index}`}>
                  <div className='contact-note' key={`${index}_editor`}>
                    {field?.details ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: field?.details,
                        }}
                      ></div>
                    ) : (
                      <div className='text-center'>
                        <Label>No Details Available</Label>
                      </div>
                    )}
                  </div>
                </AccordionBody>
              </AccordionItem>
            </Accordion>
          </div>
        ))}
    </>
  );
};

export default ChecklistDetailFromFieldsView;
