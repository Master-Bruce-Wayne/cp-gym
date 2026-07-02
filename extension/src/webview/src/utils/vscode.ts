interface VsCodeWindow extends Window {
  acquireVsCodeApi?: () => {
    postMessage: (message: unknown) => void;
    getState: () => unknown;
    setState: (state: unknown) => void;
  };
}

// Safely bind and declare the global window scope wrapper
const currentWindow = window as unknown as VsCodeWindow;

export const vscode = currentWindow.acquireVsCodeApi 
  ? currentWindow.acquireVsCodeApi() 
  : null;