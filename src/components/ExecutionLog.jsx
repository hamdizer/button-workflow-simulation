import React from "react";

export default function ExecutionLog({ log }) {
  return (
    <div className="run-log">
      <div className="section-header">
        <strong>Execution log</strong>
      </div>
      {log.length === 0 ? (
        <p className="log-empty">No executions yet. Click the button or run workflow to test it.</p>
      ) : (
        <ol>
          {log.map((entry, index) => (
            <li key={index}>{entry}</li>
          ))}
        </ol>
      )}
    </div>
  );
}
