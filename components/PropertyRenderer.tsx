'use client';

import { formatDistanceToNow } from 'date-fns';
import { CheckSquare, Square, User, Calendar, Paperclip, Link as LinkIcon, Tag } from 'lucide-react';

interface PropertyRendererProps {
  property: any;
}

// Color mapping for Notion colors - more vibrant and contrasty
const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  gray: { bg: 'bg-gray-200 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-100', border: 'border-gray-400 dark:border-gray-500' },
  brown: { bg: 'bg-amber-200 dark:bg-amber-900/50', text: 'text-amber-900 dark:text-amber-100', border: 'border-amber-400 dark:border-amber-600' },
  orange: { bg: 'bg-orange-200 dark:bg-orange-900/50', text: 'text-orange-900 dark:text-orange-100', border: 'border-orange-400 dark:border-orange-600' },
  yellow: { bg: 'bg-yellow-200 dark:bg-yellow-900/50', text: 'text-yellow-900 dark:text-yellow-100', border: 'border-yellow-400 dark:border-yellow-600' },
  green: { bg: 'bg-green-200 dark:bg-green-900/50', text: 'text-green-900 dark:text-green-100', border: 'border-green-400 dark:border-green-600' },
  blue: { bg: 'bg-blue-200 dark:bg-blue-900/50', text: 'text-blue-900 dark:text-blue-100', border: 'border-blue-400 dark:border-blue-600' },
  purple: { bg: 'bg-purple-200 dark:bg-purple-900/50', text: 'text-purple-900 dark:text-purple-100', border: 'border-purple-400 dark:border-purple-600' },
  pink: { bg: 'bg-pink-200 dark:bg-pink-900/50', text: 'text-pink-900 dark:text-pink-100', border: 'border-pink-400 dark:border-pink-600' },
  red: { bg: 'bg-red-200 dark:bg-red-900/50', text: 'text-red-900 dark:text-red-100', border: 'border-red-400 dark:border-red-600' },
  default: { bg: 'bg-gray-200 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-100', border: 'border-gray-400 dark:border-gray-500' }
};

function getColorClasses(color?: string) {
  return colorMap[color || 'default'] || colorMap.default;
}

function Badge({ children, color = 'gray', className = '' }: { children: React.ReactNode; color?: string; className?: string }) {
  const colors = getColorClasses(color);
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text} ${colors.border} border-2 ${className}`}>
      {children}
    </span>
  );
}

export default function PropertyRenderer({ property, propertyName }: PropertyRendererProps & { propertyName?: string }) {
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

    case 'button':
      return (
        <button
          className="px-3 py-1 text-xs font-bold rounded-md bg-red-500 text-white border-2 border-red-600 hover:bg-red-600 hover:border-red-700 transition-all transform hover:scale-105 cursor-pointer shadow-sm hover:shadow-md"
          onClick={(e) => {
            e.stopPropagation();
            // Button properties in Notion are just visual, they don't have actions in the API
          }}
        >
          {propertyName || property.button?.name || 'Click Here'}
        </button>
      );


    default:
      console.log('Unknown property type:', property.type, property);
      return <span className="text-gray-400 dark:text-gray-600">—</span>;
  }
}