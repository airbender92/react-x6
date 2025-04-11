import React, { useState, useEffect, useRef } from 'react';

const BackToTop = ({
  visibilityHeight = 400,
  backPosition = 0,
  customStyle = {
    right: '50px',
    bottom: '50px',
    width: '40px',
    height: '40px',
    'border-radius': '4px',
    'line-height': '45px',
    background: '#e7eaf1'
  },
  transitionName = 'fade',
  scrollObject = window
}) => {
  const [visible, setVisible] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const intervalRef = useRef(null);

  const handleScroll = () => {
    setVisible(scrollObject.scrollTop > visibilityHeight);
  };

  const easeInOutQuad = (t, b, c, d) => {
    if ((t /= d / 2) < 1) return c / 2 * t * t + b;
    return -c / 2 * (--t * (t - 2) - 1) + b;
  };

  const backToTop = () => {
    if (isMoving) return;
    const start = scrollObject.scrollTop;
    let i = 0;
    setIsMoving(true);
    intervalRef.current = setInterval(() => {
      const next = Math.floor(easeInOutQuad(10 * i, start, -start, 500));
      if (next <= backPosition) {
        scrollObject.scrollTo(0, backPosition);
        clearInterval(intervalRef.current);
        setIsMoving(false);
      } else {
        scrollObject.scrollTo(0, next);
      }
      i++;
    }, 16.7);
  };

  useEffect(() => {
    scrollObject.addEventListener('scroll', handleScroll);
    return () => {
      scrollObject.removeEventListener('scroll', handleScroll);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [scrollObject]);

  return (
    <React.Fragment>
      <style>{`
        .back-to-ceiling {
          position: fixed;
          display: inline-block;
          text-align: center;
          cursor: pointer;
          z-index: 9999999;
        }

        .back-to-ceiling:hover {
          background: #d5dbe7;
        }

        .${transitionName}-enter-active,
        .${transitionName}-leave-active {
          transition: opacity .5s;
        }

        .${transitionName}-enter,
        .${transitionName}-leave-to {
          opacity: 0
        }

        .back-to-ceiling .Icon {
          fill: #9aaabf;
          background: none;
        }
      `}</style>
      <div className={`${transitionName}-transition`}>
        <div style={visible ? customStyle : { ...customStyle, display: 'none' }} className="back-to-ceiling" onClick={backToTop}>
          <svg width="16" height="16" viewBox="0 0 17 17" xmlns="http://www.w3.org/2000/svg" className="Icon Icon--backToTopArrow" aria-hidden="true" style={{ height: '16px', width: '16px' }}>
            <path d="M12.036 15.59a1 1 0 0 1-.997.995H5.032a.996.996 0 0 1-.997-.996V8.584H1.03c-1.1 0-1.36-.633-.578-1.416L7.33.29a1.003 1.003 0 0 1 1.412 0l6.878 6.88c.782.78.523 1.415-.58 1.415h-3.004v7.004z" />
          </svg>
        </div>
      </div>
    </React.Fragment>
  );
};

export default BackToTop;