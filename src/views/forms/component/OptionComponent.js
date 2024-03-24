/* eslint-disable no-unused-vars */
import { components } from 'react-select';
import AvatarGroup from '@components/avatar-group';
import Avatar from '@components/avatar';
import defaultAvatar from '@src/assets/images/avatars/avatar-blank.png';
import { Check, ChevronDown, Edit2, PlusCircle, Trash } from 'react-feather';
import { Label } from 'reactstrap';
const { MenuList, Option } = components;
const avatarGroupData1 = [
  {
    title: 'Lilian',
    img: defaultAvatar,
    imgHeight: 26,
    imgWidth: 26,
  },
  {
    title: 'Alberto',
    img: defaultAvatar,
    imgHeight: 26,
    imgWidth: 26,
  },
  {
    title: 'Bruce',
    img: defaultAvatar,
    imgHeight: 26,
    imgWidth: 26,
  },
  {
    title: 'Bruce',
    img: defaultAvatar,
    imgHeight: 26,
    imgWidth: 26,
  },
  {
    title: 'Bruce',
    img: defaultAvatar,
    imgHeight: 26,
    imgWidth: 26,
  },
];

// ** Custom select components
export const OptionComponent = ({ data, ...props }) => {
  return (
    <components.Option {...props}>
      <span
        className={`bullet bullet-${data.color} bullet-sm me-50`}
        style={{ backgroundColor: data.color }}
      ></span>
      {data?.value === 'add_naw' ? (
        <>
          <PlusCircle className='text-primary me-1 ' />
          {data.label}
        </>
      ) : (
        <span className='label'>{data.label}</span>
      )}
    </components.Option>
  );
};

export const LabelOptionComponent = ({ data, ...props }) => {
  return (
    <>
      <components.Option
        {...props}
        className='w-100 d-flex justify-content-between'
      >
        <div className='w-100 d-flex justify-content-between'>
          <span
            className={`bullet bullet-${data.color} bullet-sm me-50`}
            style={{ backgroundColor: data.color }}
          ></span>
          <span className='label'>{data.label}</span>
        </div>
        {!data?.__isNew__ && (
          <div>
            <Edit2
              size={12}
              className='cursor-pointer'
              onClick={(e) => {
                e.stopPropagation();
                props.selectProps?.handleTaskOptionEdit(data);
              }}
            />
            <Trash
              size={15}
              className='ms-1 cursor-pointer'
              color='red'
              onClick={(e) => {
                e.stopPropagation();
                props.selectProps?.handleDeleteTaskOption(data);
              }}
            />
          </div>
        )}
      </components.Option>
    </>
  );
};

export const MultiValue = ({ data, ...props }) => {
  return (
    <components.MultiValue {...props}>
      <div className='w-100 d-flex justify-content-between'>
        <span
          className={`bullet bullet-${data.color} bullet-sm me-50`}
          style={{ backgroundColor: data.color }}
        ></span>
        <span className='custom___select__label'>{data.label}</span>
        {!data?.__isNew__ && (
          <div className='ms-1'>
            <Edit2
              size={8}
              className='cursor-pointer'
              onClick={(e) => {
                e.stopPropagation();
                props.selectProps?.handleTaskOptionEdit(data);
              }}
            />
            <Trash
              size={15}
              className='ms-1 cursor-pointer'
              color='red'
              onClick={(e) => {
                e.stopPropagation();
                props.selectProps?.handleDeleteTaskOption(data);
              }}
            />
          </div>
        )}
      </div>
    </components.MultiValue>
  );
};

export const SingleValue = ({ data, ...props }) => {
  return (
    <components.SingleValue {...props}>
      <span
        className={`bullet bullet-${data.color} bullet-sm me-50`}
        style={{ backgroundColor: data.color }}
      ></span>
      {data.value !== 'add_naw' && (
        <span className='custom___select__label'>{data.label}</span>
      )}
    </components.SingleValue>
  );
};

