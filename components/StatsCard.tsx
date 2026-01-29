import Link from 'next/link';
import { LucideIcon, ArrowUpRight } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  subtext?: string;
  href?: string;
  loading?: boolean;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  iconColor,
  subtext,
  href,
  loading = false,
}: StatsCardProps) {
  const content = (
    <div
      className={`bg-white rounded-3xl shadow-sm border border-gray-100 p-6 transition-all duration-300 ${
        href ? 'hover:shadow-md hover:border-gray-200 cursor-pointer group' : ''
      }`}
    >
      {loading ? (
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-gray-100 rounded-full" />
            <div className="h-8 w-8 bg-gray-100 rounded-full" />
          </div>
          <div className="h-8 bg-gray-100 rounded-lg w-24 mb-2" />
          <div className="h-4 bg-gray-100 rounded w-20 mb-3" />
          {subtext && <div className="h-3 bg-gray-100 rounded w-32" />}
        </div>
      ) : (
        <>
          {/* Top row - Icon and Arrow */}
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
              <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>
            {href && (
              <div className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center group-hover:border-[#8a6ae8] group-hover:bg-[#8a6ae8]/5 transition-colors">
                <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-[#8a6ae8] transition-colors" />
              </div>
            )}
          </div>

          {/* Value */}
          <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>

          {/* Title */}
          <p className="text-sm text-gray-500 mb-2">{title}</p>

          {/* Subtext with indicator */}
          {subtext && (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#8a6ae8]" />
              <p className="text-xs text-gray-400">{subtext}</p>
            </div>
          )}
        </>
      )}
    </div>
  );

  if (href && !loading) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
