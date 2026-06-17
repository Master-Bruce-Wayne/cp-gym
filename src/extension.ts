import * as vscode from "vscode";
import axios from "axios";

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand(
        "cp-gym.helloWorld",
        async () => {
            try {
                const handle = await vscode.window.showInputBox({
                    placeHolder: "Enter Codeforces Handle",
                    prompt: "Enter your Codeforces username",
                });

                if (!handle) {
                    vscode.window.showWarningMessage(
                        "No Codeforces handle provided."
                    );
                    return;
                }

                const { data } = await axios.get(
                    `https://codeforces.com/api/user.status?handle=${handle}`
                );

                const submissions = data.result;

                const totalSubmissions = submissions.length;

                const acceptedSubmissions = submissions.filter(
                    (submission: any) => submission.verdict === "OK"
                ).length;

                vscode.window.showInformationMessage(
                    [
                        `Handle: ${handle}`,
                        `Total Submissions: ${totalSubmissions}`,
                        `Accepted Submissions: ${acceptedSubmissions}`,
                    ].join(" | ")
                );
            } catch (error) {
                console.error(error);

                vscode.window.showErrorMessage(
                    "Failed to fetch Codeforces data."
                );
            }
        }
    );

    context.subscriptions.push(disposable);
}

export function deactivate() {}