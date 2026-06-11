// © 2026 Global Infrastructure Advisory
// Universal CARD Widget

import { UniversalWidget } from "./widget";

export class CardWidget implements UniversalWidget {
  id: string;
  type = "CARD";
  binding: string;

  constructor(id: string, binding: string) {
    this.id = id;
    this.binding = binding;
  }

  render(data: any) {
    return {
      widget: this.id,
      type: "CARD",
      title: data?.title || this.id,
      value: data?.value ?? null,
      status: data?.status || "unknown"
    };
  }
}
