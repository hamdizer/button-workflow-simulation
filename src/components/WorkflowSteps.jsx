import React, { useEffect, useRef, useState } from "react";

export default function WorkflowSteps({ actions, editingIndex, isRunning, onSelectAction, onRemoveAction }) {

  const containerRef = useRef(null);
  const [positions, setPositions] = useState({});

  useEffect(() => {
    if (isRunning) return;
    if (!containerRef.current) return;


    const newPositions = {};
    actions.forEach((_, index) => {
      const el = containerRef.current.querySelector(`[data-action-id="${index}"]`);
      if (el) {
        const rect = el.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        newPositions[index] = {
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.top - containerRect.top + rect.height
        };
      }
    });
    setPositions(newPositions);
  }, [actions.length, editingIndex]);

  const svgHeight = actions.length > 0 ? Math.max(...Object.values(positions).map((p) => p.y || 0)) + 60 : 0;

  const thenLaneOffset = 10;
  const elseLaneOffset = -10;

  const actionsContainerRef = useRef(null);
  const [connectorX, setConnectorX] = useState(20);

  useEffect(() => {
    if (isRunning) return;
    if (!containerRef.current || !actionsContainerRef.current) return;


    const update = () => {
      const parentRect = containerRef.current.getBoundingClientRect();
      const childRect = actionsContainerRef.current.getBoundingClientRect();
      const nextX = childRect.left - parentRect.left + childRect.width / 2;
      if (typeof nextX === "number" && Number.isFinite(nextX)) setConnectorX(nextX);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [actions.length, editingIndex]);

  return (

    <div ref={containerRef} style={{ position: "relative" }}>
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: `${svgHeight}px`,
          pointerEvents: "none",
          zIndex: 0
        }}
        width="100%"
        height={svgHeight}
      >
        <defs>
          <marker id="arrowblue" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#0A84FF" />
          </marker>
          <marker id="arrowgreen" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#34C759" />
          </marker>
          <marker id="arrowred" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#FF3B30" />
          </marker>
        </defs>

        {actions.map((action, index) => {
          const fromPos = positions[index];
          if (!fromPos) return null;

          if (action.id === "action_conditional") {
            const thenIdx = action.config.thenNextStep;
            const elseIdx = action.config.elseNextStep;

            return (
              <g key={`conditional-${index}`}>
                {thenIdx != null && positions[thenIdx] && (
                  <>
                    <path
                      d={`M ${connectorX + thenLaneOffset} ${fromPos.y} L ${connectorX + thenLaneOffset} ${positions[thenIdx].y}`}
                      stroke="#34C759"
                      strokeWidth="2"
                      fill="none"
                      markerEnd="url(#arrowgreen)"
                    />
                    <text
                      x={connectorX + thenLaneOffset + 6}
                      y={(fromPos.y + positions[thenIdx].y) / 2 - 4}
                      fontSize="11"
                      fill="#34C759"
                      fontWeight="600"
                    >
                      ✓
                    </text>
                  </>
                )}

                {elseIdx != null && positions[elseIdx] && (
                  <>
                    <path
                      d={`M ${connectorX + elseLaneOffset} ${fromPos.y} L ${connectorX + elseLaneOffset} ${positions[elseIdx].y}`}
                      stroke="#FF3B30"
                      strokeWidth="2"
                      fill="none"
                      markerEnd="url(#arrowred)"
                    />
                    <text
                      x={connectorX + elseLaneOffset + 6}
                      y={(fromPos.y + positions[elseIdx].y) / 2 - 4}
                      fontSize="11"
                      fill="#FF3B30"
                      fontWeight="600"
                    >
                      ✗
                    </text>
                  </>
                )}
              </g>
            );
          }

          const nextIdx = action.nextActionIndex;
          if (nextIdx != null && positions[nextIdx]) {
            return (
              <path
                key={`arrow-${index}`}
                d={`M ${connectorX} ${fromPos.y} L ${connectorX} ${positions[nextIdx].y}`}
                stroke="#0A84FF"
                strokeWidth="2"
                fill="none"
                markerEnd="url(#arrowblue)"
              />
            );
          }

          return null;
        })}
      </svg>

      <div style={{ position: "relative", zIndex: 1 }}>
        <div ref={actionsContainerRef} className="workflow-actions">
          {actions.map((action, index) => {
            const nextLabel = action.id === "action_conditional"
              ? `If true → ${action.config.thenNextStep != null ? actions[action.config.thenNextStep]?.label || "Unknown" : "End"}, false → ${action.config.elseNextStep != null ? actions[action.config.elseNextStep]?.label || "Unknown" : "End"}`
              : action.nextActionIndex != null
                ? actions[action.nextActionIndex]?.label || "Unknown"
                : "End workflow";

            return (
              <div
                key={`${action.id}-${index}`}
                data-action-id={index}
                className={`workflow-row ${editingIndex === index ? "active" : ""}`}
                onClick={() => onSelectAction(index)}
              >
                <div>
                  <strong>{index + 1}. {action.label}</strong>
                  <p>{action.description}</p>
                  <p className="chain-label">Next: {nextLabel}</p>
                </div>
                <button
                  className="remove-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveAction(index);
                  }}
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
