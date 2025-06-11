'use client';

import { formatDistanceToNow } from 'date-fns';
import { CheckSquare, Square, User, Calendar, Paperclip, Link as LinkIcon, Tag } from 'lucide-react';

interface PropertyRendererProps {
  property: any;
}

// Color mapping for Notion colors to Tailwind classes
const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  gray: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300', border: 'border-gray-300 dark:border-gray-600' },
  brown: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-300 dark:border-amber-700' },
  orange: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-300 dark:border-orange-700' },
  yellow: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', border: 'border-yellow-300 dark:border-yellow-700' },
  green: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', border: 'border-green-300 dark:border-green-700' },
  blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-300 dark:border-blue-700' },
  purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-300 dark:border-purple-700' },
  pink: { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-700 dark:text-pink-300', border: 'border-pink-300 dark:border-pink-700' },
  red: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', border: 'border-red-300 dark:border-red-700' },
  default: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300', border: 'border-gray-300 dark:border-gray-600' }
};

function getColorClasses(color?: string) {
  return colorMap[color || 'default'] || colorMap.default;
}

function Badge({ children, color = 'gray', className = '' }: { children: React.ReactNode; color?: string; className?: string }) {
  const colors = getColorClasses(color);
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text} ${colors.border} border ${className}`}>
      {children}
    </span>
  );
}

export default function PropertyRenderer({ property }: PropertyRendererProps) {
  if (!property) return <span className="text-gray-400 dark:text-gray-600">—</span>;

  switch (property.type) {
    case 'title':
      const titleText = property.title?.[0]?.plain_text || '';
      return titleText ? (
        <span className="font-medium text-[var(--foreground)]">{titleText}</span>
      ) : (
        <span className="text-gray-400 dark:text-gray-600">Untitled</span>
      );

    case 'rich_text':
      const richText = property.rich_text?.[0]?.plain_text || '';
      return richText ? (
        <span className="text-[var(--foreground)]">{richText}</span>
      ) : (
        <span className="text-gray-400 dark:text-gray-600">—</span>
      );

    case 'number':
      return property.number !== null ? (
        <span className="font-mono text-sm">{property.number.toLocaleString()}</span>
      ) : (
        <span className="text-gray-400 dark:text-gray-600">—</span>
      );

    case 'select':
      return property.select ? (
        <Badge color={property.select.color}>
          <Tag className="w-3 h-3" />
          {property.select.name}
        </Badge>
      ) : (
        <span className="text-gray-400 dark:text-gray-600">—</span>
      );

    case 'multi_select':
      return property.multi_select?.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {property.multi_select.map((option: any, index: number) => (
            <Badge key={index} color={option.color}>
              <Tag className="w-3 h-3" />
              {option.name}
            </Badge>
          ))}
        </div>
      ) : (
        <span className="text-gray-400 dark:text-gray-600">—</span>
      );

    case 'status':
      return property.status ? (
        <Badge 
          color={property.status.color} 
          className="font-semibold"
        >
          <span className="w-2 h-2 rounded-full bg-current opacity-40" />
          {property.status.name}
        </Badge>
      ) : (
        <span className="text-gray-400 dark:text-gray-600">—</span>
      );

    case 'date':
      if (!property.date?.start) {
        return <span className="text-gray-400 dark:text-gray-600">—</span>;
      }
      const date = new Date(property.date.start);
      return (
        <span className="flex items-center gap-1.5 text-sm">
          <Calendar className="w-3.5 h-3.5 text-gray-500" />
          {date.toLocaleDateString()}
          {property.date.end && (
            <span className="text-gray-500">
              → {new Date(property.date.end).toLocaleDateString()}
            </span>
          )}
        </span>
      );

    case 'checkbox':
      return property.checkbox ? (
        <CheckSquare className="w-4 h-4 text-green-600 dark:text-green-400" />
      ) : (
        <Square className="w-4 h-4 text-gray-400 dark:text-gray-600" />
      );

    case 'url':
      return property.url ? (
        <a
          href={property.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span className="truncate max-w-xs">{property.url}</span>
        </a>
      ) : (
        <span className="text-gray-400 dark:text-gray-600">—</span>
      );

    case 'email':
      return property.email ? (
        <a
          href={`mailto:${property.email}`}
          className="text-blue-600 dark:text-blue-400 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {property.email}
        </a>
      ) : (
        <span className="text-gray-400 dark:text-gray-600">—</span>
      );

    case 'phone_number':
      return property.phone_number ? (
        <a
          href={`tel:${property.phone_number}`}
          className="text-blue-600 dark:text-blue-400 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {property.phone_number}
        </a>
      ) : (
        <span className="text-gray-400 dark:text-gray-600">—</span>
      );

    case 'people':
      return property.people?.length > 0 ? (
        <div className="flex -space-x-2">
          {property.people.slice(0, 3).map((person: any, index: number) => (
            <div
              key={index}
              className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-700 ring-2 ring-white dark:ring-gray-900"
              title={person.name || person.person?.email || 'Unknown'}
            >
              {person.avatar_url ? (
                <img
                  src={person.avatar_url}
                  alt={person.name || ''}
                  className="w-full h-full rounded-full"
                />
              ) : (
                <User className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
              )}
            </div>
          ))}
          {property.people.length > 3 && (
            <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-800 ring-2 ring-white dark:ring-gray-900 text-xs font-medium">
              +{property.people.length - 3}
            </div>
          )}
        </div>
      ) : (
        <span className="text-gray-400 dark:text-gray-600">—</span>
      );

    case 'files':
      return property.files?.length > 0 ? (
        <div className="flex items-center gap-1">
          <Paperclip className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-sm">{property.files.length} file{property.files.length > 1 ? 's' : ''}</span>
        </div>
      ) : (
        <span className="text-gray-400 dark:text-gray-600">—</span>
      );

    case 'created_time':
      return (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {formatDistanceToNow(new Date(property.created_time), { addSuffix: true })}
        </span>
      );

    case 'last_edited_time':
      return (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {formatDistanceToNow(new Date(property.last_edited_time), { addSuffix: true })}
        </span>
      );

    case 'created_by':
    case 'last_edited_by':
      const user = property[property.type];
      return user ? (
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt="" className="w-full h-full rounded-full" />
            ) : (
              <User className="w-3 h-3 text-gray-600 dark:text-gray-400" />
            )}
          </div>
          <span className="text-sm">{user.name || user.person?.email || 'Unknown'}</span>
        </div>
      ) : (
        <span className="text-gray-400 dark:text-gray-600">—</span>
      );

    case 'formula':
      const formulaValue = property.formula;
      if (!formulaValue) return <span className="text-gray-400 dark:text-gray-600">—</span>;
      
      switch (formulaValue.type) {
        case 'string':
          return <span>{formulaValue.string || '—'}</span>;
        case 'number':
          return <span className="font-mono text-sm">{formulaValue.number?.toLocaleString() || '—'}</span>;
        case 'boolean':
          return formulaValue.boolean ? (
            <CheckSquare className="w-4 h-4 text-green-600 dark:text-green-400" />
          ) : (
            <Square className="w-4 h-4 text-gray-400 dark:text-gray-600" />
          );
        case 'date':
          return formulaValue.date?.start ? (
            <span className="text-sm">{new Date(formulaValue.date.start).toLocaleDateString()}</span>
          ) : (
            <span className="text-gray-400 dark:text-gray-600">—</span>
          );
        default:
          return <span className="text-gray-400 dark:text-gray-600">—</span>;
      }

    case 'rollup':
      const rollupValue = property.rollup;
      if (!rollupValue) return <span className="text-gray-400 dark:text-gray-600">—</span>;
      
      switch (rollupValue.type) {
        case 'number':
          return <span className="font-mono text-sm">{rollupValue.number?.toLocaleString() || '—'}</span>;
        case 'date':
          return rollupValue.date?.start ? (
            <span className="text-sm">{new Date(rollupValue.date.start).toLocaleDateString()}</span>
          ) : (
            <span className="text-gray-400 dark:text-gray-600">—</span>
          );
        case 'array':
          return (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {rollupValue.array?.length || 0} items
            </span>
          );
        default:
          return <span className="text-gray-400 dark:text-gray-600">—</span>;
      }

    case 'relation':
      return property.relation?.length > 0 ? (
        <div className="flex items-center gap-1">
          <LinkIcon className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-sm">{property.relation.length} linked</span>
        </div>
      ) : (
        <span className="text-gray-400 dark:text-gray-600">—</span>
      );

    default:
      return <span className="text-gray-400 dark:text-gray-600">—</span>;
  }
}