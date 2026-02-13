import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getBorderColorClass = (colorClass: string | null | undefined): string => {
  if (!colorClass) return 'border-l-purple-500';
  
  const colorMap: { [key: string]: string } = {
    'bg-red-600': 'border-l-red-600',
    'bg-rose-400': 'border-l-rose-400',
    'bg-orange-500': 'border-l-orange-500',
    'bg-yellow-400': 'border-l-yellow-400',
    'bg-emerald-400': 'border-l-emerald-400',
    'bg-green-700': 'border-l-green-700',
    'bg-sky-500': 'border-l-sky-500',
    'bg-blue-600': 'border-l-blue-600',
    'bg-indigo-400': 'border-l-indigo-400',
    'bg-purple-600': 'border-l-purple-600',
    'bg-purple-500': 'border-l-purple-500',
    'bg-neutral-600': 'border-l-neutral-600',
  };
  
  return colorMap[colorClass] || 'border-l-purple-500';
};