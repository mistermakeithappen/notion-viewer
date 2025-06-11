'use client';

interface BlockRendererProps {
  block: any;
}

export default function BlockRenderer({ block }: BlockRendererProps) {
  const renderRichText = (richTextArray: any[]) => {
    if (!richTextArray || richTextArray.length === 0) return null;
    
    return richTextArray.map((text, index) => {
      const { annotations } = text;
      let element = text.plain_text;
      
      if (annotations.bold) {
        element = <strong key={index}>{element}</strong>;
      }
      if (annotations.italic) {
        element = <em key={index}>{element}</em>;
      }
      if (annotations.strikethrough) {
        element = <del key={index}>{element}</del>;
      }
      if (annotations.underline) {
        element = <u key={index}>{element}</u>;
      }
      if (annotations.code) {
        element = <code key={index} className="px-1 py-0.5 bg-muted rounded text-sm">{element}</code>;
      }
      
      if (text.href) {
        element = (
          <a
            key={index}
            href={text.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {element}
          </a>
        );
      }
      
      return element;
    });
  };

  switch (block.type) {
    case 'paragraph':
      return (
        <p className="mb-4">
          {renderRichText(block.paragraph.rich_text)}
        </p>
      );

    case 'heading_1':
      return (
        <h1 className="text-3xl font-bold mb-4 mt-8">
          {renderRichText(block.heading_1.rich_text)}
        </h1>
      );

    case 'heading_2':
      return (
        <h2 className="text-2xl font-semibold mb-3 mt-6">
          {renderRichText(block.heading_2.rich_text)}
        </h2>
      );

    case 'heading_3':
      return (
        <h3 className="text-xl font-medium mb-2 mt-4">
          {renderRichText(block.heading_3.rich_text)}
        </h3>
      );

    case 'bulleted_list_item':
      return (
        <li className="ml-6 mb-2 list-disc">
          {renderRichText(block.bulleted_list_item.rich_text)}
        </li>
      );

    case 'numbered_list_item':
      return (
        <li className="ml-6 mb-2 list-decimal">
          {renderRichText(block.numbered_list_item.rich_text)}
        </li>
      );

    case 'to_do':
      return (
        <div className="flex items-start gap-2 mb-2">
          <input
            type="checkbox"
            checked={block.to_do.checked}
            readOnly
            className="mt-1"
          />
          <span className={block.to_do.checked ? 'line-through text-muted-foreground' : ''}>
            {renderRichText(block.to_do.rich_text)}
          </span>
        </div>
      );

    case 'toggle':
      return (
        <details className="mb-4">
          <summary className="cursor-pointer font-medium">
            {renderRichText(block.toggle.rich_text)}
          </summary>
          <div className="mt-2 ml-4">
            {/* Child blocks would be rendered here */}
          </div>
        </details>
      );

    case 'code':
      return (
        <pre className="bg-muted p-4 rounded-lg mb-4 overflow-x-auto">
          <code className={`language-${block.code.language}`}>
            {block.code.rich_text[0]?.plain_text || ''}
          </code>
        </pre>
      );

    case 'quote':
      return (
        <blockquote className="border-l-4 border-primary pl-4 italic mb-4">
          {renderRichText(block.quote.rich_text)}
        </blockquote>
      );

    case 'callout':
      return (
        <div className="flex gap-3 p-4 bg-accent rounded-lg mb-4">
          <span className="text-2xl">{block.callout.icon?.emoji || '💡'}</span>
          <div>{renderRichText(block.callout.rich_text)}</div>
        </div>
      );

    case 'divider':
      return <hr className="my-8 border-border" />;

    case 'image':
      const imageUrl = block.image.file?.url || block.image.external?.url;
      return imageUrl ? (
        <figure className="mb-4">
          <img
            src={imageUrl}
            alt={block.image.caption?.[0]?.plain_text || 'Image'}
            className="rounded-lg max-w-full h-auto"
          />
          {block.image.caption?.length > 0 && (
            <figcaption className="text-sm text-muted-foreground mt-2 text-center">
              {renderRichText(block.image.caption)}
            </figcaption>
          )}
        </figure>
      ) : null;

    case 'video':
      const videoUrl = block.video.file?.url || block.video.external?.url;
      return videoUrl ? (
        <div className="mb-4">
          {videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') ? (
            <iframe
              src={videoUrl}
              className="w-full aspect-video rounded-lg"
              allowFullScreen
            />
          ) : (
            <video
              src={videoUrl}
              controls
              className="w-full rounded-lg"
            />
          )}
        </div>
      ) : null;

    case 'file':
      const fileUrl = block.file.file?.url || block.file.external?.url;
      return fileUrl ? (
        <div className="mb-4">
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            📎 {block.file.caption?.[0]?.plain_text || 'Download file'}
          </a>
        </div>
      ) : null;

    case 'bookmark':
      return (
        <div className="border rounded-lg p-4 mb-4">
          <a
            href={block.bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {block.bookmark.url}
          </a>
          {block.bookmark.caption?.length > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              {renderRichText(block.bookmark.caption)}
            </p>
          )}
        </div>
      );

    case 'table':
      return (
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full border-collapse">
            <tbody>
              {/* Table rows would be rendered here as child blocks */}
            </tbody>
          </table>
        </div>
      );

    case 'column_list':
      return (
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Column children would be rendered here */}
        </div>
      );

    default:
      return (
        <div className="mb-4 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            Unsupported block type: {block.type}
          </p>
        </div>
      );
  }
}