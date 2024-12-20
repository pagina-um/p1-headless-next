import React from "react";

interface TabsProps {
  defaultValue: string;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ defaultValue, children, className = "" }: TabsProps) {
  const [activeTab, setActiveTab] = React.useState(defaultValue);

  // Create context to pass down the active tab state
  const contextValue = React.useMemo(
    () => ({
      activeTab,
      setActiveTab,
    }),
    [activeTab]
  );

  return (
    <div className={className}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { activeTab, setActiveTab } as any);
        }
        return child;
      })}
    </div>
  );
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
  activeTab?: string;
  setActiveTab?: (value: string) => void;
}

export function TabsList({
  children,
  className = "",
  activeTab,
  setActiveTab,
}: TabsListProps) {
  return (
    <div className={`flex gap-1 p-1 bg-gray-100 rounded-lg ${className}`}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { activeTab, setActiveTab } as any);
        }
        return child;
      })}
    </div>
  );
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  activeTab?: string;
  setActiveTab?: (value: string) => void;
}

export function TabsTrigger({
  value,
  children,
  activeTab,
  setActiveTab,
}: TabsTriggerProps) {
  const isActive = activeTab === value;

  return (
    <button
      onClick={() => setActiveTab?.(value)}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors
        ${
          isActive
            ? "bg-white text-primary shadow-sm"
            : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
        }`}
    >
      {children}
    </button>
  );
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  activeTab?: string;
}

export function TabsContent({ value, children, activeTab }: TabsContentProps) {
  if (activeTab !== value) return null;
  return <div>{children}</div>;
}
