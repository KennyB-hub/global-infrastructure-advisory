// © 2026 Global Infrastructure Advisory
// Universal Data Binding Interface

export interface DataBinding {
  key: string;          // e.g. "cattleLocations"
  resolve(stack: any): any;  // returns live data from SevenRuntime
}
