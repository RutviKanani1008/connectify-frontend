import { useState } from 'react';
import _ from 'lodash';
import { selectThemeColors } from '@utils';
import Select from 'react-select';
const CustomSelect = ({
  options = [],
  onChange,
  label,
  value,
  defaultValue,
  classNamePrefix,
  isClearable = false,
  isMulti = false,
  isDisabled = false,
  width = 200,
  defaultMenuIsOpen = false,
  loading = false,
  menuIsOpen = false,
  customStylesOptions = {},
  menuPlacement = false,
  menuPosition = false,
}) => {
  const [focus, setFocus] = useState(false);
  const [hasValue, setHashValue] = useState(false);
  const handleChange = (e) => {
    if (!e) {
      setFocus(false);
    }
    setHashValue(e);
    if (typeof onChange === 'function') {
      onChange(e);
    }
  };

  const customStyles = {
    control: (css) => ({
      ...css,
      width,
    }),
    ...customStylesOptions,
  };

  const isValueExist = () => {
    if (_.isArray(value)) {
      if (value.length) {
        return true;
      }
    } else if (value) {
      return true;
    }
    return false;
  };

  return (
    <div className='custom_select_wrapper'>
      <Select
        {...(menuPlacement && { menuPlacement })}
        {...(menuPosition && { menuPosition })}
        {...(menuIsOpen && { menuIsOpen })}
        isLoading={loading}
        {...(width && { styles: customStyles })}
        defaultMenuIsOpen={defaultMenuIsOpen}
        className={`${focus || hasValue || isValueExist() ? 'fcw_value' : ''}`}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        id={'custom_select_box_id'}
        theme={selectThemeColors}
        placeholder={`${focus || isValueExist() ? '' : label}`}
        classNamePrefix={`select ${
          isMulti &&
          ((focus && ((hasValue && hasValue?.length > 0) || isValueExist())) ||
            (hasValue && hasValue?.length > 0) ||
            isValueExist())
            ? ''
            : // ? 'c-pt'
              ''
        } ${classNamePrefix ? classNamePrefix : ''}`}
        // classNamePrefix={`select ${
        //   isMulti &&
        //   ((focus &&
        //     ((hasValue && hasValue?.length > 0) ||
        //       (value && value.length > 0))) ||
        //     (hasValue && hasValue?.length > 0) ||
        //     (value && value.length > 0))
        //     ? 'c-pt'
        //     : ''
        // } ${classNamePrefix ? classNamePrefix : ''}`}
        options={options}
        defaultValue={defaultValue}
        value={value}
        isClearable={isClearable}
        onChange={handleChange}
        isMulti={isMulti}
        isOptionSelected={(option, selectValue) =>
          selectValue.some((i) => i === option)
        }
        isDisabled={isDisabled}
      />

      <label
        className={`cs_form_label ${
          focus || hasValue || isValueExist() ? '' : 'focus-out'
        }`}
      >
        {label}
      </label>
    </div>
  );
};

export default CustomSelect;
