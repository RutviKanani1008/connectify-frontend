import _ from 'lodash';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Col, Row, Spinner } from 'reactstrap';
import { userData } from '../../../../redux/user';
import { useGetCompanyUsers } from '../hooks/userApis';
import UserCard from './UserCard';

const AllowedUsersList = ({
  getValues,
  setValue,
  control,
  watch,
  isPermissionsDisabled,
}) => {
  const { id } = useParams();
  const user = useSelector(userData);
  const { getCompanyUsers, isLoading } = useGetCompanyUsers();

  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    loadCompanyUsers();
  }, []);

  const loadCompanyUsers = async () => {
    const companyId = user?.company._id;

    const { data, error } = await getCompanyUsers(companyId, {
      select: 'firstName,lastName,email,userProfile',
      isDeleted: false,
    });

    if (!error && data && _.isArray(data)) {
      const usersList = data.filter((u) => u._id !== id);

      const selfUser = data.find((u) => u._id === id);
      if (selfUser) usersList.unshift(selfUser);

      setAllUsers(usersList);
    }
  };

  if (isLoading) {
    return (
      <div className='d-flex align-items-center justify-content-center mb-1'>
        <Spinner />;
      </div>
    );
  }

  return (
    <Row className='company-task-manager-row'>
      <>
        {allUsers.map((user, index) => (
          <Col className='company-task-manager-col' md={6} key={index}>
            <UserCard
              user={user}
              index={index}
              control={control}
              watch={watch}
              getValues={getValues}
              setValue={setValue}
              allUsers={allUsers}
              isPermissionsDisabled={isPermissionsDisabled}
            />
          </Col>
        ))}
      </>
    </Row>
  );
};

export default AllowedUsersList;
