const substituteVariables = (text, context) => {
  if (typeof text !== "string") return text;
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => context[key] ?? `{{${key}}}`);
};

const formatPayload = (payload, context) => {
  if (!Array.isArray(payload)) return payload;
  return payload
    .filter((entry) => entry.key)
    .map((entry) => `${entry.key}: ${substituteVariables(entry.value, context)}`)
    .join(", ");
};

const evaluateCondition = (config, context) => {
  const fieldValue = String(context[config.conditionField] || "");
  const candidate = substituteVariables(config.conditionValue || "", context);
  switch (config.conditionOperator) {
    case "contains":
      return fieldValue.toLowerCase().includes(candidate.toLowerCase());
    case "equals":
      return fieldValue.toLowerCase() === candidate.toLowerCase();
    case "is empty":
      return fieldValue.trim() === "";
    case "is not empty":
      return fieldValue.trim() !== "";
    default:
      return false;
  }
};

const runAction = async (action, context) => {
  const { id, label, config } = action;
  switch (id) {
    case "action_send_email":
      return `Email sent to ${substituteVariables(config.recipients, context)} with subject "${substituteVariables(config.subject, context)}"`;
    case "action_store_data": {
      const payload = formatPayload(config.payload, context);
      return `${config.actionType} ${config.tableName} record with ${payload}`;
    }
    case "action_api_call":
      return `API ${config.method} request to ${substituteVariables(config.endpointUrl, context)}`;
    case "action_update_crm":
      return `CRM update for ${config.objectType} using ${substituteVariables(config.recordId, context)}`;
    case "action_store_file":
      return `Stored file at ${substituteVariables(config.filePath, context)} in bucket ${config.bucketName}`;
    case "action_send_slack":
      return `Slack message to ${config.channel}: ${substituteVariables(config.message, context)}`;
    case "action_conditional": {
      const result = evaluateCondition(config, context);
      const branch = result ? "true" : "false";
      let branchLog = `Condition (${config.conditionField} ${config.conditionOperator} ${config.conditionValue}) is ${result ? "true" : "false"}`;
      const branchAction = result ? config.thenAction : config.elseAction;
      const branchMessage = result ? config.thenMessage : config.elseMessage;
      if (!branchAction || branchAction === "No action") {
        return `${branchLog}, no branch action executed.`;
      }
      if (branchAction === "Send Confirmation Email") {
        return `${branchLog}, sending email: ${substituteVariables(branchMessage || "No message", context)}`;
      }
      if (branchAction === "Store Data in Database") {
        return `${branchLog}, storing data: ${substituteVariables(branchMessage || "No payload specified", context)}`;
      }
      if (branchAction === "Send Slack Message") {
        return `${branchLog}, Slack message: ${substituteVariables(branchMessage || "No message", context)}`;
      }
      return `${branchLog}, executed ${branchAction}.`;
    }
    default:
      return `Mock action ${label} executed.`;
  }
};

export const runWorkflow = async (workflow, context = {}) => {
  const runContext = { ...context };
  const logs = [];
  let index = 0;

  while (index !== null && index < workflow.actions.length) {
    const action = workflow.actions[index];
    logs.push(`${index + 1}. ${await runAction(action, runContext)}`);

    if (action.id === "action_conditional") {
      const branch = evaluateCondition(action.config, runContext) ? "thenNextStep" : "elseNextStep";
      const branchTarget = action.config[branch];
      if (branchTarget !== null && branchTarget !== undefined) {
        index = branchTarget;
        continue;
      }
    }

    if (action.nextActionIndex !== null && action.nextActionIndex !== undefined) {
      index = action.nextActionIndex;
    } else {
      index += 1;
    }
  }

  return logs;
};
