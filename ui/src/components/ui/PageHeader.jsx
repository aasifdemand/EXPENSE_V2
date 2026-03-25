import React from 'react';

const PageHeader = ({ title, highlight, subtitle, actions }) => {
  return (
    <div className="relative mb-10 pb-8 border-b border-border/50">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-semibold text-text-primary tracking-tight sm:text-5xl">
            {title} {highlight && <span className="text-primary-600">{highlight}</span>}
          </h1>
          <p className="text-base font-medium text-text-secondary flex items-center gap-2">
            <span className="w-8 h-[2px] bg-primary-500/30 rounded-full" />
            {subtitle}
          </p>
        </div>

        {actions && (
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {actions}
          </div>
        )}
      </div>
      
      <div className="absolute -bottom-px left-0 w-24 h-[2px] bg-primary-600" />
    </div>
  );
};

export default PageHeader;
