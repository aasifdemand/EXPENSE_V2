import React, { createContext, useContext, useState } from "react";

const TabsContext = createContext();

export const Tabs = ({ defaultValue, value, onValueChange, children, className = "" }) => {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultValue);
  
  const activeTab = value !== undefined ? value : internalActiveTab;
  const setActiveTab = (val) => {
    if (onValueChange) onValueChange(val);
    if (value === undefined) setInternalActiveTab(val);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={`w-full ${className}`}>{children}</div>
    </TabsContext.Provider>
  );
};

export const TabsList = ({ children, className = "" }) => {
  return (
    <div className={`flex gap-1 ${className}`}>
      {children}
    </div>
  );
};

export const TabsTrigger = ({ value, children, onClick, className = "" }) => {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  const isActive = activeTab === value;

  const handleClick = (e) => {
    setActiveTab(value);
    if (onClick) onClick(e);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      data-state={isActive ? "active" : "inactive"}
      className={`
        px-4 py-2 text-sm font-medium transition-all duration-200 rounded-md
        ${isActive 
          ? "bg-white text-primary-600 shadow-sm" 
          : "text-text-muted hover:text-text-primary hover:bg-slate-200/50"}
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ value, children, className = "" }) => {
  const { activeTab } = useContext(TabsContext);

  if (activeTab !== value) return null;

  return (
    <div className={`animate-in fade-in slide-in-from-bottom-2 duration-300 ${className}`}>
      {children}
    </div>
  );
};
