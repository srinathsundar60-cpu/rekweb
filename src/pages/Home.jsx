import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import About from '../components/About';
import Services from '../components/Services';
import Portfolio from '../components/Portfolio';
import Pricing from '../components/Pricing';
import Why from '../components/Why';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import { useScrollReveal } from '../hooks/useScrollReveal';

function Home() {
  // Initialize scroll reveal hook
  useScrollReveal();

  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <Services />
      <Portfolio />
      <Pricing />
      <Why />
      <Contact />
      <Footer />
    </>
  );
}

export default Home;
