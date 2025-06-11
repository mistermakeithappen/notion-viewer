'use client';

import { format } from 'date-fns';
import { Check, X } from 'lucide-react';

interface PropertyRendererProps {
  property: any;
}

export default function PropertyRenderer({ property }: PropertyRendererProps) {
  if (!property) return <span className="text-muted-foreground">—</span>;

  switch (property.type) {
    case 'title':
      return (
        <span className="font-medium">
          {property.title[0]?.text?.content || '—'}
        </span>
      );

    case 'rich_text':
      return (
        <span>
          {property.rich_text[0]?.text?.content || '—'}
        </span>
      );

    case 'number':
      return (
        <span>
          {property.number !== null ? property.number : '—'}
        </span>
      );

    case 'select':
      return property.select ? (
        <span 
          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: property.select.color ? `var(--${property.select.color})` : 'var(--muted)',
            color: property.select.color ? `var(--${property.select.color}-foreground)` : 'var(--muted-foreground)',
          }}
        >
          {property.select.name}
        </span>
      ) : (
        <span className="text-muted-foreground">—</span>
      );

    case 'multi_select':
      return property.multi_select.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {property.multi_select.map((option: any) => (
            <span
              key={option.id}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: option.color ? `var(--${option.color})` : 'var(--muted)',
                color: option.color ? `var(--${option.color}-foreground)` : 'var(--muted-foreground)',
              }}
            >
              {option.name}
            </span>
          ))}
        </div>
      ) : (
        <span className="text-muted-foreground">—</span>
      );

    case 'date':
      return property.date ? (
        <span>
          {format(new Date(property.date.start), 'MMM d, yyyy')}
          {property.date.end && (
            <> → {format(new Date(property.date.end), 'MMM d, yyyy')}</>
          )}
        </span>
      ) : (
        <span className="text-muted-foreground">—</span>
      );

    case 'checkbox':
      return (
        <span>
          {property.checkbox ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <X className="h-4 w-4 text-muted-foreground" />
          )}
        </span>
      );

    case 'url':
      return property.url ? (
        <a
          href={property.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          {property.url}
        </a>
      ) : (
        <span className="text-muted-foreground">—</span>
      );

    case 'email':
      return property.email ? (
        <a
          href={`mailto:${property.email}`}
          className="text-primary hover:underline"
        >
          {property.email}
        </a>
      ) : (
        <span className="text-muted-foreground">—</span>
      );

    case 'phone_number':
      return property.phone_number ? (
        <a
          href={`tel:${property.phone_number}`}
          className="text-primary hover:underline"
        >
          {property.phone_number}
        </a>
      ) : (
        <span className="text-muted-foreground">—</span>
      );

    case 'files':
      return property.files.length > 0 ? (
        <div className="space-y-1">
          {property.files.map((file: any, index: number) => (
            <a
              key={index}
              href={file.file?.url || file.external?.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline text-sm block"
            >
              {file.name}
            </a>
          ))}
        </div>
      ) : (
        <span className="text-muted-foreground">—</span>
      );

    case 'created_time':
      return (
        <span className="text-sm text-muted-foreground">
          {format(new Date(property.created_time), 'MMM d, yyyy h:mm a')}
        </span>
      );

    case 'last_edited_time':
      return (
        <span className="text-sm text-muted-foreground">
          {format(new Date(property.last_edited_time), 'MMM d, yyyy h:mm a')}
        </span>
      );

    case 'created_by':
      return (
        <span className="text-sm">
          {property.created_by.name || property.created_by.id}
        </span>
      );

    case 'last_edited_by':
      return (
        <span className="text-sm">
          {property.last_edited_by.name || property.last_edited_by.id}
        </span>
      );

    default:
      return <span className="text-muted-foreground">—</span>;
  }
}