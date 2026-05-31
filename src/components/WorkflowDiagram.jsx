import React, { useEffect, useRef, useState } from "react";

export default function WorkflowDiagram({ actions, editingIndex }) {
  const containerRef = useRef(null);
  const [positions, setPositions] = useState([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const elements = containerRef.current.querySelectorAll("[data-step-index]");
    const newPositions = [];

    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      newPositions.push({
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top + rect.height
      });
    });

    setPositions(newPositions);
  }, [actions.length]);

  const calculateArrowPath = (fromY, toY) => {
    const curveAmount = 30;
    return `M 0 ${fromY} Q ${curveAmount} ${(fromY + toY) / 2} 0 ${toY}`;
  };

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 0
        }}
        width={60}
        height={positions.length > 0 ? positions[positions.length - 1].y + 200 : 0}
      >
        {actions.map((action, index) => {
          let nextIndex = action.nextActionIndex;

          if (action.id === "action_conditional") {
            const thenIndex = action.config.thenNextStep;
            const elseIndex = action.config.elseNextStep;

            return (
              <g key={`conditional-${index}`}>
                {thenIndex != null && positions[index] && positions[thenIndex] && (
                  <>
                    <path
                      d={calculateArrowPath(positions[index].y, positions[thenIndex].y)}
                      stroke="#34C759"
                      strokeWidth="2"
                      fill="none"
                    />
                    <polygon
                      points="0,-4 -4,4 4,4"
                      fill="#34C759"
                      transform={`translate(0, ${positions[thenIndex].y})`}
                    />
                    <text x="8" y={`${(positions[index].y + positions[thenIndex].y) / 2}`} fontSize="11" fill="#34C759">
                      true
                    </text>
                  </>
                )}

                {elseIndex != null && positions[index] && positions[elseIndex] && (
                  <>
                    <path
                      d={calculateArrowPath(positions[index].y, positions[elseIndex].y)}
                      stroke="#FF3B30"
                      strokeWidth="2"
                      fill="none"
                    />
                    <polygon
                      points="0,-4 -4,4 4,4"
                      fill="#FF3B30"
                      transform={`translate(0, ${positions[elseIndex].y})`}
                    />
                    <text x="8" y={`${(positions[index].y + positions[elseIndex].y) / 2}`} fontSize="11" fill="#FF3B30">
                      false
                    </text>
                  </>
                )}
              </g>
            );
          }

          if (nextIndex != null && positions[index] && positions[nextIndex]) {
            return (
              <g key={`arrow-${index}`}>
                <path
                  d={calculateArrowPath(positions[index].y, positions[nextIndex].y)}
                  stroke="#0A84FF"
                  strokeWidth="2"
                  fill="none"
                />
                <polygon
                  points="0,-4 -4,4 4,4"
                  fill="#0A84FF"
                  transform={`translate(0, ${positions[nextIndex].y})`}
                />
              </g>
            );
          }

          return null;
        })}
      </svg>

      <div style={{ position: "relative", zIndex: 1 }}>
        {actions.map((action, index) => (
          <div key={index} data-step-index={index} style={{ marginBottom: "16px" }}>
            <div
              className={`workflow-step-card ${editingIndex === index ? "active" : ""}`}
              style={{
                padding: "12px 16px",
                backgroundColor: editingIndex === index ? "#E8F0FF" : "#F8F8FB",
                border: editingIndex === index ? "2px solid #0071e3" : "1px solid #D2D2D7",
                borderRadius: "10px",
                marginLeft: "40px"
              }}
            >
              <strong style={{ fontSize: "0.95rem" }}>{index + 1}. {action.label}</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
