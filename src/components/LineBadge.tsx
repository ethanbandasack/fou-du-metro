import { lineColors } from '@/domain/lines';

/** Line id on its official color; long ids (TER, VAL) become a pill. */
export function LineBadge({ id, className = '' }: { id: string; className?: string }) {
  const { background, text } = lineColors(id);
  const isLong = id.length > 4;
  return (
    <span
      className={`inline-flex items-center justify-center text-[10px] font-black font-parisine shrink-0 ${
        isLong ? 'px-2 h-6 min-w-[3rem]' : 'w-6 h-6'
      } ${className}`}
      style={{ backgroundColor: background, color: text }}
    >
      {id}
    </span>
  );
}
