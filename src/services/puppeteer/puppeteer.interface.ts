export interface BrowserConfig {
  headless: boolean;
  args: string[];
  defaultViewport: ViewportConfig;
}

export interface ViewportConfig {
  width: number;
  height: number;
}
