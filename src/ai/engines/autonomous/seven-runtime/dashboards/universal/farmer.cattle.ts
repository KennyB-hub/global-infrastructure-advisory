import { LayoutDefinition } from "../types";

export const farmerCattleLayout: LayoutDefinition = {
  layout: "grid-3",
  widgets: [
    { id: "map", component: "MapWidget", dataBindings: ["gps", "fence"] },
    { id: "cattle", component: "CattleCollarWidget", dataBindings: ["collar"] },
    { id: "alerts", component: "AlertWidget", dataBindings: ["health", "geo"] }
  ]
};
