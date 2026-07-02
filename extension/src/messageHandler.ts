import * as vscode from 'vscode';
import axios from 'axios';
import { CPSidebarProvider } from './sidebarProvider';

const BACKEND_URL = 'http://localhost:5000/api/user';

export async function syncDashboardProfile(panel: vscode.WebviewPanel, handle: string, context: vscode.ExtensionContext) {
  try {
    const response = await axios.get(`${BACKEND_URL}/${handle}`);
    const manualIds = context.globalState.get<string[]>('manualProblems') || [];
    
    panel.webview.postMessage({ 
      command: "initData", 
      data: response.data,
      manualProblemIds: manualIds 
    });
  } catch (error: any) {
    const reason = error.response?.data?.error || "Failed to establish synchronization bridge.";
    panel.webview.postMessage({ command: "syncError", reason });
    vscode.window.showErrorMessage(`❌ CP Gym Sync Failure: ${reason}`);
  }
}

export function setupWebviewMessageListener(
  panel: vscode.WebviewPanel, 
  context: vscode.ExtensionContext,
  sidebarProvider: CPSidebarProvider
) {
  panel.webview.onDidReceiveMessage(
    async (msg) => {
      const payload = msg.payload || {};
      const targetHandle = payload.handle || msg.handle || context.globalState.get<string>('cfHandle');

      switch (msg.command) {
        case "saveHandle": {
          const incomingHandle = payload.handle || msg.handle;
          if (incomingHandle) {
            await context.globalState.update('cfHandle', incomingHandle);
            sidebarProvider.refresh(); // Sync sidebar updates instantly
            await syncDashboardProfile(panel, incomingHandle, context);
          } else {
            vscode.window.showErrorMessage("❌ Unable to save: Handle parameter is missing.");
          }
          break;
        }

        case "requestDashboardData": {
          if (targetHandle && targetHandle !== "login") {
            await syncDashboardProfile(panel, targetHandle, context);
          } else {
            panel.webview.postMessage({ command: "syncError", reason: "Please enter a Codeforces context handle to begin." });
          }
          break;
        }

        case "fetchRecommendations": {
          try {
            const topic = payload.topic || msg.topic;
            const rating = payload.rating || msg.rating;
            
            const response = await axios.get(`${BACKEND_URL}/recommendations/tracks`, {
              params: { topic, rating }
            });
            panel.webview.postMessage({
              command: "recommendationsResponse",
              problems: response.data.problems
            });
          } catch (error) {
            vscode.window.showErrorMessage("❌ Failed to fetch optimized problem tracks.");
          }
          break;
        }

        case "addManualRevision": {
          try {
            const problemId = payload.problemId || msg.problemId;
            const name = payload.name || msg.name;
            const rating = payload.rating || msg.rating;
            const tag = payload.tag || msg.tag;

            if (!targetHandle || targetHandle === "login") {
              throw new Error("No active profile session context detected.");
            }

            const manualIds = context.globalState.get<string[]>('manualProblems') || [];
            if (!manualIds.includes(problemId)) {
              manualIds.push(problemId);
              await context.globalState.update('manualProblems', manualIds);
            }

            await axios.post(`${BACKEND_URL}/bookmark`, {
              handle: targetHandle,
              username: targetHandle,
              problemId,
              id: problemId,
              name,
              rating,
              tag
            });
            
            await syncDashboardProfile(panel, targetHandle, context);
            vscode.window.showInformationMessage(`📌 Problem [${problemId}] pinned to Added Questions!`);
          } catch (error: any) {
            console.error(error);
            vscode.window.showErrorMessage("❌ Failed to register manual bookmark.");
          }
          break;
        }

        case "removeManualRevision": {
          try {
            const problemId = payload.problemId || msg.problemId;

            if (!targetHandle || targetHandle === "login") {
              throw new Error("No active profile session context detected.");
            }

            let manualIds = context.globalState.get<string[]>('manualProblems') || [];
            manualIds = manualIds.filter(id => id !== problemId);
            await context.globalState.update('manualProblems', manualIds);

            await axios.post(`${BACKEND_URL}/unbookmark`, {
              handle: targetHandle,
              username: targetHandle,
              problemId: problemId,
              id: problemId
            });
            
            await syncDashboardProfile(panel, targetHandle, context);
            vscode.window.showInformationMessage(`🗑️ Target cleared successfully.`);
          } catch (error) {
            console.error("❌ Clear error context logs:", error);
            vscode.window.showErrorMessage("❌ Backend failed to remove target from collection.");
          }
          break;
        }
      }
    },
    undefined,
    context.subscriptions
  );
}