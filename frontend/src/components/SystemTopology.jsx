import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SystemTopology = ({ services }) => {
  const canvasRef = useRef(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const nodesRef = useRef([]);

  // Generate deterministic positions for nodes based on their index
  useEffect(() => {
    if (!services || services.length === 0) return;
    
    const updateLayout = () => {
      const width = canvasRef.current?.offsetWidth || 600;
      const height = canvasRef.current?.offsetHeight || 300;
      setDimensions({ width, height });

      const padding = 50;
      const numNodes = services.length;
      nodesRef.current = services.map((service, i) => {
        // Circle layout
        const angle = (i / numNodes) * 2 * Math.PI - Math.PI / 2;
        const radius = Math.min(width, height) / 2 - padding;
        const x = width / 2 + Math.cos(angle) * radius;
        const y = height / 2 + Math.sin(angle) * radius;
        return { ...service, x, y, radius: 28 }; // Slightly larger radius
      });
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, [services]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || nodesRef.current.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    let animId;
    let phase = 0;

    const draw = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      const nodes = nodesRef.current;
      phase += 0.05;

      // Draw Edges (Data pipelines)
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];
          
          const isCritical = n1.status === 'critical' || n2.status === 'critical';
          const isWarning = n1.status === 'warning' || n2.status === 'warning';
          
          ctx.beginPath();
          ctx.moveTo(n1.x, n1.y);
          ctx.lineTo(n2.x, n2.y);
          
          if (isCritical) {
            ctx.strokeStyle = `rgba(239, 68, 68, ${0.2 + Math.sin(phase) * 0.1})`;
            ctx.lineWidth = 2;
          } else if (isWarning) {
            ctx.strokeStyle = 'rgba(251, 191, 36, 0.15)';
            ctx.lineWidth = 1;
          } else {
            ctx.strokeStyle = 'rgba(14, 165, 233, 0.1)';
            ctx.lineWidth = 1;
          }
          ctx.stroke();

          // Draw data packets flowing
          if (!isCritical) {
            const progress = (phase * 0.5 + (i * j * 0.2)) % 1;
            const px = n1.x + (n2.x - n1.x) * progress;
            const py = n1.y + (n2.y - n1.y) * progress;
            ctx.beginPath();
            ctx.arc(px, py, 2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(14, 165, 233, 0.8)';
            ctx.fill();
          }
        }
      }

      // Draw Nodes
      nodes.forEach(node => {
        const isCritical = node.status === 'critical';
        const isHovered = hoveredNode && hoveredNode.service_id === node.service_id;
        
        const baseColor = isCritical ? '#ef4444' : node.status === 'warning' ? '#fbbf24' : '#10b981';
        
        // Outer glow
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + (isCritical ? Math.sin(phase * 2) * 5 + 5 : 0), 0, Math.PI * 2);
        ctx.fillStyle = isCritical ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.05)';
        ctx.fill();

        // Node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = isHovered ? baseColor : 'rgba(10, 15, 30, 0.95)';
        ctx.strokeStyle = baseColor;
        ctx.lineWidth = isHovered ? 2 : 1.5;
        ctx.fill();
        ctx.stroke();

        // Node Label (Short Name)
        ctx.font = '600 11px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = isHovered ? '#000' : '#f8fafc';
        const shortName = node.service_name.substring(0, 3).toUpperCase();
        
        // If critical/warning, draw notification INSIDE the circle instead of text
        if (isCritical || node.status === 'warning') {
          ctx.fillStyle = isHovered ? '#000' : baseColor;
          ctx.font = 'bold 16px sans-serif';
          ctx.fillText('!', node.x, node.y + 1);
          
          // Pulsing inner dot for extra hacker effect
          ctx.beginPath();
          ctx.arc(node.x, node.y, 4 + Math.sin(phase * 4) * 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${isCritical ? '239,68,68' : '251,191,36'}, ${0.3 + Math.sin(phase*2)*0.2})`;
          ctx.fill();
        } else {
          ctx.fillText(shortName, node.x, node.y + 1);
        }
      });

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, [dimensions, hoveredNode]);

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const hovered = nodesRef.current.find(n => Math.hypot(n.x - x, n.y - y) < n.radius);
    setHoveredNode(hovered || null);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {services.length === 0 ? (
        <div className="font-mono" style={{ color: "#64748b", fontSize: "12px" }}>Establishing topology...</div>
      ) : (
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredNode(null)}
          style={{ cursor: hoveredNode ? 'pointer' : 'default', width: '100%', height: '100%' }}
        />
      )}
      
      {/* Tooltip Overlay */}
      <AnimatePresence>
        {hoveredNode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="glass-panel"
            style={{
              position: 'absolute',
              top: hoveredNode.y - 80,
              left: hoveredNode.x - 75,
              width: '150px',
              padding: '12px',
              pointerEvents: 'none',
              zIndex: 10,
              background: 'rgba(5, 5, 10, 0.95)',
              border: `1px solid ${hoveredNode.status === 'critical' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`
            }}
          >
            <div className="font-sans" style={{ fontSize: '12px', fontWeight: '600', color: '#f8fafc', marginBottom: '8px', textAlign: 'center' }}>
              {hoveredNode.service_name}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '10px', color: '#94a3b8' }}>CPU</span>
              <span className="font-mono" style={{ fontSize: '10px', color: hoveredNode.cpu > 80 ? '#f87171' : '#4ade80' }}>{hoveredNode.cpu?.toFixed(1)}%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '10px', color: '#94a3b8' }}>LATENCY</span>
              <span className="font-mono" style={{ fontSize: '10px', color: hoveredNode.latency > 500 ? '#f87171' : '#4ade80' }}>{hoveredNode.latency?.toFixed(0)}ms</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SystemTopology;
