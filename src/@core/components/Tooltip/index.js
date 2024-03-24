import { useState } from 'react';
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
} from '@floating-ui/react';

const Tooltip = ({ children, contents }) => {
  const [open, setOpen] = useState(true);

  const { x, y, refs, strategy, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: 'top',
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(5),
      flip({
        fallbackAxisSideDirection: 'start',
        crossAxis: false,
      }),
      shift(),
    ],
  });

  const hover = useHover(context, { move: false });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'tooltip' });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    dismiss,
    role,
  ]);

  return (
    <>
      <div ref={refs.setReference} {...getReferenceProps()}>
        {children}
      </div>
      <FloatingPortal>
        {open && (
          <div
            className='Tooltip'
            ref={refs.setFloating}
            style={{
              position: strategy,
              top: y ?? 0,
              left: x ?? 0,

              //
              width: '200px',
              backgroundColor: 'rgba(46, 46, 46, 0.9)',
              color: 'white',
              fontSize: '90%',
              padding: '4px 8px',
              borderRadius: '4px',
            }}
            {...getFloatingProps()}
          >
            {contents}
          </div>
        )}
      </FloatingPortal>
    </>
  );
};

export default Tooltip;
