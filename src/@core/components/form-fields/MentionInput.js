import { useState } from 'react';
import { MentionsInput, Mention } from 'react-mentions';
const MentionInput = ({
  defaultValue,
  setValue,
  mention,
  name,
  placeholder,
}) => {
  const [inputValue, setInputValue] = useState(
    defaultValue ? defaultValue : ''
  );
  return (
    <MentionsInput
      className='mention-wrapper'
      singleLine
      value={inputValue}
      onChange={(i, value) => {
        setInputValue(value);
        setValue(name, value);
      }}
      style={{
        control: {
          backgroundColor: '#fff',
          fontSize: 14,
          fontWeight: 'normal',
        },
        '&singleLine': {
          display: 'inline-block',
          width: '100%',

          highlighter: {
            padding: '7px',
            border: '1px solid transparent',
          },
          input: {
            padding: '7px',
            border: '1px solid #d8d6de',
            borderRadius: '0.357rem',
          },
        },

        suggestions: {
          list: {
            backgroundColor: 'white',
            border: '1px solid rgba(0,0,0,0.15)',
            fontSize: 14,
          },
          item: {
            padding: '5px 15px',
            borderBottom: '1px solid rgba(0,0,0,0.15)',
            '&focused': {
              backgroundColor: '#f0fbff',
            },
          },
        },
      }}
      placeholder={placeholder}
      a11ySuggestionsListLabel={'Suggested mentions'}
    >
      <Mention
        className='mentions__mention'
        displayTransform={(id, display) => `@${display}`}
        data={(search) => mention.filter((user) => user.id.includes(search))}
        style={{
          backgroundColor: '#f0fbff',
          color: '#1236ff',
        }}
      />
    </MentionsInput>
  );
};

export default MentionInput;
