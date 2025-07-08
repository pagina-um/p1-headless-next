import React from "react";
import { NavigationLinks } from "./NavigationLinks";
import { NotificationSettings } from "../NotificationSettings";

export function DesktopNav() {
  return (
    <nav className="flex items-center">
      <NavigationLinks />
      <NotificationSettings />
    </nav>
  );
}
