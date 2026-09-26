import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';

export function Button({ className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`button ${className}`} {...props} />;
}

export function Card({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`card ${className}`} {...props} />;
}

export function PageHeader({ eyebrow, title, description, children }: {
  eyebrow: string; title: string; description: string; children?: ReactNode;
}) {
  return <div className="page-header"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p>{children}</div>;
}

export function ProgressBar({ value, label }: { value: number; label: string }) {
  const safeValue = Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));
  return <div className="progress-track" role="progressbar" aria-label={label} aria-valuenow={safeValue} aria-valuemin={0} aria-valuemax={100}>
    <div className="progress-fill" style={{ width: `${safeValue}%` }} />
  </div>;
}
