import type { Settings } from "./types";

export function applyTheme(settings: Pick<Settings, "bgColor" | "primaryColor" | "secondaryColor" | "textColor">) {
  const root = document.documentElement;
  root.style.setProperty("--bg", settings.bgColor);
  root.style.setProperty("--primary", settings.primaryColor);
  root.style.setProperty("--secondary", settings.secondaryColor);
  root.style.setProperty("--text", settings.textColor);
}

export function notifySiteChanged() {
  const channel = new BroadcastChannel("mdc-site");
  channel.postMessage("refresh");
  channel.close();
}
