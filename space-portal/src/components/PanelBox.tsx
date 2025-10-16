// Basic panel container with title and content slots
import React from 'react';
import './PanelBox.css';

interface PanelBoxProps {
  title?: string;
  children: React.ReactNode;
}

export default function PanelBox({ title, children }: PanelBoxProps) {
  // Render a styled container with an optional heading
  return (
    <div className="panel-box">
      {title && (
        <h3 className="panel-box__title">
          {title}
        </h3>
      )}
      <div className="panel-box__content">
        {children}
      </div>
    </div>
  );
}
