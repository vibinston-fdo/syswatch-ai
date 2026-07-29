import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, LayoutDashboard, Activity, AlertTriangle, BarChart3, Terminal, ShieldAlert } from 'lucide-react';

const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const commands = [
    { id: 'nav-dash', icon: LayoutDashboard, title: 'Go to Dashboard', action: () => navigate('/dashboard') },
    { id: 'nav-serv', icon: Activity, title: 'Go to Services', action: () => navigate('/services') },
    { id: 'nav-alert', icon: AlertTriangle, title: 'Go to Alerts', action: () => navigate('/alerts') },
    { id: 'nav-analy', icon: BarChart3, title: 'Go to Analytics', action: () => navigate('/analytics') },
    { id: 'act-autop', icon: ShieldAlert, title: 'Toggle Auto-Pilot', action: () => {
        const current = localStorage.getItem("autoPilot") === "true";
        localStorage.setItem("autoPilot", !current);
        window.dispatchEvent(new Event("autoPilotChanged"));
        // Need to reload to reflect state in simple setup or let state pick it up
        setTimeout(() => window.location.reload(), 300);
      } 
    },
    { id: 'act-term', icon: Terminal, title: 'Focus Terminal', action: () => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      } 
    }
  ];

  const filteredCommands = query 
    ? commands.filter(cmd => cmd.title.toLowerCase().includes(query.toLowerCase()))
    : commands;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleCommandKey = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    }
    if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
      e.preventDefault();
      filteredCommands[selectedIndex].action();
      setIsOpen(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(12px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: '15vh'
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={e => e.stopPropagation()}
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '600px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
              border: '1px solid rgba(124,58,237,0.3)',
            }}
          >
            {/* Input Header */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <Search size={20} color="#a78bfa" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleCommandKey}
                placeholder="Type a command or search..."
                className="font-sans"
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#f8fafc',
                  fontSize: '18px',
                  marginLeft: '16px',
                  fontWeight: '500'
                }}
              />
              <div className="font-mono" style={{ fontSize: '10px', color: '#64748b', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px' }}>ESC</div>
            </div>

            {/* Results */}
            <div style={{ maxHeight: '350px', overflowY: 'auto', padding: '10px' }}>
              {filteredCommands.length > 0 ? (
                filteredCommands.map((cmd, i) => {
                  const isSelected = i === selectedIndex;
                  const Icon = cmd.icon;
                  return (
                    <div
                      key={cmd.id}
                      onClick={() => { cmd.action(); setIsOpen(false); }}
                      onMouseEnter={() => setSelectedIndex(i)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        padding: '14px 16px',
                        cursor: 'pointer',
                        borderRadius: '10px',
                        background: isSelected ? 'rgba(124,58,237,0.15)' : 'transparent',
                        border: isSelected ? '1px solid rgba(124,58,237,0.3)' : '1px solid transparent',
                        transition: 'background 0.1s, border 0.1s'
                      }}
                    >
                      <Icon size={18} color={isSelected ? "#a78bfa" : "#64748b"} />
                      <span className="font-sans" style={{ fontSize: '15px', color: isSelected ? '#f8fafc' : '#94a3b8', fontWeight: isSelected ? '600' : '500' }}>
                        {cmd.title}
                      </span>
                      {isSelected && (
                        <span className="font-mono" style={{ marginLeft: 'auto', fontSize: '10px', color: '#a78bfa' }}>ENTER</span>
                      )}
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                  No commands found.
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
