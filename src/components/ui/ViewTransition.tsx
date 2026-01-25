"use client";

import * as React from "react";
import { ReactNode, createElement } from "react";

// In client bundles, ViewTransition is exported as unstable_ViewTransition
// In server bundles, it's exported as ViewTransition
const ReactViewTransition =
  (React as any)["unstable_ViewTransition"] ||
  (React as any)["ViewTransition"];

interface ViewTransitionProps {
  children: ReactNode;
  name?: string;
}

export function ViewTransition({ children, name }: ViewTransitionProps) {
  if (!ReactViewTransition) {
    return <>{children}</>;
  }

  return createElement(ReactViewTransition, { name }, children);
}
