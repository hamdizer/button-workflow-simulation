import React from "react";

export default function ActionLibrary({ searchTerm, onSearchTermChange, actions, onAddAction }) {
  return (
    <section className="panel-column">
      <div className="section-header">
        <strong>Action Workflow</strong>
      </div>
      <input
        type="text"
        className="search-input"
        placeholder="Search actions by name or purpose..."
        value={searchTerm}
        onChange={(e) => onSearchTermChange(e.target.value)}
      />
      <div className="action-list">
        {actions.map((action) => (
          <button key={action.id} className="action-card" onClick={() => onAddAction(action)}>
            <div className="action-title">{action.label}</div>
            <p className="action-desc">{action.description}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
