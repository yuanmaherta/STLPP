const PALETTE = [
  'bg-indigo-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-sky-500',
  'bg-purple-500',
  'bg-teal-500',
];

function colorFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

interface AvatarInitialProps {
  name?: string | null;
  size?: 'sm' | 'md';
}

export function AvatarInitial({ name, size = 'sm' }: AvatarInitialProps) {
  const label = (name ?? '?').trim();
  const initial = label.charAt(0).toUpperCase() || '?';
  const dim = size === 'sm' ? 'w-7 h-7 text-[11px]' : 'w-9 h-9 text-sm';
  return (
    <div
      className={`shrink-0 rounded-full ${colorFor(label)} ${dim} flex items-center justify-center font-bold text-white font-display`}
      title={label}
    >
      {initial}
    </div>
  );
}
