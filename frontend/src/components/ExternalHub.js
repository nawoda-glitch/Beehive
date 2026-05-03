import React from 'react';

const ExternalHub = () => {
  return (
    <div style={styles.container} className="bee-card">
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={styles.icon}>🌐</span>
          <h3 style={styles.title}>External Control Hub</h3>
        </div>
        <a 
          href="https://bee-monitor.onrender.com/" 
          target="_blank" 
          rel="noopener noreferrer"
          style={styles.link}
        >
          Open in New Tab ↗
        </a>
      </div>

      <div style={styles.portalWrapper}>
        <div style={{...styles.imageBackdrop, backgroundImage: 'url("/external_hub.png")'}} />
        
        <div style={styles.portalContent}>
          <span style={styles.statusText}>● NODE: RENDER_SERVER_BEE_01 (SECURE)</span>
          <h2 style={styles.portalTitle}>Legacy Monitoring Hub</h2>
          <p style={styles.portalDesc}>The external Render dashboard has security policies that prevent direct embedding. Click below to access the full control panel.</p>
          
          <a 
            href="https://bee-monitor.onrender.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            style={styles.portalBtn}
          >
            Launch External Hub ↗
          </a>
        </div>

        <div style={styles.overlay}>
          <p>System Integrated: AES-256 Connection</p>
        </div>
      </div>
      
      <p style={styles.footer}>
        Note: This is a secondary monitoring node (Render Hub). Some features may require direct access.
      </p>
    </div>
  );
};

const styles = {
  container: {
    background: 'rgba(30, 30, 30, 0.8)',
    borderRadius: '20px',
    padding: '24px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    marginTop: '30px',
    backdropFilter: 'blur(15px)',
    boxShadow: '0 15px 50px rgba(0,0,0,0.5)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  title: {
    margin: 0,
    fontSize: '1rem',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    fontWeight: '800'
  },
  icon: {
    fontSize: '1.2rem',
    background: 'rgba(255, 179, 0, 0.1)',
    padding: '8px',
    borderRadius: '10px',
    border: '1px solid rgba(255, 179, 0, 0.2)'
  },
  link: {
    fontSize: '0.75rem',
    color: '#ffb300',
    textDecoration: 'none',
    fontWeight: 'bold',
    opacity: 0.8,
    transition: '0.3s'
  },
  portalWrapper: {
    position: 'relative',
    width: '100%',
    height: '400px',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#000'
  },
  imageBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    opacity: 0.4,
    filter: 'blur(4px) grayscale(0.5)'
  },
  portalContent: {
    position: 'relative',
    zIndex: 2,
    textAlign: 'center',
    padding: '40px',
    maxWidth: '400px'
  },
  statusText: {
    fontSize: '0.65rem',
    color: '#38a169',
    fontWeight: '800',
    letterSpacing: '1px',
    display: 'block',
    marginBottom: '10px'
  },
  portalTitle: {
    fontSize: '1.8rem',
    color: '#fff',
    margin: '0 0 15px 0',
    fontWeight: '800',
    textShadow: '0 4px 10px rgba(0,0,0,0.5)'
  },
  portalDesc: {
    fontSize: '0.85rem',
    color: '#aaa',
    lineHeight: '1.5',
    marginBottom: '25px'
  },
  portalBtn: {
    display: 'inline-block',
    background: '#ffb300',
    color: '#000',
    padding: '12px 30px',
    borderRadius: '30px',
    textDecoration: 'none',
    fontWeight: '800',
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    boxShadow: '0 10px 30px rgba(255, 179, 0, 0.3)',
    transition: '0.3s transform'
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40px',
    background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
    display: 'flex',
    alignItems: 'center',
    paddingLeft: '20px',
    color: '#666',
    fontSize: '0.6rem',
    pointerEvents: 'none'
  },
  footer: {
    marginTop: '15px',
    fontSize: '0.75rem',
    color: '#555',
    textAlign: 'center',
    fontStyle: 'italic'
  }
};

export default ExternalHub;
