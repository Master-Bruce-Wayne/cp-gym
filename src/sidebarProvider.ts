import * as vscode from "vscode";

export class CPSidebarProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  constructor(private context: vscode.ExtensionContext) {}

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(): vscode.ProviderResult<vscode.TreeItem[]> {
    const handle = this.context.globalState.get<string>("cfHandle");

    if (!handle) {
      const setupItem = new vscode.TreeItem("Setup Codeforces Profile", vscode.TreeItemCollapsibleState.None);
      setupItem.iconPath = new vscode.ThemeIcon("rocket"); // Uses premium theme product icon
      setupItem.command = {
        command: "cp-gym.helloWorld",
        title: "Setup Handle",
        arguments: ["login"]
      };
      setupItem.tooltip = "Click to link your handle and activate your dashboard.";
      return [setupItem];
    }

    const openDashboardItem = new vscode.TreeItem("Open Dashboard (" + handle + ")", vscode.TreeItemCollapsibleState.None);
    openDashboardItem.iconPath = new vscode.ThemeIcon("graph"); // Uses premium visual analytics theme icon
    openDashboardItem.command = {
      command: "cp-gym.helloWorld",
      title: "Open Dashboard",
      arguments: ["login"]
    };
    openDashboardItem.contextValue = "dashboard";

    const changeHandleItem = new vscode.TreeItem("Switch Account / Logout", vscode.TreeItemCollapsibleState.None);
    changeHandleItem.iconPath = new vscode.ThemeIcon("gear");
    changeHandleItem.command = {
      command: "cp-gym.changeHandle",
      title: "Change Handle"
    };

    return [openDashboardItem, changeHandleItem];
  }

  private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | null | void> = new vscode.EventEmitter<vscode.TreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }
}