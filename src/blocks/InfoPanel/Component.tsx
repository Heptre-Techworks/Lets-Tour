'use client';

import React from 'react';
import type { InfoPanelBlock as InfoPanelBlockProps } from '@/payload-types';

export const InfoPanel: React.FC<InfoPanelBlockProps> = ({
  title = 'Good to Know',
  subheading,
  listType = 'disc',
  items = [],
}) => {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  const ListComponent = listType === 'decimal' ? 'ol' : 'ul';
  const listStyleClass = listType === 'disc' ? 'list-disc' : 'list-decimal';

  return (
    <div className="p-6 rounded-lg font-sans">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
      {subheading && <p className="text-lg text-gray-600 mb-4">{subheading}</p>}
      <ListComponent className={`${listStyleClass} list-outside pl-5 space-y-2 text-gray-700`}>
        {items.map((item: any, index: number) => (
          <li key={index}>{item?.text || item}</li>
        ))}
      </ListComponent>
    </div>
  );
};

export default InfoPanel;
