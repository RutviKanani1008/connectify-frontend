import React, { useEffect } from 'react';
import { Progress } from 'reactstrap';
import { selectSocket } from '../redux/common';
import { useSelector } from 'react-redux';

const ProgressBar = ({ progress, setSocketSessionId, setProgress }) => {
  const socket = useSelector(selectSocket);

  useEffect(() => {
    const thisSessionId = Math.random().toString(36).substr(2, 9);
    if (socket) {
      setSocketSessionId(thisSessionId);
      socket.emit('initializeConnection', thisSessionId);
      socket.on('uploadProgress', (data) => {
        setProgress(Math.floor(data));
      });
    }

    return () => {
      socket && socket.emit('terminateConnection', thisSessionId);
    };
  }, [socket]);

  return (
    <>
      {progress ? (
        <Progress
          className='p-0 mt-2'
          striped
          variant='success'
          animated
          value={progress}
        >
          {progress}
        </Progress>
      ) : null}
    </>
  );
};

export default ProgressBar;
