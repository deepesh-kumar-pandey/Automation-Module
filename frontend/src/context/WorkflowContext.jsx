import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';

const WorkflowContext = createContext(null);

// ─── Default node shapes ──────────────────────────────────────────────────────
const makeId = () => `node_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

const DEFAULT_NODES = [
  {
    id: 'start_1',
    type: 'startEnd',
    position: { x: 180, y: 80 },
    data: {
      label: 'START',
      nodeKind: 'START',
      schedule: '0 9 * * 1-5',
      timeout_ms: 0,
    },
  },
  {
    id: 'parser_1',
    type: 'parser',
    position: { x: 420, y: 200 },
    data: {
      label: 'JSON Parser',
      nodeKind: 'PARSER',
      timeout_ms: 5000,
      command: '',
    },
  },
  {
    id: 'worker_1',
    type: 'worker',
    position: { x: 680, y: 200 },
    data: {
      label: 'Worker Thread',
      nodeKind: 'WORKER',
      timeout_ms: 30000,
      command: '',
    },
  },
  {
    id: 'end_1',
    type: 'startEnd',
    position: { x: 920, y: 80 },
    data: {
      label: 'END',
      nodeKind: 'END',
      timeout_ms: 0,
    },
  },
];

const DEFAULT_EDGES = [
  { id: 'e_start_parser', source: 'start_1', target: 'parser_1', animated: true },
  { id: 'e_parser_worker', source: 'parser_1', target: 'worker_1', animated: true },
  { id: 'e_worker_end', source: 'worker_1', target: 'end_1', animated: true },
];

// ─── Schema compiler ──────────────────────────────────────────────────────────
function compileSchema(nodes, edges, workflowMeta) {
  const startNode = nodes.find((n) => n.data.nodeKind === 'START');
  return {
    name: workflowMeta.name || 'Automation Workflow',
    description: workflowMeta.description || '',
    version: workflowMeta.version || '1.0',
    schedule: startNode?.data?.schedule || '',
    steps: nodes
      .filter((n) => n.data.nodeKind !== 'END')
      .map((n) => ({
        id: n.id,
        type: n.data.nodeKind?.toLowerCase() || 'shell',
        label: n.data.label,
        command: n.data.command || '',
        ...(n.data.timeout_ms > 0 ? { timeout_ms: n.data.timeout_ms } : {}),
        ...(n.data.script ? { script: n.data.script } : {}),
      })),
    connections: edges.map((e) => ({ from: e.source, to: e.target })),
  };
}

// ─── Schema parser (JSON → nodes/edges) ──────────────────────────────────────
function parseSchemaToGraph(schema, existingNodes = []) {
  if (!schema?.steps) return null;

  const nodeKindMap = { shell: 'WORKER', parser: 'PARSER', security: 'SECURITY', start: 'START', end: 'END' };
  const typeMap = { START: 'startEnd', END: 'startEnd', PARSER: 'parser', WORKER: 'worker', SECURITY: 'security', CUSTOM: 'custom' };

  const nodes = schema.steps.map((step, i) => {
    const kind = nodeKindMap[step.type?.toLowerCase()] || 'WORKER';
    const existingNode = existingNodes.find((n) => n.id === step.id);
    return {
      id: step.id || makeId(),
      type: typeMap[kind] || 'worker',
      position: existingNode ? existingNode.position : { x: 180 + i * 240, y: 160 },
      data: {
        label: step.label || step.type,
        nodeKind: kind,
        command: step.command || '',
        script: step.script || '',
        timeout_ms: step.timeout_ms || 0,
        schedule: step.schedule || schema.schedule || '',
      },
    };
  });

  const edges = (schema.connections || []).map((c, i) => ({
    id: `e_${i}_${c.from}_${c.to}`,
    source: c.from,
    target: c.to,
    animated: true,
  }));

  return { nodes, edges };
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function WorkflowProvider({ children }) {
  const [nodes, setNodes] = useState(DEFAULT_NODES);
  const [edges, setEdges] = useState(DEFAULT_EDGES);
  const nodesRef = useRef(nodes);
  useEffect(() => { nodesRef.current = nodes; }, [nodes]);

  const [selectedNode, setSelectedNode] = useState(null);
  const [workflowMeta, setWorkflowMeta] = useState({
    name: 'Default Workflow Schema',
    description: 'A default automation workflow with multiple shell tasks',
    version: '1.0',
  });
  const [schemaText, setSchemaText] = useState('');
  const [schemaError, setSchemaError] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeView, setActiveView] = useState('workflows');

  // ─── Saved Workflows (localStorage) ───────────────────────────────────────
  const readSavedWorkflows = () => {
    try {
      const wfs = localStorage.getItem('ae_saved_workflows');
      return wfs ? JSON.parse(wfs) : {};
    } catch {
      return {};
    }
  };

  const [savedWorkflows, setSavedWorkflows] = useState(readSavedWorkflows);

  // Refresh when storage changes (e.g. delete from modal)
  useEffect(() => {
    const onStorage = () => setSavedWorkflows(readSavedWorkflows());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Suppress canvas→code→canvas loop
  const codeUpdateRef = useRef(false);

  // ─── Canvas → Code sync ────────────────────────────────────────────────
  const syncSchemaFromGraph = useCallback((currentNodes, currentEdges, meta) => {
    if (codeUpdateRef.current) return;
    const schema = compileSchema(currentNodes, currentEdges, meta || workflowMeta);
    setSchemaText(JSON.stringify(schema, null, 2));
    setSchemaError(null);
  }, [workflowMeta]);

  // ─── Code → Canvas sync ────────────────────────────────────────────────
  const syncGraphFromSchema = useCallback((jsonText) => {
    setSchemaText(jsonText);
    try {
      const parsed = JSON.parse(jsonText);
      setSchemaError(null);
      const result = parseSchemaToGraph(parsed, nodesRef.current);
      if (result) {
        codeUpdateRef.current = true;
        setNodes(result.nodes);
        setEdges(result.edges);
        setWorkflowMeta({
          name: parsed.name,
          description: parsed.description,
          version: parsed.version,
        });
        setTimeout(() => { codeUpdateRef.current = false; }, 100);
      }
    } catch {
      setSchemaError('Invalid JSON — fix syntax errors to sync graph.');
    }
  }, []);

  // ─── Node/Edge change handlers ──────────────────────────────────────────
  const onNodesChange = useCallback((changes) => {
    setNodes((nds) => {
      const updated = applyNodeChanges(changes, nds);
      syncSchemaFromGraph(updated, edges);
      return updated;
    });
  }, [edges, syncSchemaFromGraph]);

  const onEdgesChange = useCallback((changes) => {
    setEdges((eds) => {
      const updated = applyEdgeChanges(changes, eds);
      syncSchemaFromGraph(nodes, updated);
      return updated;
    });
  }, [nodes, syncSchemaFromGraph]);

  const onConnect = useCallback((connection) => {
    setEdges((eds) => {
      const updated = addEdge({ ...connection, animated: true }, eds);
      syncSchemaFromGraph(nodes, updated);
      return updated;
    });
  }, [nodes, syncSchemaFromGraph]);

  // ─── Node data update ───────────────────────────────────────────────────
  const updateNodeData = useCallback((nodeId, patch) => {
    setNodes((nds) => {
      const updated = nds.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...patch } } : n
      );
      syncSchemaFromGraph(updated, edges);
      setSelectedNode((prev) => (prev?.id === nodeId ? { ...prev, data: { ...prev.data, ...patch } } : prev));
      return updated;
    });
  }, [edges, syncSchemaFromGraph]);

  // ─── Drop new node onto canvas ──────────────────────────────────────────
  const addNode = useCallback((nodeKind, position) => {
    const kindTypeMap = {
      START: 'startEnd', END: 'startEnd',
      PARSER: 'parser', WORKER: 'worker',
      SECURITY: 'security', CUSTOM: 'custom',
    };
    const labelMap = {
      START: 'START', END: 'END',
      PARSER: 'Parser', WORKER: 'Worker',
      SECURITY: 'Security Gate', CUSTOM: 'Custom Command',
    };
    const newNode = {
      id: makeId(),
      type: kindTypeMap[nodeKind] || 'worker',
      position,
      data: {
        label: labelMap[nodeKind] || nodeKind,
        nodeKind,
        command: '',
        script: '',
        timeout_ms: 5000,
        schedule: '',
      },
    };
    setNodes((nds) => {
      const updated = [...nds, newNode];
      syncSchemaFromGraph(updated, edges);
      return updated;
    });
  }, [edges, syncSchemaFromGraph]);

  // ─── Delete selected node ───────────────────────────────────────────────
  const deleteNode = useCallback((nodeId) => {
    setNodes((nds) => {
      const updated = nds.filter((n) => n.id !== nodeId);
      syncSchemaFromGraph(updated, edges);
      return updated;
    });
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    setSelectedNode(null);
  }, [edges, syncSchemaFromGraph]);

  // ─── Initial schema compile ─────────────────────────────────────────────
  const initSchema = useCallback(() => {
    syncSchemaFromGraph(nodes, edges, workflowMeta);
  }, [nodes, edges, workflowMeta, syncSchemaFromGraph]);

  // ─── Save current workflow to localStorage ──────────────────────────────
  const saveCurrentWorkflow = useCallback((name) => {
    if (!name) return;
    const schema = compileSchema(nodes, edges, workflowMeta);
    schema.name = name;
    const updated = { ...savedWorkflows, [name]: schema };
    setSavedWorkflows(updated);
    localStorage.setItem('ae_saved_workflows', JSON.stringify(updated));
    setWorkflowMeta((m) => ({ ...m, name }));
  }, [nodes, edges, workflowMeta, savedWorkflows]);

  // ─── Load a saved workflow ──────────────────────────────────────────────
  const loadWorkflow = useCallback((name) => {
    const schema = savedWorkflows[name];
    if (schema) {
      syncGraphFromSchema(JSON.stringify(schema, null, 2));
    }
  }, [savedWorkflows, syncGraphFromSchema]);

  // ─── Create a fresh blank workflow ──────────────────────────────────────
  const createNewWorkflow = useCallback(() => {
    const newNodes = [
      {
        id: makeId(),
        type: 'startEnd',
        position: { x: 180, y: 80 },
        data: { label: 'START', nodeKind: 'START', schedule: '', timeout_ms: 0 },
      },
      {
        id: makeId(),
        type: 'startEnd',
        position: { x: 420, y: 80 },
        data: { label: 'END', nodeKind: 'END', timeout_ms: 0 },
      },
    ];
    const newMeta = { name: 'New Workflow', description: '', version: '1.0' };
    codeUpdateRef.current = true;
    setNodes(newNodes);
    setEdges([]);
    setWorkflowMeta(newMeta);
    setSelectedNode(null);
    setTimeout(() => {
      codeUpdateRef.current = false;
      // compile schema after state settles
      const schema = compileSchema(newNodes, [], newMeta);
      setSchemaText(JSON.stringify(schema, null, 2));
    }, 100);
  }, []);

  return (
    <WorkflowContext.Provider
      value={{
        nodes, edges, selectedNode, schemaText, schemaError,
        workflowMeta, isExecuting, activeView, savedWorkflows,
        setSelectedNode, setIsExecuting, setActiveView,
        onNodesChange, onEdgesChange, onConnect,
        updateNodeData, addNode, deleteNode,
        syncGraphFromSchema, syncSchemaFromGraph, initSchema,
        saveCurrentWorkflow, loadWorkflow, createNewWorkflow,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflow() {
  const ctx = useContext(WorkflowContext);
  if (!ctx) throw new Error('useWorkflow must be used inside WorkflowProvider');
  return ctx;
}
