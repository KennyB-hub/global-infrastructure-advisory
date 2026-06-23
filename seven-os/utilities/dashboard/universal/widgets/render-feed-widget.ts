// © 2026 Global Infrastructure Advisory
// Universal FEED Widget (video/telemetry)

import { UniversalWidget } from "./widget";

export class FeedWidget implements UniversalWidget {
  id: string;
  type = "FEED";
  binding: string;

  constructor(id: string, binding: string) {
    this.id = id;
    this.binding = binding;
  }

  render(data: any) {
    return {
      widget: this.id,
      type: "FEED",
      streamUrl: data?.streamUrl || null,
      metadata: data?.metadata || {}
    };
  }
}
