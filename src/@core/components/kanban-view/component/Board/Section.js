import React from 'react';
import { Card } from 'reactstrap';

const TopSection = (props) => {
  return (
    <Card className={`react-trello-lane me-1`}>
      <div className='p-1 main-card-shadow'>{props.children}</div>
    </Card>
  );
};

export default TopSection;
