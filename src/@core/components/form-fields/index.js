import React from 'react';
import { Controller } from 'react-hook-form';
import {
  FormFeedback,
  Input,
  InputGroup,
  InputGroupText,
  Label,
} from 'reactstrap';
import InputPasswordToggle from '../input-password-toggle';
import Select from 'react-select';
import Flatpickr from 'react-flatpickr';
import { selectThemeColors } from '@utils';
import classnames from 'classnames';
import PhoneInput from 'react-phone-input-2';
import CreatableSelect from 'react-select/creatable';

// ** Styles
import '@styles/react/libs/react-select/_react-select.scss';
import 'react-phone-input-2/lib/style.css';

export const FormField = React.forwardRef((props, ref) => {
  const {
    name,
    label,
    placeholder,
    type = 'text',
    defaultValue = '',
    errors = {},
    control,
    options = [],
    infoElement = '', // will be rendered at top right corner
    onChange,
    disabled = false,
    isMulti = false,
    accept = 'image/*',
    onBlur,
    // bodyContent = false,
    isClearable = false,
    minimumDate = false,
    maximumDate = false,
    enableTime = false,
    dateFormat = 'Y-m-d H:i',
    defaultMenuIsOpen = false,
    loading = false,
    menuPosition = 'fixed',
    menuPlacement = 'auto',
    errorStyle = {},
    helperText = false,
    ...otherFieldProps
  } = props;

  const id = name.toLowerCase();
  const handleChange = (e) => {
    if (typeof onChange === 'function') {
      onChange(e);
    }
  };
  // errors all child
  let tempError = { ...errors };
  name.split('.').map((obj) => {
    if (tempError) {
      tempError = tempError[obj];
    }
  });

  const renderField = (field) => {
    //----------------CHANGE---------------
    field.value = field?.value ? field?.value : '';
    switch (type) {
      case '':
        return <></>;
      case 'password':
        return (
          <InputPasswordToggle
            ref={ref}
            className='input-group-merge'
            id={id}
            {...field}
            placeholder={placeholder}
            invalid={tempError && true}
            autoComplete='off'
            disabled={disabled}
          />
        );
      case 'select':
        return (
          <Select
            isLoading={loading}
            menuPosition={menuPosition}
            menuPlacement={menuPlacement}
            defaultMenuIsOpen={defaultMenuIsOpen}
            ref={ref}
            {...field}
            id={id}
            theme={selectThemeColors}
            className={classnames('react-select', {
              'is-invalid': tempError && true,
            })}
            placeholder={placeholder}
            classNamePrefix='custom-select'
            options={options}
            isClearable={isClearable}
            onChange={(e) => {
              // const data = { target: { name: field.name, value: e } };
              // field.onChange(data);
              field.onChange(e);
              handleChange(e);
            }}
            isMulti={isMulti}
            {...otherFieldProps}
            // -----------------------
            // isOptionSelected={(option, selectValue) =>
            //   selectValue.some((i) => i === option)
            // }
            // -----------------------
            isDisabled={disabled}
          />
        );
      case 'creatableselect':
        return (
          <CreatableSelect
            isLoading={loading}
            ref={ref}
            {...field}
            id={id}
            theme={selectThemeColors}
            className={classnames('react-select', {
              'is-invalid': tempError && true,
            })}
            placeholder={placeholder}
            classNamePrefix='custom-select'
            options={options}
            isClearable={isClearable}
            onChange={(e) => {
              // const data = { target: { name: field.name, value: e } };
              field.onChange(e);
              handleChange(e);
            }}
            isMulti={isMulti}
            {...otherFieldProps}
            // -------------------------
            // isOptionSelected={(option, selectValue) => {
            //   return selectValue.some((i) => i === option);
            // }}
            // ------------------------
            isDisabled={disabled}
          />
        );
      case 'date':
        return (
          <Flatpickr
            ref={ref}
            id={id}
            {...field}
            className={classnames('form-control flatpickr-input', {
              'is-invalid': tempError && true,
            })}
            placeholder={placeholder}
            options={{
              enableTime,
              dateFormat,
              minDate: minimumDate,
              maxDate: maximumDate,
              static: true,
            }}
            onChange={(e) => {
              // const data = { target: { name: field.name, value: e } };
              field.onChange(e);
              handleChange(e);
            }}
            invalid={tempError && true}
            disabled={disabled}
          />
        );
      case 'phone':
        return (
          <PhoneInput
            ref={ref}
            inputProps={{ name }}
            containerClass={classnames({
              'is-invalid': tempError && true,
            })}
            inputClass={classnames('w-100', {
              'is-invalid': tempError && true,
            })}
            buttonClass={classnames({
              'is-invalid': tempError && true,
            })}
            type='text'
            label='Phone'
            onlyCountries={['us']}
            country={'us'}
            {...field}
            countryCodeEditable={false}
            disabled={disabled}
          />
        );
      case 'file':
        return (
          <Input
            ref={ref}
            id={id}
            {...field}
            onChange={(e) => {
              field.onChange(e);
              handleChange(e);
            }}
            type={type}
            invalid={tempError && true}
            accept={accept}
            disabled={disabled}
          />
        );

      case 'range':
        return (
          <Input
            ref={ref}
            id={id}
            {...field}
            onChange={(e) => {
              field.onChange(e);
              handleChange(e);
            }}
            type={type}
            invalid={tempError && true}
            accept={accept}
            disabled={disabled}
            {...otherFieldProps}
          />
        );
      case 'radio':
        return (
          <div className='radio-btn-wrapper d-flex flex-inline'>
            {options.map(({ label, value }, index) => (
              <div className='form-check radio-btn-repeater me-2' key={index}>
                <Input
                  ref={ref}
                  key={value}
                  type='radio'
                  id={`${name + label}`}
                  {...field}
                  value={value || ''}
                  onChange={(e) => {
                    field.onChange(e);
                    handleChange(e);
                  }}
                  disabled={disabled}
                  defaultChecked={value === defaultValue}
                />
                <Label className='form-check-label' for={`${name + label}`}>
                  {label}
                </Label>
              </div>
            ))}
          </div>
        );
      case 'switch':
        return (
          <Input
            ref={ref}
            id={id}
            type={type}
            checked={field.value}
            // defaultChecked={defaultValue}
            {...field}
            disabled={disabled}
            inline='true'
            onChange={(e) => {
              field.onChange(e);
              handleChange(e);
            }}
          />
        );
      // UNUSED CASE
      // case 'texteditor':
      //   return (
      //     <div>
      //       <Editor
      //         ref={ref}
      //         id={id}
      //         {...field}
      //         editorStyle={{ border: '2px solid', height: '100px' }}
      //         defaultContentState={bodyContent}
      //         onChange={(e) => {
      //           field.onChange(e);
      //           handleChange(e);
      //         }}
      //       />
      //     </div>
      //   );
      case 'checkbox':
        return (
          <>
            <Input
              ref={ref}
              id={id}
              {...field}
              type={type}
              defaultChecked={defaultValue}
              placeholder={placeholder}
              invalid={tempError && true}
              disabled={disabled}
              onChange={(e) => {
                field.onChange(e);
                handleChange(e);
              }}
              onBlur={(e) => {
                if (onBlur) {
                  onBlur(e);
                }
                field.onBlur(e);
              }}
            />
          </>
        );
      case 'color':
        return (
          <Input
            ref={ref}
            id={id}
            type='color'
            {...field}
            {...otherFieldProps}
          />
        );
      case 'textarea': {
        const { className = '', ...rest } = otherFieldProps;

        return (
          <Input
            ref={ref}
            id={id}
            type='textarea'
            {...field}
            className={`${className} ${classnames('form-control', {
              'is-invalid': tempError && true,
            })}`}
            placeholder={placeholder}
            disabled={disabled}
            onChange={(e) => {
              field.onChange(e);
              handleChange(e);
            }}
            onBlur={(e) => {
              if (onBlur) {
                onBlur(e);
              }
              field.onBlur(e);
            }}
            {...rest}
          />
        );
      }
      default:
        // text, number, email
        return (
          // <Input
          <input
            ref={ref}
            id={id}
            {...field}
            type={type}
            className={`form-control ${tempError ? 'is-invalid' : ''}`}
            placeholder={placeholder}
            // invalid={tempError && true}
            disabled={disabled}
            onChange={(e) => {
              field.onChange(e);
              handleChange(e);
            }}
            onBlur={(e) => {
              if (onBlur) {
                onBlur(e);
              }
              field.onBlur(e);
            }}
            {...otherFieldProps}
          />
        );
    }
  };

  return (
    <>
      {label &&
        (infoElement ? (
          <div className='d-flex justify-content-between'>
            <Label className='form-label max-w-90' for={name.toLowerCase()}>
              {label}
            </Label>
            {infoElement}
          </div>
        ) : (
          <Label className='form-label' for={id}>
            {label}
          </Label>
        ))}

      <Controller
        id={id}
        name={name}
        defaultValue={defaultValue || ''}
        control={control}
        render={({ field }) => {
          return (
            <>
              {helperText ? (
                <InputGroup>
                  {renderField(field)}
                  <InputGroupText className='input-helper-text'>
                    {helperText}
                  </InputGroupText>
                </InputGroup>
              ) : (
                renderField(field)
              )}
            </>
          );
        }}
      />
      {tempError && (
        <FormFeedback style={{ ...errorStyle }}>
          {tempError.message}
        </FormFeedback>
      )}
    </>
  );
});
FormField.displayName = 'FormField';
