// © 2026 Global Infrastructure Advisory
// Universal Widget Interface

export interface UniversalWidget {
  id: string;
  type: string;       // MAP, LIST, CARD, FEED, GRAPH
  binding: string;    // data key from SevenRuntime
  render(data: any): any; // returns a UI-neutral structure
}
