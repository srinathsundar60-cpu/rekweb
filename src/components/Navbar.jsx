import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { LogoImage } from './LogoImage';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const hamburgerRef = useRef(null);
  const drawerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Run immediately

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isDrawerOpen) {
      document.body.style.overflow = '';
      return;
    }

    document.body.style.overflow = 'hidden';

    const handleBackdropClick = (e) => {
      if (
        hamburgerRef.current &&
        !hamburgerRef.current.contains(e.target) &&
        drawerRef.current &&
        !drawerRef.current.contains(e.target)
      ) {
        setIsDrawerOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsDrawerOpen(false);
      }
    };

    document.addEventListener('click', handleBackdropClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('click', handleBackdropClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDrawerOpen]);

  const toggleDrawer = (e) => {
    e.stopPropagation();
    setIsDrawerOpen(!isDrawerOpen);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  return (
    <>
      <nav id="navbar" className={isScrolled ? 'scrolled' : ''}>
        <LogoImage className="nav-logo" />
        <ul className="nav-links">
          <li><a href="#about">About</a></li>
          <li><a href="#services">Services</a></li>
          <li><a href="#work">Work</a></li>
          <li><a href="#pricing">Pricing</a></li>
          <li><Link to="/login" style={{ fontWeight: 600, color: 'var(--black)' }}>Sign In</Link></li>
          <li><a href="#contact" className="nav-cta">Start a Project</a></li>
        </ul>
        <button
          ref={hamburgerRef}
          className={`nav-hamburger ${isDrawerOpen ? 'open' : ''}`}
          id="hamburger"
          aria-label={isDrawerOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isDrawerOpen ? 'true' : 'false'}
          aria-controls="navDrawer"
          onClick={toggleDrawer}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>

      {/* Mobile Drawer */}
      <div
        ref={drawerRef}
        id="navDrawer"
        className={isDrawerOpen ? 'open' : ''}
      >
        <a href="#about" onClick={closeDrawer}>About</a>
        <a href="#services" onClick={closeDrawer}>Services</a>
        <a href="#work" onClick={closeDrawer}>Work</a>
        <a href="#pricing" onClick={closeDrawer}>Pricing</a>
        <Link to="/login" onClick={closeDrawer} style={{ color: 'var(--orange)' }}>Sign In</Link>
        <a href="#contact" onClick={closeDrawer}>Contact</a>
      </div>
    </>
  );
};

export default Navbar;
