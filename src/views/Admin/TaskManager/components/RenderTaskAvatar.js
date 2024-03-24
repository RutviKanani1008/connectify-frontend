/* eslint-disable no-unused-vars */
// ** Custom Components
import Avatar from '@components/avatar';
import { UncontrolledTooltip } from 'reactstrap';
import _ from 'lodash';

// ** Returns avatar color based on task tag
const resolveAvatarVariant = (priority) => {
  if (priority === 'high') return 'light-primary';
  if (priority === 'medium') return 'light-warning';
  if (priority === 'low') return 'light-success';
  return 'light-primary';
};

import defaultAvatar from '@src/assets/images/avatars/avatar-blank.png';
import { Link } from 'react-router-dom';
import { userData } from '../../../../redux/user';
import { useSelector } from 'react-redux';
import { useMemo } from 'react';

const RenderTaskAvatar = ({ obj, userKey, additialTooltipText = '' }) => {
  const user = useSelector(userData);

  const item = _.isArray(obj?.[userKey]) ? obj?.[userKey]?.[0] : obj?.[userKey];
  let userName = '';
  if (item) {
    userName =
      item.firstName || item.lastName
        ? `${item.firstName} ${item.lastName}`
        : item.email;
  }

  const getUrlRedirect = useMemo(() => {
    if (obj?.contact?._id && userKey === 'contact') {
      if (user.role === 'admin') {
        return `/admin/contact/${obj?.contact?._id}`;
      } else if (user.role === 'grandadmin') {
        return `/grandadmin/contact/${obj._id}`;
      } else if (user.role === 'superadmin') {
        return `/contact/${obj._id}`;
      }
    }
  }, [user, obj, userKey]);

  // const getUrlRedirect = () => {
  //   if (obj?.contact?._id && userKey === 'contact') {
  //     if (user.role === 'admin') {
  //       return `/admin/contact/${obj?.contact?._id}`
  //     } else if (user.role === 'grandadmin') {
  //       return `/grandadmin/contact/${obj._id}`
  //     } else if (user.role === 'superadmin') {
  //       return `/contact/${obj._id}`
  //     }
  //   }
  // }

  const getElseUrlRedirect = useMemo(() => {
    if (userKey === 'contact') {
      if (obj?.contact?._id && user.role === 'admin') {
        return `/admin/contact/${obj?.contact?._id}`;
      } else if (user.role === 'grandadmin') {
        return '/grandadmin/faq';
      } else if (user.role === 'superadmin') {
        return `/faq`;
      }
    }
  }, [userKey, obj, user]);

  // HELLO-TASK
  // const getElseUrlRedirect = () => {
  //   if (userKey === 'contact') {
  //     if (obj?.contact?._id && user.role === 'admin') {
  //       return `/admin/contact/${obj?.contact?._id}`
  //     } else if (user.role === 'grandadmin') {
  //       return '/grandadmin/faq'
  //     } else if (user.role === 'superadmin') {
  //       return `/faq`
  //     }
  //   }
  // }

  if (!item) {
    return (
      <>
        {getUrlRedirect ? (
          <Link to={getUrlRedirect}>
            <Avatar
              id={`avatar_${userKey}_${obj._id}`}
              img={defaultAvatar}
              imgHeight='32'
              imgWidth='32'
              onClick={(e) => {
                e.stopPropagation();
              }}
            />
          </Link>
        ) : (
          <Avatar
            id={`avatar_${userKey}_${obj._id}`}
            img={defaultAvatar}
            imgHeight='32'
            imgWidth='32'
            onClick={(e) => {
              e.stopPropagation();
            }}
          />
        )}
        {/* <UncontrolledTooltip
          key={`avatar_${userKey}_${obj._id}`}
          placement='top'
          target={`avatar_${userKey}_${obj._id}`}
        >
          <span className='d-block'>
            {userKey === 'contact' ? 'Contact: ' : 'Assignee: '}
          </span>
          <span>Unassigned</span>
        </UncontrolledTooltip> */}
      </>
    );
  } else if (item && item.userProfile && item.userProfile !== 'false') {
    return (
      <>
        {getUrlRedirect ? (
          <Link to={getUrlRedirect}>
            <Avatar
              id={`avatar_${userKey}_${obj._id}`}
              img={`${process.env.REACT_APP_S3_BUCKET_BASE_URL}${item.userProfile}`}
              imgHeight='32'
              imgWidth='32'
              onClick={(e) => {
                e.stopPropagation();
              }}
              content={userName}
              color={resolveAvatarVariant(obj.priority)}
              initials
            />
          </Link>
        ) : (
          <Avatar
            id={`avatar_${userKey}_${obj._id}`}
            img={`${process.env.REACT_APP_S3_BUCKET_BASE_URL}${item.userProfile}`}
            imgHeight='32'
            imgWidth='32'
            color={resolveAvatarVariant(obj.priority)}
            content={userName}
            initials
            onClick={(e) => {
              e.stopPropagation();
            }}
          />
        )}

        {/* <UncontrolledTooltip
          placement='top'
          key={`avatar_${userKey}_${obj._id}`}
          target={`avatar_${userKey}_${obj._id}`}
        >
          <span className='d-block'>
            {userKey === 'contact' ? 'Contact: ' : 'Assignee: '}
          </span>
          <span>{userName}</span>
          {additialTooltipText && (
            <span className='d-block'>{additialTooltipText}</span>
          )}
        </UncontrolledTooltip> */}
      </>
    );
  } else {
    return (
      <>
        {getElseUrlRedirect ? (
          <Link to={getElseUrlRedirect}>
            <Avatar
              id={`avatar_${userKey}_${obj._id}`}
              color={resolveAvatarVariant(obj.priority)}
              content={userName}
              initials
              onClick={(e) => {
                e.stopPropagation();
              }}
            />
          </Link>
        ) : (
          <Avatar
            id={`avatar_${userKey}_${obj._id}`}
            color={resolveAvatarVariant(obj.priority)}
            content={userName}
            initials
            onClick={(e) => {
              e.stopPropagation();
            }}
          />
        )}

        {/* <UncontrolledTooltip
          placement='top'
          key={`avatar_${userKey}_${obj._id}`}
          target={`avatar_${userKey}_${obj._id}`}
        >
          <span className='d-block'>
            {userKey === 'contact' ? 'Contact: ' : 'Assignee: '}
          </span>
          <span>{userName}</span>
          {additialTooltipText && (
            <span className='d-block'>{additialTooltipText}</span>
          )}
        </UncontrolledTooltip> */}
      </>
    );
  }
};

export default RenderTaskAvatar;
