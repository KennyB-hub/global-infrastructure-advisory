// © 2026 Global Infrastructure Advisory
// Universal LIST Widget

import { UniversalWidget } from "./widget";

export class ListWidget implements UniversalWidget {
  id: string;
  type = "LIST";
  binding: string;

  constructor(id: string, binding: string) {
    this.id = id;
    this.binding = binding;
  }

  render(data: any) {
    return {
      widget: this.id,
      type: "LIST",
      items: Array.isArray(data) ? data : []
    };
  }
}
