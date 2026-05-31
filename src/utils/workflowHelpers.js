export const getDefaultFieldValue = (field) => {
  if (field.type === "select") return field.defaultValue || field.options?.[0] || "";
  if (field.type === "keyValuePairs") return field.defaultValue || [{ key: "", value: "" }];
  if (field.type === "nested_group") {
    const nested = {};
    if (field.fields) {
      Object.entries(field.fields).forEach(([key, value]) => {
        nested[key] = getDefaultFieldValue(value);
      });
    }
    return nested;
  }
  return field.defaultValue || "";
};

export const buildDefaultConfig = (schema) => {
  const config = {};
  Object.entries(schema).forEach(([key, field]) => {
    config[key] = getDefaultFieldValue(field);
  });
  return config;
};

export const createActionInstance = (actionDef) => {
  const config = buildDefaultConfig(actionDef.configSchema);
  if (actionDef.id === "action_conditional") {
    config.thenNextStep = null;
    config.elseNextStep = null;
  }

  return {
    id: actionDef.id,
    label: actionDef.label,
    description: actionDef.description,
    config,
    nextActionIndex: null
  };
};

export const isEmptyWorkflow = (workflow) => !workflow || !workflow.actions?.length;

export const filterWorkflowActions = (actions, query) => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return actions;

  return actions.filter((action) =>
    action.label.toLowerCase().includes(normalized) ||
    action.description.toLowerCase().includes(normalized) ||
    action.type.toLowerCase().includes(normalized)
  );
};
