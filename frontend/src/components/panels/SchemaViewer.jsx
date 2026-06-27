import { useEffect, useRef, useState, useCallback } from 'react';
import { FileJson, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useWorkflow } from '../../context/WorkflowContext';

export default function SchemaViewer() {
  const { schemaText, schemaError, syncGraphFromSchema } = useWorkflow();
  const [localText, setLocalText] = useState(schemaText);
  const [isDirty, setIsDirty] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null); // 'ok' | 'error' | null
  const debounceRef = useRef(null);
  const textareaRef = useRef(null);

  // Keep in sync with external graph changes (canvas → code)
  useEffect(() => {
    if (!isDirty) {
      setLocalText(schemaText);
    }
  }, [schemaText, isDirty]);

  // Debounced code → canvas sync
  const handleChange = useCallback((e) => {
    const val = e.target.value;
    setLocalText(val);
    setIsDirty(true);
    setSyncStatus(null);

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      try {
        JSON.parse(val);
        syncGraphFromSchema(val);
        setSyncStatus('ok');
        setIsDirty(false);
        setTimeout(() => setSyncStatus(null), 2000);
      } catch {
        setSyncStatus('error');
      }
    }, 700);
  }, [syncGraphFromSchema]);

  // Syntax-color tokens in a minimal way using a pre overlay
  const tokenize = (text) => {
    if (!text) return [];
    return text.split('\n').map((line, i) => {
      // Very basic JSON colorizing via regex replacement
      const html = line
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"([^"]+)"(\s*:)/g, '<span class="json-key">"$1"</span>$2')
        .replace(/:\s*"([^"]*)"/g, ': <span class="json-string">"$1"</span>')
        .replace(/:\s*(\d+)/g, ': <span class="json-number">$1</span>')
        .replace(/:\s*(true|false|null)/g, ': <span class="json-literal">$1</span>');
      return { i, html };
    });
  };

  const lines = tokenize(localText);

  return (
    <div className="schema-viewer">
      {/* Header */}
      <div className="schema-viewer__header">
        <div className="schema-viewer__title-row">
          <FileJson size={13} />
          <span className="schema-viewer__filename">workflow_schema.json</span>
          {isDirty && <span className="schema-viewer__dirty-dot" title="Unsaved changes" />}
        </div>
        <div className="schema-viewer__status">
          {syncStatus === 'ok' && (
            <span className="schema-viewer__status-ok">
              <CheckCircle2 size={11} /> Synced
            </span>
          )}
          {(syncStatus === 'error' || schemaError) && (
            <span className="schema-viewer__status-error">
              <AlertCircle size={11} /> {schemaError || 'Invalid JSON'}
            </span>
          )}
        </div>
      </div>

      {/* Editor area */}
      <div className="schema-viewer__editor">
        {/* Line numbers */}
        <div className="schema-viewer__gutter" aria-hidden="true">
          {lines.map(({ i }) => (
            <div key={i} className="schema-viewer__line-num">{i + 1}</div>
          ))}
        </div>

        {/* Syntax-highlighted overlay (read) + transparent textarea (write) */}
        <div className="schema-viewer__code-area">
          <pre
            className="schema-viewer__highlight"
            aria-hidden="true"
            dangerouslySetInnerHTML={{
              __html: lines.map(({ html }) => `<div class="schema-viewer__code-line">${html || ' '}</div>`).join(''),
            }}
          />
          <textarea
            ref={textareaRef}
            className="schema-viewer__textarea"
            value={localText}
            onChange={handleChange}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            aria-label="Workflow JSON schema editor"
          />
        </div>
      </div>
    </div>
  );
}