export const PriorityStatusCategorySingleValue = ({ data, ...props }) => {
  return (
    <components.SingleValue {...props}>
      <div className='badgeLoyal-wrapper'>
        <span
          className='dot'
          style={{
            border: `1px solid ${data.color}`,
            backgroundImage: `linear-gradient(to right, rgba(0,0,0,0) 50%, ${data?.color} 50%)`,
          }}
        ></span>
        <span className='name' style={{ color: data?.color }}>
          {data?.label}
        </span>
        <span
          className='bg-wrapper'
          style={{ backgroundColor: data?.color }}
        ></span>
        <span
          className='border-wrapper'
          style={{ border: `1px solid ${data?.color}` }}
        ></span>
        <div className='down-arrow-btn'>
          <ChevronDown color={data?.color} />
        </div>
      </div>
    </components.SingleValue>
  );
};

export const AssignedToSingleValue = ({ data, ...props }) => {
  return (
    <components.SingleValue {...props}>
      <div
        className='avatar pull-up'
        style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        onClick={(e) => {
          e.stopPropagation();
          props.removeProps.onClick();
        }}
      >
        {data?.profile &&
        data?.profile !== false &&
        data?.profile !== null &&
        data?.profile !== 'false' &&
        data?.profile !== undefined ? (
          <>
            <Avatar
              img={`${process.env.REACT_APP_S3_BUCKET_BASE_URL}${data?.profile}`}
              imgHeight='32'
              imgWidth='32'
              content={data?.label}
              initials
            />
          </>
        ) : data?.label && data.label !== '' ? (
          <>
            <Avatar color={'light-primary'} content={data?.label} initials />
          </>
        ) : (
          <>
            <Avatar img={defaultAvatar} imgHeight='32' imgWidth='32' />
          </>
        )}
      </div>
    </components.SingleValue>
  );
};
export const CustomMenuList = ({ children, ...props }) => {
  const selectedValues = props.getValue();
  return (
    <MenuList {...props}>
      {selectedValues.map((data) => (
        <components.Option
          key={data.value}
          {...data}
          innerProps={{
            ...props.innerProps,
            onMouseDown: (e) => {
              e.preventDefault();
              props.selectOption(data);
            },
          }}
          isSelected={selectedValues.includes(data.value)}
          {...props}
          className='d-flex justify-content-between'
        >
          <div className='d-flex align-items-center'>
            {data?.profile &&
            data?.profile !== false &&
            data?.profile !== null &&
            data?.profile !== undefined ? (
              <>
                <Avatar
                  img={`${process.env.REACT_APP_S3_BUCKET_BASE_URL}${data?.profile}`}
                  imgHeight='32'
                  imgWidth='32'
                  content={data?.label}
                  initials
                />
              </>
            ) : data?.label && data.label !== '' ? (
              <>
                <Avatar
                  color={'light-primary'}
                  content={data?.label}
                  initials
                />
              </>
            ) : (
              <>
                <Avatar img={defaultAvatar} imgHeight='32' imgWidth='32' />
              </>
            )}
            <div className='ms-1'>
              <span>{data.label}</span>
              {data.companyName && <div>{data.companyName}</div>}
            </div>
          </div>
          <Check className='text-success' color='#a3db59' />
        </components.Option>
      ))}
      {children}
    </MenuList>
  );
};

export const pageGroupOptions = ({ data, ...props }) => {
  return (
    <div>
      <components.Group {...props} />
    </div>
  );
};

export const pageGroupComponent = ({ data, ...props }) => {
  return (
    <div>
      <components.GroupHeading {...props}>
        <Label>{data?.label}</Label>
      </components.GroupHeading>
    </div>
  );
};

export const contactOptionComponent = ({ data, ...props }) => {
  return (
    <components.Option {...props}>
      <div className='d-flex align-items-center'>
        {data?.profile &&
        data?.profile !== false &&
        data?.profile !== null &&
        data?.profile !== undefined ? (
          <>
            <Avatar
              img={`${process.env.REACT_APP_S3_BUCKET_BASE_URL}${data?.profile}`}
              content={data?.label}
              imgHeight='32'
              imgWidth='32'
              initials
            />
          </>
        ) : data?.label && data.label !== '' ? (
          <>
            <Avatar color={'light-primary'} content={data?.label} initials />
          </>
        ) : (
          <>
            <Avatar img={defaultAvatar} imgHeight='32' imgWidth='32' />
          </>
        )}
        <div className='ms-1'>
          <span>{data.label}</span>
          {data.companyName && <div>{data.companyName}</div>}
        </div>
      </div>
    </components.Option>
  );
};

