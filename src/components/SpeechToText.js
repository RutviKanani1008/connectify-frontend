import { createSpeechlySpeechRecognition } from '@speechly/speech-recognition-polyfill';
import SpeechRecognition, {
  useSpeechRecognition,
} from 'react-speech-recognition';
import { Button } from 'reactstrap';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useEffect } from 'react';
import { Icon } from '@iconify/react';

const SpeechlySpeechRecognition = createSpeechlySpeechRecognition(
  process.env.REACT_APP_SPEECHLY_APP_ID
);
SpeechRecognition.applyPolyfill(SpeechlySpeechRecognition);

export const SpeechToText = (props) => {
  const { handleChangeSpeechToText } = props;
  const {
    // time,
    stop,
    start,
    // pause,
    // resume,
    // paused,
    recording,
    // reset
  } = useAudioRecorder();

  const {
    transcript,
    // listening,
    // resetTranscript,
    // browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const onStart = () => {
    if (!recording) {
      start();
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  const onStop = () => {
    if (recording) {
      stop();
      SpeechRecognition.stopListening();
    }
  };

  // const onReset = () => {
  //   setTimeout(() => {
  //     resetTranscript();
  //   }, 100);
  // };

  useEffect(() => {
    if (transcript !== '') {
      handleChangeSpeechToText(transcript);
    }
  }, [transcript]);

  return (
    <>
      {!recording ? (
        <Button
          className='speech-to-text-btn'
          color='primary'
          onClick={onStart}
          // className={recording && `cs-light-blue-gradient.Mui-disabled`}
          disabled={recording}
        >
          <Icon icon='ion:mic-outline' width='20' />
          Start
        </Button>
      ) : (
        <Button
          className='speech-to-text-btn'
          color='primary'
          onClick={onStop}
          // className={!recording && `cs-light-blue-gradient.Mui-disabled`}
          disabled={!recording}
        >
          <Icon icon='ion:mic-off-outline' width='20' />
          Stop
        </Button>
      )}
    </>
  );
};
