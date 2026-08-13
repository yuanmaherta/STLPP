import { LucideIcon, Construction } from 'lucide-react';

interface ComingSoonProps {
  title: string;
  description: string;
  icon?: LucideIcon;
}

export function ComingSoon({ title, description, icon: Icon = Construction }: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24 px-6 bg-white rounded-xl border border-dashed border-slate-300">
      <div className="p-4 bg-slate-100 text-slate-400 rounded-full mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h2 className="text-lg font-bold text-slate-800">{title}</h2>
      <p className="text-sm text-slate-500 mt-1 max-w-md">{description}</p>
      <span className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200">
        Halaman ini belum dibangun
      </span>
    </div>
  );
}
