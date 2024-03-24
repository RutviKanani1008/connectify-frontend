import { useEffect, useRef } from 'react';

const DisplayRichTextContent = ({ content, className = '' }) => {
  const userSignRef = useRef(null);

  useEffect(() => {
    if (content && userSignRef?.current) {
      userSignRef.current.innerHTML = content;
    }
  }, [content]);

  return <div ref={userSignRef} className={className} />;
};

export default DisplayRichTextContent;
