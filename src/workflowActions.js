

export const WORKFLOW_ACTIONS = [
  {
    id: "action_store_data",
    type: "DATABASE",
    label: "Store Data in Database",
    icon: "database-storage",
    description: "Insert, update or delete a record in a database table.",
    requiredFields: ["actionType", "tableName", "payload"],
    configSchema: {
      actionType: {
        type: "select",
        options: ["Insert Record", "Update Record", "Upsert", "Delete"],
        defaultValue: "Insert Record"
      },
      tableName: {
        type: "select",
        options: ["UserInteractions", "FormSubmissions", "ErrorLogs"],
        defaultValue: "UserInteractions"
      },
      payload: {
        type: "keyValuePairs",
        supportedVariables: ["Timestamp", "UserName", "PageURL", "IPAddress"],
        defaultValue: [
          { key: "timestamp", value: "{{Timestamp}}" },
          { key: "user", value: "{{UserName}}" }
        ]
      }
    }
  },
  {
    id: "action_send_email",
    type: "COMMUNICATION",
    label: "Send Confirmation Email",
    icon: "envelope-mail",
    description: "Dispatch an automated email with dynamic fields.",
    requiredFields: ["recipients", "subject", "body"],
    configSchema: {
      recipients: {
        type: "text",
        placeholder: "example@domain.com or {{UserEmail}}"
      },
      subject: {
        type: "text",
        placeholder: "Enter email subject line...",
        defaultValue: "Action Recorded"
      },
      body: {
        type: "textarea",
        placeholder: "Write the email body here...",
        supportsVariables: true
      },
      advanced: {
        type: "nested_group",
        fields: {
          cc: { type: "text", placeholder: "cc@domain.com" },
          replyTo: { type: "text", placeholder: "noreply@domain.com" }
        }
      }
    }
  },
  {
    id: "action_send_slack",
    type: "COMMUNICATION",
    label: "Send Slack Message",
    icon: "chat-bubble-left-right",
    description: "Post a message to a Slack channel or workspace integration.",
    requiredFields: ["channel", "message"],
    configSchema: {
      channel: {
        type: "text",
        placeholder: "#team-updates"
      },
      message: {
        type: "textarea",
        placeholder: "Write a Slack-friendly message...",
        supportsVariables: true
      }
    }
  },
  {
    id: "action_api_call",
    type: "INTEGRATION",
    label: "Trigger Webhook / API Call",
    icon: "globe-network",
    description: "Send an HTTP request to a third-party service.",
    requiredFields: ["endpointUrl", "method"],
    configSchema: {
      endpointUrl: {
        type: "text",
        placeholder: "https://api.yourdomain.com/v1/endpoint"
      },
      method: {
        type: "select",
        options: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        defaultValue: "POST"
      },
      headers: {
        type: "keyValuePairs",
        defaultValue: [
          { key: "Content-Type", value: "application/json" },
          { key: "Authorization", value: "Bearer {{SECRET_API_KEY}}" }
        ]
      },
      body: {
        type: "json_editor",
        placeholder: "{ \"status\": \"success\" }"
      }
    }
  },
  {
    id: "action_conditional",
    type: "CONDITIONAL",
    label: "Conditional Action",
    icon: "switch-vertical",
    description: "Run a different action when a condition is met.",
    requiredFields: ["conditionField", "conditionOperator", "conditionValue"],
    configSchema: {
      conditionField: {
        type: "select",
        options: ["Timestamp", "UserName", "UserEmail", "PageURL", "IPAddress"],
        defaultValue: "PageURL"
      },
      conditionOperator: {
        type: "select",
        options: ["contains", "equals", "is empty", "is not empty"],
        defaultValue: "contains"
      },
      conditionValue: {
        type: "text",
        placeholder: "E.g. /thank-you or jane@example.com"
      },
      thenAction: {
        type: "select",
        options: ["Send Confirmation Email", "Store Data in Database", "Send Slack Message"],
        defaultValue: "Send Confirmation Email"
      },
      thenMessage: {
        type: "textarea",
        placeholder: "Message used when the condition is true..."
      },
      elseAction: {
        type: "select",
        options: ["No action", "Send Slack Message"],
        defaultValue: "No action"
      },
      elseMessage: {
        type: "textarea",
        placeholder: "Message used when the condition is false..."
      }
    }
  }
];

export default WORKFLOW_ACTIONS;