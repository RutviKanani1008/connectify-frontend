import React, { useEffect, useMemo } from 'react';
import { ENVELOPE_SIZE_MAPPER } from '../constant';
import SyncfusionRichTextEditor from '../../../../components/SyncfusionRichTextEditor';
import { DIRECT_MAIL_DYNAMIC_VARS } from '../../DirectMailTemplate/constant';

const EnvelopePreview = ({
  body,
  width = '100',
  height = '100',
  padding = '0',
  envelopeSize,
  setValue,
  envelopeEditorRef,
}) => {
  const heightInPx = useMemo(() => {
    return `${Math.round((+height * 500) / 100)}px`;
  }, [height]);

  const widthInPx = useMemo(() => {
    return `${Math.round((+width * 1177) / 100)}px`;
  }, [width]);

  useEffect(() => {
    const cssPagedMedia = (function () {
      const style = document.createElement('style');
      document.head.appendChild(style);
      return function (rule) {
        style.innerHTML = rule;
      };
    })();
    cssPagedMedia.size = function () {
      cssPagedMedia(
        `@page {size:${widthInPx} ${heightInPx} !important;  margin: 0px 0px 0px 0px !important;}`
      );
    };
    cssPagedMedia?.size('landscape');
    return () => {
      cssPagedMedia.size = function () {
        cssPagedMedia('@page {size: 595px 842px !important;}');
      };
      cssPagedMedia?.size('landscape');
    };
  }, [widthInPx, heightInPx]);

  return (
    <div className='invelope-preview-new'>
      <div className='vertical-scale-wrapper'>
        <span className='inch-scale-box'>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='half-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
        </span>
        <span className='inch-scale-box'>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='half-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
        </span>
        <span className='inch-scale-box'>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='half-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
        </span>
        <span className='inch-scale-box'>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='half-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
        </span>
        <span className='inch-scale-box'>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='half-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
        </span>
        <span className='inch-scale-box'>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='half-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
        </span>
      </div>
      <div className='inner-sec-wrapper'>
        <div className='envelope-preview-box envelope-preview-box-new'>
          <div
            className='inner-width-wrapper'
            style={{
              width: envelopeSize
                ? ENVELOPE_SIZE_MAPPER[envelopeSize].width
                : widthInPx,
              height: envelopeSize
                ? ENVELOPE_SIZE_MAPPER[envelopeSize].height
                : heightInPx,
            }}
          >
            <div className='margin-wrapper' style={{ padding: `${padding}px` }}>
              <SyncfusionRichTextEditor
                editorRef={envelopeEditorRef}
                inlineMode={{
                  enable: true,
                  onSelection: true,
                }}
                onChange={(e) => setValue?.('body', e.value)}
                value={body}
                mentionOption={DIRECT_MAIL_DYNAMIC_VARS}
                mentionEnable
              />
            </div>
          </div>
        </div>
      </div>
      <div className='horizontal-scale-wrapper'>
        <span className='inch-scale-box'>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='half-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
        </span>
        <span className='inch-scale-box'>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='half-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
        </span>
        <span className='inch-scale-box'>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='half-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
        </span>
        <span className='inch-scale-box'>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='half-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
        </span>
        <span className='inch-scale-box'>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='half-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
        </span>
        <span className='inch-scale-box'>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='half-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
        </span>
        <span className='inch-scale-box'>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='half-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
        </span>
        <span className='inch-scale-box'>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='half-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
        </span>
        <span className='inch-scale-box'>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='half-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
        </span>
        <span className='inch-scale-box'>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='half-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
        </span>
        <span className='inch-scale-box'>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='half-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
        </span>
        <span className='inch-scale-box'>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='half-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
          <span className='small-scale-line'></span>
        </span>
      </div>
    </div>
  );
};

export default EnvelopePreview;
