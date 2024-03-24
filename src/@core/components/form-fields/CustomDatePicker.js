import { useEffect, useRef, useState } from 'react';
import { Label } from 'reactstrap';
import Flatpickr from 'react-flatpickr';
import moment from 'moment';

export const getDateStringFromDuration = (
  duration,
  format = 'MM/DD/YYYY hh:mm A'
) => {
  return moment(moment.duration(Number(duration)).asMilliseconds())
    .format(format)
    .toString();
};

const CustomDatePicker = ({
  errors,
  name,
  value,
  onChange,
  label = false,
  options = {},
  disabled = false,
  enableTime = true,
  dateFormat = 'Y-m-d h:i K',
  className = 'form-control',
  renderInBody = false,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const flatPickrRef = useRef();

  const renderBodyOptions = {
    static: false,
    appendTo: document.body,
  };

  const flatPickrOptions = {
    static: true,
    time_24hr: false,
    enableTime,
    dateFormat,
    ...options,
    ...(renderInBody && renderBodyOptions),
  };

  let tempError = { ...errors };
  name.split('.').map((obj) => {
    if (tempError) {
      tempError = tempError[obj];
    }
  });

  const appendFlatpickrToScroll = (fp, scrollParent) => {
    function findScrollParent(candidate) {
      const calcStyle = window.getComputedStyle(candidate);

      if (
        calcStyle['overflowY'] === 'auto' ||
        calcStyle['overflowY'] === 'scroll'
      ) {
        scrollParent = candidate;
        return;
      }

      candidate.parentElement && findScrollParent(candidate.parentElement);
    }

    !scrollParent && findScrollParent(fp._positionElement.parentElement);

    fp.config.onOpen.push(() => {
      scrollParent.addEventListener('scroll', scrollEvent, {
        passive: true,
      });
    });

    fp.config.onClose.push(() => {
      scrollParent.removeEventListener('scroll', scrollEvent);
      setIsOpen(false);
    });

    const scrollEvent = () => fp._positionCalendar();
  };

  useEffect(() => {
    if (flatPickrRef.current && renderInBody) {
      appendFlatpickrToScroll(flatPickrRef.current.flatpickr);
    }
  }, []);

  useEffect(() => {
    if (flatPickrRef.current && defaultOpen) {
      flatPickrRef.current?.flatpickr?.open();
    }
  }, []);

  return (
    <>
      {label && (
        <Label className='form-label' for='startDate'>
          {label}
        </Label>
      )}
      <div
        className='date-picker-error-wp'
        onClick={() => {
          setIsOpen((isOpen) => !isOpen);
          if (isOpen) {
            /* For close input click  */
            flatPickrRef.current?.flatpickr?.close();
          }
        }}
      >
        <Flatpickr
          ref={flatPickrRef}
          disabled={disabled}
          required
          id={name.toLowerCase()}
          name={name}
          className={className}
          onChange={onChange}
          value={value}
          options={flatPickrOptions}
          placeholder='Select Date'
        />
        {tempError && <span className='text-danger'>{tempError.message}</span>}
      </div>
    </>
  );
};

export default CustomDatePicker;
