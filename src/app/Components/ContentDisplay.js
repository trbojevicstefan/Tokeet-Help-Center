"use client"; // Add this directive at the top

import { useEffect, useState } from 'react';
import { client } from '@/utils/sanity/client';

// Fetch content with GROQ
async function getContent() {
  const CONTENT_QUERY = `*[_type == "article"] {
    _id,
    title,
    content[] {
      ...,
      _type == "block" => {
        children
      },
      _type == "image" => {
        asset->{
          url
        },
        alt
      }
    },
    category-> {
      title
    }
  }`;
  
  const content = await client.fetch(CONTENT_QUERY);
  return content;
}

// Component to display the content
export default function ContentDisplay() {
  const [content, setContent] = useState([]);

  useEffect(() => {
    // Fetch the content when the component mounts
    getContent().then((data) => setContent(data));
  }, []);

  if (!content.length) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {content.map((article) => (
        <div key={article._id} className="article mb-8 p-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold mb-4">{article.title || 'Untitled'}</h2>
          <div className="content mb-4">
            {article.content?.map((block, idx) => {
              if (block._type === 'block') {
                return (
                  <p key={idx} className="mb-2">
                    {block.children?.map((child) => child.text).join(' ')}
                  </p>
                );
              } else if (block._type === 'image') {
                return (
                  <img
                    key={idx}
                    src={block.asset?.url}
                    alt={block.alt || 'Image'}
                    width="300"
                    className="mb-4"
                  />
                );
              }
              return (
                <p key={idx} className="text-sm text-gray-500">
                  Unsupported block type: {block._type}
                </p>
              );
            })}
          </div>
          {article.category && (
            <p className="text-sm text-gray-600">Category: {article.category.title || 'No category'}</p>
          )}
        </div>
      ))}
    </div>
  );
}
