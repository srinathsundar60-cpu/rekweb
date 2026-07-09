import React from 'react';
import { LogoImage } from './LogoImage';

const Footer = () => {
  return (
    <footer>
      <div className="footer-main">
        <div className="footer-left reveal">
          <span className="footer-brand-logo" aria-label="rek logo">
            <LogoImage />
          </span>
          <p className="footer-tagline">Building digital products that work.</p>
        </div>
        <div className="footer-right">
          <div className="footer-col reveal reveal-d2">
            <h4>Pages</h4>
            <ul>
              <li><a href="#hero">Home</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#work">Work</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
          <div className="footer-col reveal reveal-d3">
            <h4>Connect</h4>
            <ul>
              <li><a href="https://instagram.com/rek.solutions" target="_blank" rel="noopener">Instagram</a></li>
              <li><a href="https://wa.me/919488125235" target="_blank" rel="noopener">WhatsApp</a></li>
              <li><a href="mailto:hello@rek.solutions">Email us</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="footer-copy">
          © 2026 rek.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
