import * as vscode from "vscode";

export class CPSidebarProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | null | void> = new vscode.EventEmitter<vscode.TreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

  constructor(private context: vscode.ExtensionContext) {}

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(): vscode.ProviderResult<vscode.TreeItem[]> {
    const handle = this.context.globalState.get<string>("cfHandle");

    // Check if user is logged out or completely uninitialized
    if (!handle || handle === "login") {
      const setupItem = new vscode.TreeItem("Setup Codeforces Profile", vscode.TreeItemCollapsibleState.None);
      setupItem.iconPath = new vscode.ThemeIcon("rocket");
      setupItem.command = {
        command: "cp-gym.openDashboard",
        title: "Setup Handle"
      };
      setupItem.tooltip = "Click to link your handle and activate your dashboard.";
      return [setupItem];
    }

    const openDashboardItem = new vscode.TreeItem(`📊 Open Dashboard (${handle})`, vscode.TreeItemCollapsibleState.None);
    openDashboardItem.iconPath = new vscode.ThemeIcon("graph");
    openDashboardItem.command = {
      command: "cp-gym.openDashboard",
      title: "Open Dashboard"
    };
    openDashboardItem.contextValue = "dashboard";

    const changeHandleItem = new vscode.TreeItem("🔄 Switch Account / Logout", vscode.TreeItemCollapsibleState.None);
    changeHandleItem.iconPath = new vscode.ThemeIcon("gear");
    changeHandleItem.command = {
      command: "cp-gym.switchAccount",
      title: "Change Handle"
    };

    return [openDashboardItem, changeHandleItem];
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }
}