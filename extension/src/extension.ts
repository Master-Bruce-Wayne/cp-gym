import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { setupWebviewMessageListener } from './messageHandler';
import { CPSidebarProvider } from './sidebarProvider';

export function activate(context: vscode.ExtensionContext) {
  console.log('🚀 CP Gym extension core has been successfully initialized!');

  // Register the standard premium sidebar view provider context
  const sidebarProvider = new CPSidebarProvider(context);
  vscode.window.registerTreeDataProvider('cp-gym-controls', sidebarProvider);

  let disposable = vscode.commands.registerCommand('cp-gym.openDashboard', () => {
    const panel = vscode.window.createWebviewPanel(
      'cpGymDashboard',
      'CP Gym Dashboard',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'src', 'webview', 'dist'))]
      }
    );

    const distAssetsPath = path.join(context.extensionPath, 'src', 'webview', 'dist', 'assets');
    let jsFile = '';
    let cssFile = '';

    try {
      if (fs.existsSync(distAssetsPath)) {
        const files = fs.readdirSync(distAssetsPath);
        
        // Match unhashed or hashed project files precisely
        jsFile = files.find(f => f === 'index.js' || (f.startsWith('index-') && f.endsWith('.js'))) || '';
        cssFile = files.find(f => f === 'index.css' || (f.startsWith('index-') && f.endsWith('.css'))) || '';
      }
    } catch (err) {
      console.error("Failed to read assets directory", err);
    }

    if (!jsFile || !cssFile) {
      vscode.window.showErrorMessage("⚠️ Webview asset files are missing. Please build your project inside src/webview first!");
    }

    const scriptPath = vscode.Uri.file(path.join(distAssetsPath, jsFile));
    const cssPath = vscode.Uri.file(path.join(distAssetsPath, cssFile));

    const scriptUri = panel.webview.asWebviewUri(scriptPath);
    const cssUri = panel.webview.asWebviewUri(cssPath);

    const savedHandle = context.globalState.get<string>('cfHandle') || "login";

    panel.webview.html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="${cssUri}">
        <title>CP Gym</title>
        <script>
          window.initialViewMode = "${savedHandle}";
        </script>
      </head>
      <body class="bg-[#0f172a]">
        <div id="root"></div>
        <script src="${scriptUri}"></script>
      </body>
      </html>
    `;

    // Pass the active sidebar tracking context instance to update configurations automatically
    setupWebviewMessageListener(panel, context, sidebarProvider);
  });

  let switchContextDisposable = vscode.commands.registerCommand('cp-gym.switchAccount', async () => {
    await context.globalState.update('cfHandle', 'login');
    sidebarProvider.refresh();
    vscode.commands.executeCommand('cp-gym.openDashboard');
  });

  context.subscriptions.push(disposable, switchContextDisposable);
}

export function deactivate() {}