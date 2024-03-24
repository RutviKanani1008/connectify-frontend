import { Col, Label, Row } from 'reactstrap';
import { FormField } from '../../@core/components/form-fields';
import { AVAILABLE_FONT_STYLE } from '../../constant';
import { useWatch } from 'react-hook-form';
import Select from 'react-select';
import { selectThemeColors } from '../../utility/Utils';
import {
  FontOptionComponent,
  FontSingleValue,
} from './component/OptionComponent';

export const FormDesignFields = (props) => {
  const { errors, control, getValues, setValue } = props;

  const designField = useWatch({
    control,
    name: 'designField',
  });
  return (
    <>
      <div className='body-wrapper'>
        <Row className='form-design-field-row fancy-scrollbar'>
          <Col className='form-design-field-col' md={2}>
            <Label>Page Background Color</Label>
            <div className='color-picker-with-code'>
              <FormField
                name='designField.pageBackgroundColor'
                type='color'
                errors={errors}
                control={control}
              />
              {/* <div className='code-text'>
              {getValues('designField.pageBackgroundColor')}
            </div> */}
            </div>
          </Col>
          <Col className='form-design-field-col' md={2}>
            <Label>Font Color</Label>
            <div className='color-picker-with-code'>
              <FormField
                name='designField.fontColor'
                type='color'
                errors={errors}
                control={control}
              />
              {/* <div className='code-text'>
              {getValues('designField.fontColor')}
            </div> */}
            </div>
          </Col>
          <Col className='form-design-field-col' md={2}>
            <Label>Submit Button Color</Label>
            <div className='color-picker-with-code'>
              <FormField
                name='designField.submitButtonColor'
                type='color'
                errors={errors}
                control={control}
              />
              {/* <div className='code-text'>
              {getValues('designField.submitButtonColor')}
            </div> */}
            </div>
          </Col>
          <Col className='form-design-field-col' md={2}>
            <Label>Submit Button Text Color</Label>
            <div className='color-picker-with-code'>
              <FormField
                name='designField.submitButtonFontColor'
                type='color'
                errors={errors}
                control={control}
              />
              {/* <div className='code-text'>
              {getValues('designField.submitButtonFontColor')}
            </div> */}
            </div>
          </Col>
          <Col className='form-design-field-col' md={1}>
            <Label>Font Size</Label>
            <FormField
              name='designField.fontSize'
              type='number'
              errors={errors}
              value={getValues('designField.fontSize')}
              control={control}
              onChange={(e) => {
                const { value } = e.target;
                if (Number(value) < 0 || !value) {
                  setValue('designField.fontSize', 0);
                }
              }}
              min={0}
              helperText='px'
            />
          </Col>
          <Col className='form-design-field-col' md={1}>
            <Label>Field Border Radius</Label>
            <FormField
              name='designField.fieldBorderRadius'
              type='number'
              errors={errors}
              control={control}
              min={0}
              value={getValues('designField.fieldBorderRadius')}
              onChange={(e) => {
                const { value } = e.target;
                if (Number(value) < 0 || !value) {
                  setValue('designField.fieldBorderRadius', 0);
                }
              }}
              helperText='px'
            />
          </Col>
          <Col className='form-design-field-col' md={1}>
            <Label>Question Spacing</Label>
            <FormField
              name='designField.questionSpacing'
              type='number'
              errors={errors}
              control={control}
              min={0}
              value={getValues('designField.questionSpacing')}
              onChange={(e) => {
                const { value } = e.target;
                if (Number(value) < 0 || !value) {
                  setValue('designField.questionSpacing', 0);
                }
              }}
              helperText='px'
            />
          </Col>
          <Col className='form-design-field-col' md={1}>
            <Label>Form Width</Label>
            <FormField
              name='designField.formWidth'
              type='number'
              errors={errors}
              control={control}
              min={200}
              helperText='px'
              value={getValues('designField.formWidth')}
              onChange={(e) => {
                const { value } = e.target;
                if (Number(value) < 200 || !value) {
                  setValue('designField.formWidth', 200);
                }
              }}
            />
          </Col>
          <Col className='form-design-field-col form-design-field-full' md={2}>
            <Label>Font Family</Label>
            <Select
              menuPosition={'absolute'}
              menuPlacement={'top'}
              key={designField?.fontFamily}
              styles={{
                singleValue: (base) => ({
                  ...base,
                  display: 'flex',
                  alignItems: 'center',
                }),
              }}
              id='fontFamily'
              name='fontFamily'
              value={getValues('designField.fontFamily')}
              options={AVAILABLE_FONT_STYLE}
              theme={selectThemeColors}
              className={`react-select ${
                errors?.['status']?.message ? 'is-invalid' : ''
              }`}
              classNamePrefix='custom-select'
              onChange={(data) => {
                setValue('designField.fontFamily', data);
              }}
              components={{
                Option: FontOptionComponent,
                SingleValue: FontSingleValue,
              }}
            />
          </Col>
          <Col className='form-design-field-col form-design-field-full' md={1}>
            <Label>Page Background Opacity</Label>
            <div className='range-slider-wrapper'>
              <FormField
                name='designField.pageOpacity'
                type='range'
                errors={errors}
                control={control}
                defaultValue={100}
                min={0}
                max={100}
                value={getValues('designField.pageOpacity') ?? 100}
              />
              <span className='value'>
                {getValues('designField.pageOpacity') ?? 100}
              </span>
            </div>
          </Col>
          <Col className='form-design-field-col form-design-field-full' md={1}>
            <Label>Submit Button Width</Label>
            <div className='range-slider-wrapper'>
              <FormField
                name='designField.submitButtonWidth'
                type='range'
                errors={errors}
                control={control}
                defaultValue={20}
                min={20}
                max={100}
                value={getValues('designField.submitButtonWidth') ?? 20}
              />
              <span className='value'>
                {getValues('designField.submitButtonWidth') ?? 20}
              </span>
            </div>
          </Col>
        </Row>
      </div>
    </>
  );
};
