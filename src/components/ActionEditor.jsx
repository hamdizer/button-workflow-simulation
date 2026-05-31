import React from "react";
import FieldRenderer from "./FieldRenderer";
import WORKFLOW_ACTIONS from "../workflowActions";

export default function ActionEditor({ action, editingIndex, onUpdateConfig, onUpdateNestedConfig, stepOptions, onUpdateNextStep, onUpdateBranchNextStep }) {
  if (!action) {
    return (
      <div className="editor-empty">
        <p>Select a workflow step to configure its settings.</p>
      </div>
    );
  }

  if (action.id === "action_conditional") {
    const config = action.config;
    return (
      <div className="editor-section">
        <h3>{action.label}</h3>
        <div className="field-row">
          <label>Condition field</label>
          <select
            value={config.conditionField}
            onChange={(e) => onUpdateConfig(editingIndex, "conditionField", e.target.value)}
          >
            <option value="PageURL">Page URL</option>
            <option value="UserName">User Name</option>
            <option value="UserEmail">User Email</option>
            <option value="Timestamp">Timestamp</option>
            <option value="IPAddress">IP Address</option>
          </select>
        </div>
        <div className="field-row">
          <label>Operator</label>
          <select
            value={config.conditionOperator}
            onChange={(e) => onUpdateConfig(editingIndex, "conditionOperator", e.target.value)}
          >
            <option value="contains">contains</option>
            <option value="equals">equals</option>
            <option value="is empty">is empty</option>
            <option value="is not empty">is not empty</option>
          </select>
        </div>
        <div className="field-row">
          <label>Condition value</label>
          <input
            value={config.conditionValue}
            onChange={(e) => onUpdateConfig(editingIndex, "conditionValue", e.target.value)}
            placeholder="Enter a condition value"
          />
        </div>
        <div className="field-row">
          <label>True branch</label>
          <select
            value={config.thenAction}
            onChange={(e) => onUpdateConfig(editingIndex, "thenAction", e.target.value)}
          >
            <option>Send Confirmation Email</option>
            <option>Store Data in Database</option>
            <option>Send Slack Message</option>
          </select>
        </div>
        <div className="field-row">
          <label>True branch message</label>
          <textarea
            rows={3}
            value={config.thenMessage}
            onChange={(e) => onUpdateConfig(editingIndex, "thenMessage", e.target.value)}
            placeholder="Message used when the condition is true..."
          />
        </div>
        <div className="field-row">
          <label>False branch</label>
          <select
            value={config.elseAction}
            onChange={(e) => onUpdateConfig(editingIndex, "elseAction", e.target.value)}
          >
            <option>No action</option>
            <option>Send Slack Message</option>
          </select>
        </div>
        <div className="field-row">
          <label>False branch message</label>
          <textarea
            rows={3}
            value={config.elseMessage}
            onChange={(e) => onUpdateConfig(editingIndex, "elseMessage", e.target.value)}
            placeholder="Message used when the condition is false..."
          />
        </div>
        <div className="field-row">
          <label>Next step when true</label>
          <select
            value={config.thenNextStep ?? ""}
            onChange={(e) => onUpdateBranchNextStep(editingIndex, "thenNextStep", e.target.value)}
          >
            {stepOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field-row">
          <label>Next step when false</label>
          <select
            value={config.elseNextStep ?? ""}
            onChange={(e) => onUpdateBranchNextStep(editingIndex, "elseNextStep", e.target.value)}
          >
            {stepOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-section">
      <h3>{action.label}</h3>
      {Object.entries(action.config).map(([fieldKey, value]) => {
        const fieldSchema = WORKFLOW_ACTIONS.find((def) => def.id === action.id)?.configSchema[fieldKey];
        if (!fieldSchema) return null;

        return (
          <div key={fieldKey} className="field-row">
            <label>{fieldKey}</label>
            <FieldRenderer
              actionIndex={editingIndex}
              fieldKey={fieldKey}
              fieldSchema={fieldSchema}
              value={value}
              onChange={(field, newValue) => onUpdateConfig(editingIndex, field, newValue)}
              updateNestedConfig={onUpdateNestedConfig}
            />
          </div>
        );
      })}
      <div className="field-row">
        <label>Next step</label>
        <select
          value={action.nextActionIndex ?? ""}
          onChange={(e) => onUpdateNextStep(editingIndex, e.target.value)}
        >
          {stepOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