export const parentTaskOptionComponent = ({ data, ...props }) => {
  return (
    <components.Option {...props}>
      <div className='d-flex align-items-center inner-wrapper'>
        <span className='task-number'>#{data?.taskNumber}</span>
        <div className='task-name ms-1'>
          <span>{data.label}</span>
        </div>
      </div>
    </components.Option>
  );
};

export const contactSingleValue = ({ data, ...props }) => {
  return (
    <components.SingleValue {...props}>
      <div className='avatar bg-light-primary'>
        {data?.profile &&
        data?.profile !== false &&
        data?.profile !== null &&
        data?.profile !== undefined ? (
          <>
            <Avatar
              img={`${process.env.REACT_APP_S3_BUCKET_BASE_URL}${data?.profile}`}
              imgHeight='32'
              imgWidth='32'
              content={data?.label}
              initials
            />
          </>
        ) : data?.label && data.label !== '' ? (
          <>
            <Avatar color={'light-primary'} content={data?.label} initials />
          </>
        ) : (
          <>
            <Avatar img={defaultAvatar} imgHeight='32' imgWidth='32' />
          </>
        )}
      </div>
      <span className='contact-name'>{data?.label}</span>
    </components.SingleValue>
  );
};

export const parentTaskOptionSingleValue = ({ data, ...props }) => {
  return (
    <components.SingleValue {...props}>
      <span className='custom___select__label'>
        #{data?.taskNumber} - {data.label}
      </span>
    </components.SingleValue>
  );
};

// export const TaskMangerAssigneeComponent = (props) => {
//   return (
//     <components.SelectContainer {...props}>
//       <AvatarGroup data={avatarGroupData1} />
//     </components.SelectContainer>
//   );
// };
export const TaskMangerAssigneeComponent = ({ data, ...props }) => {
  return (
    <components.MultiValue {...props}>
      <AvatarGroup data={avatarGroupData1} />
    </components.MultiValue>
  );
};

// export const MenuList = (props) => {
//   const { onClick, options } = props;

//   return options.map((data, index) => (
//     <div
//       className='d-flex align-items-center p-50'
//       key={index}
//       onClick={() => onClick(data)}
//     >
//       {data?.profile &&
//       data?.profile !== false &&
//       data?.profile !== null &&
//       data?.profile !== undefined ? (
//         <>
//           <Avatar
//             img={`${process.env.REACT_APP_S3_BUCKET_BASE_URL}${data?.profile}`}
//             imgHeight='32'
//             imgWidth='32'
//           />
//         </>
//       ) : data?.label && data.label !== '' ? (
//         <>
//           <Avatar color={'light-primary'} content={data?.label} initials />
//         </>
//       ) : (
//         <>
//           <Avatar img={defaultAvatar} imgHeight='32' imgWidth='32' />
//         </>
//       )}
//       <div className='ms-1'>
//         <span>{data.label}</span>
//         {data.companyName && <div>{data.companyName}</div>}
//       </div>
//     </div>
//   ));
// };

export const NoOptionsMessage = (props) => {
  return (
    <components.NoOptionsMessage {...props}>
      Please Select group first
    </components.NoOptionsMessage>
  );
};

export const FontOptionComponent = ({ data, ...props }) => {
  return (
    <components.Option {...props}>
      <span className='label' style={{ fontFamily: data?.value }}>
        {data.label}
      </span>
    </components.Option>
  );
};

export const FontSingleValue = ({ data, ...props }) => {
  return (
    <components.SingleValue {...props}>
      <span className='label' style={{ fontFamily: data?.value }}>
        {data.label}
      </span>
    </components.SingleValue>
  );
};
