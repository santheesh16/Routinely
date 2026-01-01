import { useState, useEffect, useRef } from 'react';
import Draggable from 'react-draggable';
import DSATopicCard from './DSATopicCard';

const DSARoadmapFlowchart = ({ nodes, onNodeClick }) => {
  const [nodePositions, setNodePositions] = useState({});
  const [connections, setConnections] = useState([]);
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const containerRef = useRef(null);
  const nodesContainerRef = useRef(null);

  // Initialize positions and connections
  useEffect(() => {
    const positions = {};
    const conns = [];

    // Calculate initial positions based on levels
    const nodesByLevel = {};
    nodes.forEach((node) => {
      if (!nodesByLevel[node.level]) {
        nodesByLevel[node.level] = [];
      }
      nodesByLevel[node.level].push(node);
    });

    // Set initial positions
    const containerWidth = containerRef.current?.clientWidth || 1200;
    Object.keys(nodesByLevel)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .forEach((level) => {
        const levelNodes = nodesByLevel[level];
        const levelNum = parseInt(level);
        const yPos = levelNum * 150 + 80; // Vertical spacing
        const totalWidth = levelNodes.length * 200;
        const startX = Math.max(50, (containerWidth - totalWidth) / 2);

        levelNodes.forEach((node, idx) => {
          const xPos = startX + idx * 200;
          positions[node.id] = { x: xPos, y: yPos };
        });
      });

    // Create connections
    nodes.forEach((node) => {
      if (node.parent) {
        conns.push({ from: node.parent, to: node.id });
      }
      if (node.parents && node.parents.length > 0) {
        node.parents.forEach((parent) => {
          conns.push({ from: parent, to: node.id });
        });
      }
    });

    setNodePositions(positions);
    setConnections(conns);
  }, [nodes]);

  const handleDrag = (nodeId, data) => {
    setNodePositions((prev) => ({
      ...prev,
      [nodeId]: { x: data.x, y: data.y },
    }));
  };

  const handleDragStart = (nodeId) => {
    setDraggingNodeId(nodeId);
  };

  const handleDragStop = (nodeId, data) => {
    setNodePositions((prev) => ({
      ...prev,
      [nodeId]: { x: data.x, y: data.y },
    }));
    // Clear dragging state after a short delay to allow click detection
    setTimeout(() => {
      setDraggingNodeId(null);
    }, 100);
  };

  // Calculate connection line coordinates
  const getConnectionPath = (fromId, toId) => {
    const from = nodePositions[fromId];
    const to = nodePositions[toId];
    if (!from || !to) return null;

    const cardWidth = 180;
    const cardHeight = 100;
    const fromX = from.x + cardWidth / 2; // Center of card
    const fromY = from.y + cardHeight; // Bottom of card
    const toX = to.x + cardWidth / 2;
    const toY = to.y; // Top of card

    // Create curved path (bezier curve)
    const midY = fromY + (toY - fromY) / 2;
    return `M ${fromX} ${fromY} C ${fromX} ${midY} ${toX} ${midY} ${toX} ${toY}`;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-auto bg-gray-50 dark:bg-gray-900"
      style={{ position: 'relative', minHeight: '100%', width: '100%', height: '100%' }}
    >
      {/* SVG for connections - positioned absolutely */}
      <svg
        className="absolute top-0 left-0 pointer-events-none"
        style={{ 
          width: '100%', 
          height: '100%', 
          zIndex: 1,
          overflow: 'visible'
        }}
      >
        <defs>
          {/* Arrow marker definition */}
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3, 0 6"
              fill="rgba(255, 255, 255, 0.6)"
              className="dark:fill-gray-400"
            />
          </marker>
        </defs>
        {connections.map((conn, idx) => {
          const path = getConnectionPath(conn.from, conn.to);
          if (!path) return null;
          return (
            <path
              key={`${conn.from}-${conn.to}-${idx}`}
              d={path}
              stroke="rgba(255, 255, 255, 0.7)"
              strokeWidth="2.5"
              fill="none"
              markerEnd="url(#arrowhead)"
              className="dark:stroke-gray-300"
            />
          );
        })}
      </svg>

      {/* Draggable nodes */}
      <div 
        ref={nodesContainerRef}
        className="relative" 
        style={{ zIndex: 2, width: '100%', height: '100%', position: 'relative', minHeight: '800px' }}
      >
        {nodes.map((node) => {
          const position = nodePositions[node.id] || { x: 0, y: 0 };
          return (
            <Draggable
              key={node.id}
              position={position}
              onStart={() => handleDragStart(node.id)}
              onDrag={(e, data) => handleDrag(node.id, data)}
              onStop={(e, data) => handleDragStop(node.id, data)}
              bounds="parent"
              cancel=".no-drag"
            >
              <div
                className="absolute"
                style={{
                  left: 0,
                  top: 0,
                  cursor: 'move',
                }}
              >
                <DSATopicCard 
                  node={node} 
                  onClick={() => {
                    // Only trigger onClick if not currently dragging this node
                    if (draggingNodeId !== node.id) {
                      onNodeClick(node);
                    }
                  }}
                  isDraggable={true}
                />
              </div>
            </Draggable>
          );
        })}
      </div>
    </div>
  );
};

export default DSARoadmapFlowchart;

