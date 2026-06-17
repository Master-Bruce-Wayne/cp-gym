import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

    const disposable =
        vscode.commands.registerCommand(
            'cp-gym.helloWorld',
            () => {

                vscode.window.showInformationMessage(
                    'Hello World from CP gym!'
                );

            }
        );

    context.subscriptions.push(disposable);
}

export function deactivate() {}