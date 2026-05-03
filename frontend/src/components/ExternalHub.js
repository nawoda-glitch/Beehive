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

      <div style={styles.iframeWrapper}>
        <iframe 
          src="https://bee-monitor.onrender.com/" 
          title="BEE Monitor External"
          style={styles.iframe}
          frameBorder="0"
        />
        <div style={styles.overlay}>
          <p>Connecting to External Node...</p>
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
  iframeWrapper: {
    position: 'relative',
    width: '100%',
    height: '600px',
    borderRadius: '12px',
    overflow: 'hidden',
    background: '#111',
    border: '1px solid rgba(255,255,255,0.05)'
  },
  iframe: {
    width: '100%',
    height: '100%',
    filter: 'contrast(1.1) brightness(0.9)',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40px',
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)',
    display: 'flex',
    alignItems: 'center',
    paddingLeft: '20px',
    color: '#666',
    fontSize: '0.7rem',
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
