import React from "react";

export default function FieldRenderer({ actionIndex, fieldKey, fieldSchema, value, onChange, updateNestedConfig }) {
  const sharedProps = {
    value: value || "",
    onChange: (e) => onChange(fieldKey, e.target.value),
    className: "field-input"
  };

  if (fieldSchema.type === "select") {
    return (
      <select {...sharedProps}>
        {fieldSchema.options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  if (fieldSchema.type === "textarea" || fieldSchema.type === "json_editor") {
    return <textarea {...sharedProps} rows={4} placeholder={fieldSchema.placeholder || ""} />;
  }

  if (fieldSchema.type === "keyValuePairs") {
    return (
      <div className="keyvalue-pairs">
        {(value || []).map((pair, pairIndex) => (
          <div key={pairIndex} className="pair-row">
            <input
              className="field-input"
              placeholder="key"
              value={pair.key}
              onChange={(e) => {
                const nextPairs = [...value];
                nextPairs[pairIndex] = { ...nextPairs[pairIndex], key: e.target.value };
                onChange(fieldKey, nextPairs);
              }}
            />
            <input
              className="field-input"
              placeholder="value"
              value={pair.value}
              onChange={(e) => {
                const nextPairs = [...value];
                nextPairs[pairIndex] = { ...nextPairs[pairIndex], value: e.target.value };
                onChange(fieldKey, nextPairs);
              }}
            />
            <button
              type="button"
              className="small-button"
              onClick={() => {
                const nextPairs = value.filter((_, i) => i !== pairIndex);
                onChange(fieldKey, nextPairs);
              }}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          className="small-button"
          onClick={() => onChange(fieldKey, [...(value || []), { key: "", value: "" }])}
        >
          Add field
        </button>
      </div>
    );
  }

  if (fieldSchema.type === "nested_group") {
    return (
      <div className="nested-group">
        {Object.entries(fieldSchema.fields).map(([nestedKey, nestedSchema]) => (
          <div key={nestedKey} className="field-row">
            <label>{nestedKey}</label>
            <FieldRenderer
              actionIndex={actionIndex}
              fieldKey={nestedKey}
              fieldSchema={nestedSchema}
              value={value?.[nestedKey]}
              onChange={(childField, childValue) => updateNestedConfig(actionIndex, fieldKey, childField, childValue)}
              updateNestedConfig={updateNestedConfig}
            />
          </div>
        ))}
      </div>
    );
  }

  return <input {...sharedProps} placeholder={fieldSchema.placeholder || ""} />;
}
