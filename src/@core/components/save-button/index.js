import { useSelector } from 'react-redux';
import { Button, Spinner } from 'reactstrap';

// use block to have full width button
export const SaveButton = ({
  id = '',
  className = '',
  name = 'Save',
  width = '85px',
  block,
  outline,
  type = 'button',
  color = 'primary',
  loading,
  disabled = false,
  ...otherProps
}) => {
  const { processing } = useSelector((state) => state.common);
  const getState = () => {
    if (loading !== undefined) {
      return loading;
    } else {
      return processing;
    }
  };
  return (
    <>
      <Button
        {...(id && { id })}
        type={type}
        style={{ width }}
        className={className}
        color={color}
        block={block}
        outline={outline}
        disabled={getState() || disabled}
        {...otherProps}
      >
        {getState() ? (
          <Spinner size='sm' />
        ) : (
          <span className={getState() ? 'ms-50' : ''}>
            {getState() ? '' : name}
          </span>
        )}
      </Button>
    </>
  );
};
