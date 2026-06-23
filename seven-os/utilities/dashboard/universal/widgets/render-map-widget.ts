// © 2026 Global Infrastructure Advisory
// Universal MAP Widget

import { UniversalWidget } from "./widget";

export class MapWidget implements UniversalWidget {
  id: string;
  type = "MAP";
  binding: string;

  constructor(id: string, binding: string) {
    this.id = id;
    this.binding = binding;
  }

  render(data: any) {
    return {
      widget: this.id,
      type: "MAP",
      points: data?.points || [],
      center: data?.center || null,
      overlays: data?.overlays || []
    };
  }
}
