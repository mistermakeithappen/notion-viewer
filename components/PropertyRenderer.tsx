'use client';

import { formatDistanceToNow } from 'date-fns';
import { CheckSquare, Square, User, Calendar, Paperclip, Link as LinkIcon, Tag } from 'lucide-react';

interface PropertyRendererProps {
  property: any;
  item?: any; // The full item data including icon
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

export default function PropertyRenderer({ property, propertyName, item }: PropertyRendererProps & { propertyName?: string }) {
  if (!property) return <span className="text-gray-400 dark:text-gray-600">—</span>;

  switch (property.type) {
    case 'title':
      const titleText = property.title?.[0]?.plain_text || '';
      const icon = item?.icon;
      
      return (
        <div className="flex items-center gap-2">
          {icon && (
            icon.type === 'emoji' ? (
              <span className="text-lg">{icon.emoji}</span>
            ) : icon.type === 'external' ? (
              <img src={icon.external.url} alt="" className="w-5 h-5 object-cover rounded" />
            ) : icon.type === 'file' ? (
              <img src={icon.file.url} alt="" className="w-5 h-5 object-cover rounded" />
            ) : null
          )}
          {titleText ? (
            <span className="font-medium text-[var(--foreground)]">{titleText}</span>
          ) : (
            <span className="text-gray-400 dark:text-gray-600">Untitled</span>
          )}
        </div>
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
      // Log button property data for debugging
      console.log('Button property data:', property);
      
      // Define webhook URLs for each specific button
      const webhookUrls: Record<string, string> = {
        'starting to build': 'https://hook.us2.make.com/gnlcuujnjf3oitya7m821vb6bmsxxh9a',
        'order is built': 'https://hook.us2.make.com/ateli5u3xhf0t4sjtpkjjmllvkmrd8pa',
        'Fulfillment Complete': 'https://hook.us2.make.com/yu80mpi4lwbdiu4233we3we8sodzwt6a',
        'request BHS bid': '', // Add webhook URL here
      };
      
      const buttonName = propertyName || property.button?.name || 'Button';
      
      // Handle the old button name and map it to the new one
      const normalizedButtonName = buttonName === 'installation/pickup/delivery complete' 
        ? 'Fulfillment Complete' 
        : buttonName;
      
      const webhookUrl = webhookUrls[normalizedButtonName] || webhookUrls[normalizedButtonName.toLowerCase()] || '';
      
      return (
        <button
          className="px-3 py-1 text-xs font-bold rounded-md bg-red-500 text-white border-2 border-red-600 hover:bg-red-600 hover:border-red-700 transition-all transform hover:scale-105 cursor-pointer shadow-sm hover:shadow-md active:scale-95 active:shadow-inner active:bg-red-700 active:border-red-800 relative overflow-hidden"
          title={webhookUrl ? "Click to trigger webhook" : "Configure webhook URL to enable this button"}
          onClick={async (e) => {
            e.stopPropagation();
            
            // Log click event and property data
            console.log('Button clicked:', buttonName, property);
            console.log('Full item data:', item);
            
            // Add visual feedback
            const button = e.currentTarget;
            button.style.transform = 'scale(0.9)';
            
            // Create ripple effect
            const ripple = document.createElement('span');
            ripple.className = 'absolute inset-0 rounded-md';
            ripple.style.background = 'radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 70%)';
            ripple.style.animation = 'ripple-animation 0.6s ease-out';
            button.appendChild(ripple);
            
            // Special handling for "request BHS bid" button
            console.log('Checking button name:', normalizedButtonName, 'against "request BHS bid"');
            if (normalizedButtonName.toLowerCase() === 'request bhs bid') {
              // Open Jobber form in new tab
              window.open('https://clienthub.getjobber.com/client_hubs/f486317e-8be2-4170-8143-b8873af80140/public/work_request/new?source=technician', '_blank');
              
              // Visual feedback
              button.classList.add('bg-blue-500', 'border-blue-600');
              button.classList.remove('bg-red-500', 'border-red-600');
              
              const originalText = button.textContent;
              button.textContent = '✓ Opening...';
              
              setTimeout(() => {
                button.classList.remove('bg-blue-500', 'border-blue-600');
                button.classList.add('bg-red-500', 'border-red-600');
                button.textContent = originalText;
              }, 1500);
              return; // Exit early for special handling
            } else if (webhookUrl) {
              try {
                // Prepare the data payload
                const payload = {
                  buttonName: buttonName,
                  timestamp: new Date().toISOString(),
                  notionPageId: item?.id,
                  notionPageUrl: item?.url,
                  // Include all properties
                  properties: item?.properties || {},
                  // Include raw item data for maximum flexibility
                  rawData: item
                };
                
                // Send webhook
                const response = await fetch(webhookUrl, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(payload)
                });
                
                if (response.ok) {
                  // Success feedback
                  button.classList.add('bg-green-500', 'border-green-600');
                  button.classList.remove('bg-red-500', 'border-red-600');
                  
                  // Show success message
                  const originalText = button.textContent;
                  button.textContent = '✓ Sent!';
                  
                  setTimeout(() => {
                    button.classList.remove('bg-green-500', 'border-green-600');
                    button.classList.add('bg-red-500', 'border-red-600');
                    button.textContent = originalText;
                  }, 2000);
                } else {
                  throw new Error(`Webhook failed: ${response.status}`);
                }
              } catch (error) {
                console.error('Webhook error:', error);
                
                // Error feedback
                button.classList.add('bg-gray-500', 'border-gray-600');
                button.classList.remove('bg-red-500', 'border-red-600');
                
                // Show error message
                const originalText = button.textContent;
                button.textContent = '✗ Failed';
                
                setTimeout(() => {
                  button.classList.remove('bg-gray-500', 'border-gray-600');
                  button.classList.add('bg-red-500', 'border-red-600');
                  button.textContent = originalText;
                }, 2000);
                
                alert(`Failed to send webhook: ${error instanceof Error ? error.message : 'Unknown error'}`);
              }
            } else {
              alert(`Button "${normalizedButtonName}" clicked!\n\nNo webhook URL configured for this button.\n\nTo enable this button, add its webhook URL in the webhookUrls configuration.`);
            }
            
            setTimeout(() => {
              button.style.transform = '';
              ripple.remove();
            }, 600);
          }}
        >
          {normalizedButtonName || 'Click Here'}
        </button>
      );


    default:
      console.log('Unknown property type:', property.type, property);
      return <span className="text-gray-400 dark:text-gray-600">—</span>;
  }
}