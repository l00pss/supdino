import React, {JSX, useEffect, useState} from 'react';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

export default function BuyMeCoffeeWidget(): JSX.Element | null {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (ExecutionEnvironment.canUseDOM) {
      // Show widget after component mounts
      setIsVisible(true);

      // Load external script as fallback
      const script = document.createElement('script');
      script.src = 'https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js';
      script.setAttribute('data-name', 'BMC-Widget');
      script.setAttribute('data-cfasync', 'false');
      script.setAttribute('data-id', 'l00pss');
      script.setAttribute('data-description', 'Support The8ArmsHub!');
      script.setAttribute('data-message', '');
      script.setAttribute('data-color', '#5F7FFF');
      script.setAttribute('data-position', 'Right');
      script.setAttribute('data-x_margin', '20');
      script.setAttribute('data-y_margin', '120');
      script.async = true;

      document.head.appendChild(script);
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '120px',
        right: '20px',
        zIndex: 1000,
        display: ExecutionEnvironment.canUseDOM && window.innerWidth > 996 ? 'block' : 'none'
      }}
    >
      <a
        href="https://www.buymeacoffee.com/l00pss"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '10px 16px',
          backgroundColor: '#5F7FFF',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '25px',
          fontSize: '14px',
          fontWeight: 'bold',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        }}
      >
        <span style={{ marginRight: '8px', fontSize: '16px' }}>☕</span>
        Buy me a coffee
      </a>
    </div>
  );
}
