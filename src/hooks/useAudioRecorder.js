import { useRef, useState } from 'react';
import { secondsToTime } from '../helper/common.helper';

const emptyBlob = new Blob() || ``;
const emptyStream = new MediaStream();
const initialTime = { h: 0, m: 0, s: 0 };

const initState = {
  time: initialTime,
  seconds: 0,
  recording: false,
  paused: false,
  mediaNotFound: false,
  audioBlob: emptyBlob,
  audioData: {
    url: ``,
    chunks: [],
    blob: emptyBlob,
    duration: initialTime,
  },
  stream: emptyStream,
};

let timer;
let chunks = [];
let mediaRecorder;

export const useAudioRecorder = (props) => {
  const [, setAudioState] = useState({});
  const dataRef = useRef(initState);
  const { paused, recording, stream, mediaNotFound, audioData, time } =
    dataRef.current;
  const updateState = () => setAudioState({});

  const initRecorder = async () => {
    navigator.getUserMedia =
      navigator.getUserMedia ||
      navigator.msGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.webkitGetUserMedia;

    if (navigator.mediaDevices) {
      dataRef.current.stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });

      if (props) {
        const { mimeTypeToUseWhenRecording = `` } = props;
        mediaRecorder = new MediaRecorder(dataRef.current.stream, {
          mimeType: mimeTypeToUseWhenRecording,
        });
      } else {
        mediaRecorder = new MediaRecorder(dataRef.current.stream);
      }
      chunks = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      return true;
    }
    dataRef.current = {
      ...dataRef.current,
      mediaNotFound: true,
    };
    updateState();
    return false;
  };

  const handleAudioPause = () => {
    if (!paused) {
      clearInterval(timer);
      mediaRecorder.pause();
      dataRef.current = {
        ...dataRef.current,
        paused: true,
      };
      updateState();
    }
  };

  const handleAudioStart = () => {
    if (paused) {
      startTimer();
      mediaRecorder.resume();
      dataRef.current = {
        ...dataRef.current,
        paused: false,
      };
      updateState();
    }
  };

  const countDown = () => {
    const seconds = dataRef.current.seconds + 1;
    dataRef.current = {
      ...dataRef.current,
      seconds,
      time: secondsToTime(seconds),
    };
    updateState();
  };

  const startTimer = () => {
    timer = setInterval(countDown, 1000);
  };

  const startRecording = async () => {
    if (!recording) {
      const isReady = await initRecorder();
      if (isReady) {
        chunks = [];
        mediaRecorder.start(10);
        startTimer();
        dataRef.current = {
          ...dataRef.current,
          recording: true,
        };
        updateState();
      }
    }
  };

  const stopRecording = () => {
    if (recording) {
      clearInterval(timer);
      mediaRecorder.stop();
      dataRef.current = {
        ...dataRef.current,
        paused: false,
        recording: false,
        seconds: 0,
      };
      saveAudio();
      stream.getTracks().forEach((track) => {
        if (track.readyState === `live`) {
          track.stop();
        }
      });
      updateState();
    }
  };

  const handleReset = () => {
    if (dataRef.current.recording) {
      stopRecording();
    }
    dataRef.current = {
      ...dataRef.current,
      time: initialTime,
      seconds: 0,
      recording: false,
      mediaNotFound: false,
      audioBlob: emptyBlob,
      audioData: initState.audioData,
    };
    updateState();
  };

  const saveAudio = () => {
    const blob = new Blob(chunks, { type: `audio/*` });
    const audioURL = window.URL.createObjectURL(blob);
    dataRef.current = {
      ...dataRef.current,
      audioBlob: blob,
      audioData: {
        blob,
        url: audioURL,
        chunks,
        duration: dataRef.current.time,
      },
    };
    updateState();
  };

  return {
    time,
    paused,
    recording,
    data: audioData,
    reset: handleReset,
    stop: stopRecording,
    start: startRecording,
    pause: handleAudioPause,
    resume: handleAudioStart,
    hasRecorder: !mediaNotFound,
  };
};
