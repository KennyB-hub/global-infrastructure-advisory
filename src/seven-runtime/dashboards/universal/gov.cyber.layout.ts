import { LayoutDefinition } from "../types";

export const govCyberLayout: LayoutDefinition = {
  layout: "grid-2",
  widgets: [
    { id: "cyber-status", component: "CyberStatusWidget", dataBindings: ["status"] },
    { id: "alerts", component: "AlertWidget", dataBindings: ["threats"] }
  ]
};
