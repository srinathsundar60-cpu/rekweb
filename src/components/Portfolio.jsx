import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import logoImg from '../assets/logo.jpeg'; // Keep as fallback if needed

const Portfolio = () => {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolioProjects();
  }, []);

  const fetchPortfolioProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('project')
        .select('*')
        .eq('approval_status', 'approved')
        .eq('visibility', true)
        .order('approved_date', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl2');
    if (!gl) return;

    const vertSrc = `#version 300 es
precision highp float;
in vec4 position;
void main(){gl_Position=position;}`;

    const fragSrc = `#version 300 es
precision highp float;
out vec4 O;
uniform float time;
uniform vec2 resolution;
#define FC gl_FragCoord.xy
#define R resolution
#define T (time+200.)
float rnd(vec2 p){p=fract(p*vec2(12.9898,78.233));p+=dot(p,p+34.56);return fract(p.x*p.y);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);return mix(mix(rnd(i),rnd(i+vec2(1,0)),u.x),mix(rnd(i+vec2(0,1)),rnd(i+1.),u.x),u.y);}
float fbm(vec2 p){float t=.0,a=1.;for(int i=0;i<6;i++){t+=a*noise(p);p*=mat2(1.6,-1.2,.2,1.4);a*=.5;}return t;}
void main(){
  vec2 uv=(FC-.5*R)/R.y;
  uv*=1.4;
  float n=fbm(uv*.5+vec2(T*.008,0.));
  float n2=fbm(uv*.8-vec2(0.,T*.006)+n*.7);
  float n3=fbm(uv*1.2+vec2(T*.004,T*.003)+n2*.5);
  /* Orange core */
  vec3 col=vec3(0.04,0.04,0.05);
  col+=vec3(0.95,0.43,0.08)*pow(max(0.,n3-.2),2.2)*1.8;
  col+=vec3(0.6,0.22,0.02)*pow(max(0.,n2-.3),1.6)*1.1;
  col+=vec3(0.15,0.08,0.02)*n*0.6;
  /* Vignette */
  float dist=length(uv*vec2(0.7,1.0));
  col*=smoothstep(1.6,0.1,dist);
  col=clamp(col,0.,1.);
  O=vec4(col,1);
}`;

    const compileShader = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };

    const vs = compileShader(gl.VERTEX_SHADER, vertSrc);
    const fs = compileShader(gl.FRAGMENT_SHADER, fragSrc);
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, 1, -1, -1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(prog, 'position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, 'resolution');
    const uTime = gl.getUniformLocation(prog, 'time');

    const resize = () => {
      const dpr = Math.max(1, Math.min(window.devicePixelRatio, 2));
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });

    let running = false;
    let animationFrameId;

    const render = (now) => {
      if (!running) return;
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, now * 1e-3);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrameId = requestAnimationFrame(render);
    };

    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !running) {
          running = true;
          animationFrameId = requestAnimationFrame(render);
        } else if (!e.isIntersecting && running) {
          running = false;
          cancelAnimationFrame(animationFrameId);
        }
      });
    }, { threshold: 0.01 });

    if (sectionRef.current) {
      obs.observe(sectionRef.current);
    }

    return () => {
      window.removeEventListener('resize', resize);
      obs.disconnect();
      cancelAnimationFrame(animationFrameId);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, []);

  // Helper for alternating reveal classes
  const getRevealClass = (index) => {
    const rem = index % 3;
    if (rem === 0) return 'reveal-d1';
    if (rem === 1) return 'reveal-d3';
    return 'reveal-d2';
  };

  // Helper for alternating gradients
  const getGradient = (index) => {
    const rem = index % 3;
    if (rem === 0) return 'linear-gradient(135deg,#c31432,#240b36)';
    if (rem === 1) return 'linear-gradient(135deg,#0f2027,#203a43,#2c5364)';
    return 'linear-gradient(135deg,#1a1a2e,#16213e)';
  };

  return (
    <section id="work" ref={sectionRef}>
      <div className="work-hero reveal">
        <canvas ref={canvasRef} id="workShadowCanvas" className="work-hero-canvas" aria-hidden="true"></canvas>
        <div className="work-hero-mask"></div>
        <div className="work-hero-noise"></div>
        <div className="work-hero-content">
          <span className="section-label">Portfolio</span>
          <h2 className="section-title">What we build.</h2>
          <p className="portfolio-intro">We don't just plan. We build. Here's what we've shipped, and what's next.</p>
        </div>
      </div>
      
      <div className="portfolio-grid">
        {loading ? (
          <p className="portfolio-note reveal">Loading projects...</p>
        ) : projects.length === 0 ? (
          <p className="portfolio-note reveal">More drops coming soon.</p>
        ) : (
          projects.map((proj, index) => (
            <div key={proj.id} className={`portfolio-card reveal ${getRevealClass(index)}`}>
              <div className="portfolio-preview" style={{ background: getGradient(index) }}>
                <div className="portfolio-preview-inner">
                  {proj.thumbnail ? (
                    <img src={proj.thumbnail} width="300" height="200" alt={proj.title} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                  ) : (
                    <span style={{ fontSize: '3rem' }}>🚀</span>
                  )}
                </div>
                <div className="portfolio-overlay"></div>
                <div className="portfolio-status">Live</div>
              </div>
              <div className="portfolio-body">
                <p className="portfolio-cat">{proj.nature}</p>
                <h3>{proj.title}</h3>
                <p>{proj.description || 'A premium digital solution crafted for our client.'}</p>
                {proj.website_link ? (
                  <a href={proj.website_link} target="_blank" rel="noopener noreferrer" className="btn-ghost">View Live →</a>
                ) : proj.github_link ? (
                  <a href={proj.github_link} target="_blank" rel="noopener noreferrer" className="btn-ghost">View Code →</a>
                ) : (
                  <a href="#contact" className="btn-ghost">Contact Us →</a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      {!loading && projects.length > 0 && (
        <p className="portfolio-note reveal">More drops coming soon.</p>
      )}
    </section>
  );
};

export default Portfolio;
