// Small form controls shared by the planner panels. Edits apply live (onChange) and
// are committed to undo history / storage when the edit ends (onCommit).
import { useRef, useState, type CSSProperties, type ReactNode } from 'react';

interface NumInputProps {
  value: number;
  onChange: (v: number) => void;
  onCommit?: () => void;
  step?: number;
  min?: number;
  max?: number;
  style?: CSSProperties;
  title?: string;
}

// Keeps its own text so a half-typed value ("-", "1.") isn't clobbered by the parsed number.
export function NumInput({ value, onChange, onCommit, ...rest }: NumInputProps) {
  const [text, setText] = useState(String(value));
  const [prev, setPrev] = useState(value);
  if (value !== prev) {                 // changed from outside (drag, undo, …)
    setPrev(value);
    if ((parseFloat(text) || 0) !== value) setText(String(value));
  }
  return (
    <input type="number" value={text} {...rest}
      onChange={e => { setText(e.target.value); onChange(parseFloat(e.target.value) || 0); }}
      onBlur={onCommit} />
  );
}

export function NumField({ label, ...props }: NumInputProps & { label: ReactNode }) {
  return <label className="np-fld">{label}<NumInput {...props} /></label>;
}

interface TextInputProps {
  value: string;
  onChange: (v: string) => void;
  onCommit?: () => void;
  placeholder?: string;
  style?: CSSProperties;
  title?: string;
}

export function TextInput({ value, onChange, onCommit, ...rest }: TextInputProps) {
  return <input type="text" value={value} {...rest} onChange={e => onChange(e.target.value)} onBlur={onCommit} />;
}

export function Check({ label, checked, onChange, title }: {
  label: ReactNode; checked: boolean; onChange: (v: boolean) => void; title?: string;
}) {
  return (
    <label className="np-chk" title={title}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} /> {label}
    </label>
  );
}

export function Seg<T extends string>({ options, value, onChange, style }: {
  options: { value: T; label: ReactNode }[]; value: T; onChange: (v: T) => void; style?: CSSProperties;
}) {
  return (
    <div className="np-seg" style={style}>
      {options.map(o => (
        <button key={o.value} type="button" className={o.value === value ? 'np-on' : ''}
          onClick={e => { e.stopPropagation(); onChange(o.value); }}>{o.label}</button>
      ))}
    </div>
  );
}

export function Range({ value, onChange, onCommit, ...rest }: {
  value: number; onChange: (v: number) => void; onCommit?: () => void;
  min: number; max: number; step?: number; disabled?: boolean; className?: string; style?: CSSProperties;
}) {
  return (
    <input type="range" value={value} {...rest}
      onChange={e => onChange(+e.target.value)} onPointerUp={onCommit} onKeyUp={onCommit} />
  );
}

// a link-styled button that opens a hidden file picker
export function FileLink({ accept, onFile, children, asButton }: {
  accept: string; onFile: (f: File) => void; children: ReactNode; asButton?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <>
      {asButton
        ? <button type="button" className="np-sm" onClick={() => input.current?.click()}>{children}</button>
        : <a className="np-filelbl" onClick={() => input.current?.click()}>{children}</a>}
      <input ref={input} type="file" accept={accept} hidden
        onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ''; }} />
    </>
  );
}

export function Card({ title, pill, children, className }: {
  title: ReactNode; pill?: ReactNode; children: ReactNode; className?: string;
}) {
  return (
    <div className={'np-card' + (className ? ' ' + className : '')}>
      <h2>{title}{pill != null && pill !== '' && <> <span className="np-pill">{pill}</span></>}</h2>
      {children}
    </div>
  );
}
