import { LayoutDefinition } from "../../../autonomous/core/fcc/carrier-network-compliance/governance-brain/types";

export const govCyberLayout: LayoutDefinition = {
  layout: "grid-2",
  widgets: [
    { id: "cyber-status", component: "CyberStatusWidget", dataBindings: ["status"] },
    { id: "alerts", component: "AlertWidget", dataBindings: ["threats"] }
  ]
};
