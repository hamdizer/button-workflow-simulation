import { useState, useEffect } from "react";
import "./App.css";
import WORKFLOW_ACTIONS from "./workflowActions";
import { runWorkflow } from "./lib/runner";
import {
  createActionInstance,
  filterWorkflowActions,
  isEmptyWorkflow
} from "./utils/workflowHelpers";
import ActionLibrary from "./components/ActionLibrary";
import WorkflowSteps from "./components/WorkflowSteps";
import ActionEditor from "./components/ActionEditor";
import ExecutionLog from "./components/ExecutionLog";

const BUTTON_ID = "button1";
const MOCK_CONTEXT = {
  Timestamp: new Date().toISOString(),
  UserName: "Jane Doe",
  UserEmail: "jane.doe@example.com",
  PageURL: "https://app.example.com/form",
  IPAddress: "198.51.100.23"
};

const LABELS = {
  trigger: "On Click (predefined)",
  editorHint: "Select an action to configure it. When ready, run the workflow or click the button again to test.",
  actionSearch: "Search actions by name or purpose..."
};

export default function App() {
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);
  const [workflow, setWorkflow] = useState({ trigger: "On Click", actions: [] });
  const [editingIndex, setEditingIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [runLog, setRunLog] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [isRunning, setIsRunning] = useState(false);


  useEffect(() => {
    setOpen(selected === BUTTON_ID);
  }, [selected]);

  const filteredActions = filterWorkflowActions(WORKFLOW_ACTIONS, searchTerm);

  const stepOptions = workflow.actions.map((action, index) => ({
    label: `${index + 1}. ${action.label}`,
    value: String(index)
  }));

  const chainOptions = [{ label: "End workflow", value: "" }, ...stepOptions];

  const addAction = (actionDef) => {
    setWorkflow((prev) => {
      const nextActions = [...prev.actions];
      const nextAction = createActionInstance(actionDef);
      if (nextActions.length > 0) {
        nextActions[nextActions.length - 1] = {
          ...nextActions[nextActions.length - 1],
          nextActionIndex: nextActions.length
        };
      }
      nextActions.push(nextAction);
      setEditingIndex(nextActions.length - 1);
      return { ...prev, actions: nextActions };
    });
    setFeedback(`${actionDef.label} added to workflow.`);
  };

  const updateActionConfig = (index, field, value) => {
    setWorkflow((prev) => {
      const next = [...prev.actions];
      next[index] = { ...next[index], config: { ...next[index].config, [field]: value } };
      return { ...prev, actions: next };
    });
  };

  const updateNestedConfig = (index, parentField, childField, value) => {
    setWorkflow((prev) => {
      const next = [...prev.actions];
      const config = { ...next[index].config };
      config[parentField] = { ...config[parentField], [childField]: value };
      next[index] = { ...next[index], config };
      return { ...prev, actions: next };
    });
  };

  const updateActionNextStep = (index, nextIndex) => {
    setWorkflow((prev) => {
      const next = [...prev.actions];
      next[index] = { ...next[index], nextActionIndex: nextIndex === "" ? null : Number(nextIndex) };
      return { ...prev, actions: next };
    });
  };

  const updateConditionalBranchNext = (index, branch, nextIndex) => {
    setWorkflow((prev) => {
      const next = [...prev.actions];
      const config = { ...next[index].config };
      config[branch] = nextIndex === "" ? null : Number(nextIndex);
      next[index] = { ...next[index], config };
      return { ...prev, actions: next };
    });
  };

  const removeAction = (index) => {
    const adjustIndex = (value) => {
      if (value === null || value === undefined) return null;
      if (value === index) return null;
      return value > index ? value - 1 : value;
    };

    setWorkflow((prev) => {
      const next = prev.actions.filter((_, i) => i !== index).map((action) => {
        const updatedAction = { ...action };
        updatedAction.nextActionIndex = adjustIndex(updatedAction.nextActionIndex);
        if (updatedAction.id === "action_conditional") {
          const config = { ...updatedAction.config };
          config.thenNextStep = adjustIndex(config.thenNextStep);
          config.elseNextStep = adjustIndex(config.elseNextStep);
          updatedAction.config = config;
        }
        return updatedAction;
      });
      return { ...prev, actions: next };
    });

    setEditingIndex((current) => (current === index ? null : current > index ? current - 1 : current));
    setFeedback("Action removed.");
  };

  const handleRunWorkflow = async () => {
    if (isEmptyWorkflow(workflow)) {
      setFeedback("Add at least one action before running the workflow.");
      return;
    }

    setIsRunning(true);
    try {
      const result = await runWorkflow(workflow, MOCK_CONTEXT);
      setRunLog(result);
      setFeedback("Workflow ran successfully.");
    } finally {
      setIsRunning(false);
    }
  };


  const handleButtonClick = () => {
    if (!open) {
      setSelected(BUTTON_ID);
      return;
    }
    handleRunWorkflow();
  };

  return (
    <div className="layout">
      <div className="main-panel">
        <div className="button-card">
          <button className={`cb ${selected === BUTTON_ID ? "sel" : ""}`} onClick={handleButtonClick}>
            Click me
          </button>
          <p className="hint">Click the button to select it, then configure backend actions in the panel.</p>
          {workflow.actions.length > 0 ? (
            <div className="workflow-status">
              <strong>Workflow steps:</strong> {workflow.actions.length}
            </div>
          ) : (
            <div className="workflow-status empty">No actions added yet.</div>
          )}
        </div>
      </div>

      {open ? (
        <div className="insp">
          <div className="insp-h">
            <div>
              <div className="insp-t">{`Define Backend Actions for '${BUTTON_ID}'`}</div>
              <div className="subheading">Trigger: {LABELS.trigger}</div>
            </div>
            <button className="insp-x" onClick={() => setSelected(null)}>
              ×
            </button>
          </div>

          <div className="insp-b">
            <div className="panel-grid">
              <ActionLibrary
                searchTerm={searchTerm}
                onSearchTermChange={setSearchTerm}
                actions={filteredActions}
                onAddAction={addAction}
              />

              <section className="panel-column">
                <div className="section-header">
                  <strong>Workflow steps</strong>
                </div>
                {workflow.actions.length === 0 ? (
                  <div className="empty-state">
                    <p>Add one or more actions here to define what happens when the button is clicked.</p>
                  </div>
                ) : (
                  <WorkflowSteps
                    actions={workflow.actions}
                    editingIndex={editingIndex}
                    isRunning={isRunning}
                    onSelectAction={setEditingIndex}
                    onRemoveAction={removeAction}
                  />

                )}

                <div className="editor-panel">
                  <ActionEditor
                    action={workflow.actions[editingIndex]}
                    editingIndex={editingIndex}
                    onUpdateConfig={updateActionConfig}
                    onUpdateNestedConfig={updateNestedConfig}
                    stepOptions={chainOptions.filter((option) => option.value !== String(editingIndex))}
                    onUpdateNextStep={updateActionNextStep}
                    onUpdateBranchNextStep={updateConditionalBranchNext}
                  />
                </div>
              </section>
            </div>
          </div>

          <div className="insp-footer">
            <button className="primary-button" onClick={handleRunWorkflow}>
              Run workflow
            </button>
            <div className="feedback">{feedback}</div>
          </div>

          <ExecutionLog log={runLog} />
        </div>
      ) : null}
    </div>
  );
}
