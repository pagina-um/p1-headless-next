"use client";

import { ReactNode, createElement } from "react";

interface ViewTransitionProps {
  children: ReactNode;
  name?: string;
}

// Dynamically access ViewTransition at runtime to avoid bundler static analysis
function getViewTransitionComponent() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  return React.unstable_ViewTransition || React.ViewTransition;
}

export function ViewTransition({ children, name }: ViewTransitionProps) {
  const ViewTransitionComponent = getViewTransitionComponent();

  if (!ViewTransitionComponent) {
    return <>{children}</>;
  }

  return createElement(ViewTransitionComponent, { name }, children);
}
