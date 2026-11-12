import type { LucideIcon } from 'lucide-react';

interface ToolbarButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  /** Toggle state; omit for a plain action. */
  active?: boolean;
  disabled?: boolean;
  /** Keep the label visible on phones too. */
  alwaysLabelled?: boolean;
  className?: string;
}

/** Square toolbar button: icon only on phones (label in the tooltip), icon and label from 640 px. */
export function ToolbarButton({ icon: Icon, label, onClick, active, disabled, alwaysLabelled, className = '' }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={`flex items-center justify-center gap-2 h-10 px-3 border border-border text-[11px] font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
        active ? 'bg-accent text-accent-foreground' : 'bg-card text-foreground hover:bg-muted'
      } ${className}`}
    >
      <Icon size={16} aria-hidden />
      <span className={alwaysLabelled ? '' : 'hidden sm:inline'}>{label}</span>
    </button>
  );
}
