import React from 'react';

export const LogoImage = ({ theme = 'light', className = '' }) => (
  <a 
    href="https://www.rek.co.in/" 
    className={className}
    style={{ display: 'inline-block', textDecoration: 'none' }}
    aria-label="rek logo"
  >
    <img 
      className="rek-logo-img"
      src={theme === 'dark' ? "/logo-light.png" : "/logo-dark.png"} 
      alt="rek logo" 
      style={{ display: 'block', cursor: 'pointer' }}
    />
  </a>
);
