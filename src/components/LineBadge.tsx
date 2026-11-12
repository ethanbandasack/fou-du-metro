import { lineColors, lineShortId } from '@/domain/lines';

const SIZES = {
  sm: 'h-5 min-w-5 px-1 text-[9px]',
  md: 'h-6 min-w-6 px-1.5 text-[10px]',
};

/** Line id on its official color, as on IDFM signage; long ids are shortened (full id in the tooltip). */
export function LineBadge({ id, size = 'md', className = '' }: { id: string; size?: keyof typeof SIZES; className?: string }) {
  const { background, text } = lineColors(id);
  return (
    <span
      title={id}
      className={`inline-flex items-center justify-center font-black font-parisine leading-none shrink-0 ${SIZES[size]} ${className}`}
      style={{ backgroundColor: background, color: text }}
    >
      {lineShortId(id)}
    </span>
  );
}
