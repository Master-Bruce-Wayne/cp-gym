import * as vscode from "vscode";
import axios from "axios";
import { getDashboardHTML, getLoginHTML } from "./webview/dashboard";
import { CPSidebarProvider } from "./sidebarProvider";

interface SolvedProblem {
  rating: number;
  tags: string[];
}

interface DivisionConfig {
  name: string;
  minRating: number;
  maxRating: number;
  relevantTags: string[];
}

const DIVISIONS: DivisionConfig[] = [
  {
    name: "Newbie",
    minRating: 0,
    maxRating: 1199,
    relevantTags: ["implementation", "greedy", "brute force", "math", "sortings", "strings"],
  },
  {
    name: "Pupil",
    minRating: 1200,
    maxRating: 1399,
    relevantTags: ["implementation", "greedy", "brute force", "math", "sortings", "constructive algorithms", "two pointers", "binary search", "strings", "bitmasks", "data structures"],
  },
  {
    name: "Specialist",
    minRating: 1400,
    maxRating: 1599,
    relevantTags: ["implementation", "greedy", "brute force", "math", "sortings", "constructive algorithms", "two pointers", "binary search", "strings", "bitmasks", "data structures", "dfs and similar", "graphs", "number theory", "dp", "combinatorics", "trees", "dsu"],
  },
  {
    name: "Expert",
    minRating: 1600,
    maxRating: 1899,
    relevantTags: ["implementation", "greedy", "math", "constructive algorithms", "two pointers", "binary search", "bitmasks", "data structures", "dfs and similar", "graphs", "number theory", "dp", "combinatorics", "trees", "dsu", "shortest paths", "divide and conquer", "hashing", "probabilities", "games", "geometry", "strings"],
  },
  {
    name: "Candidate Master / Master",
    minRating: 1900,
    maxRating: 2399,
    relevantTags: ["implementation", "greedy", "math", "constructive algorithms", "binary search", "bitmasks", "data structures", "dfs and similar", "graphs", "number theory", "dp", "combinatorics", "trees", "dsu", "shortest paths", "divide and conquer", "hashing", "probabilities", "games", "geometry", "strings", "string suffix structures", "fft", "flows", "graph matchings", "meet-in-the-middle", "matrices"],
  },
];

// Track open webview panels using a Map where key is the handle string
const openPanels = new Map<string, vscode.WebviewPanel>();
let fallbackLoginPanel: vscode.WebviewPanel | undefined = undefined;

export function activate(context: vscode.ExtensionContext) {
  const sidebarProvider = new CPSidebarProvider(context);
  vscode.window.registerTreeDataProvider("cp-gym.sidebar", sidebarProvider);

  async function launchMainGymDashboard(panel: vscode.WebviewPanel, handle: string) {
    let solvedProblems = new Map<string, SolvedProblem>();

    async function fetchLatestCodeforcesData() {
      const { data: statusData } = await axios.get(
        "https://codeforces.com/api/user.status?handle=" + handle
      );
      const submissions = statusData.result;

      let currentRating = 0;
      let currentRank = "unrated";
      try {
        const { data: infoData } = await axios.get(
          "https://codeforces.com/api/user.info?handles=" + handle
        );
        if (infoData.status === "OK" && infoData.result.length > 0) {
          currentRating = infoData.result[0].rating ?? 0;
          currentRank = infoData.result[0].rank ?? "unrated";
        }
      } catch (e) {
        console.error(e);
      }

      let targetDivision = DIVISIONS[0];
      for (let i = 0; i < DIVISIONS.length; i++) {
        if (currentRating >= DIVISIONS[i].minRating && currentRating <= DIVISIONS[i].maxRating) {
          targetDivision = DIVISIONS[Math.min(i + 1, DIVISIONS.length - 1)];
          break;
        }
      }
      
      if (currentRating > DIVISIONS[DIVISIONS.length - 1].maxRating) {
        targetDivision = DIVISIONS[DIVISIONS.length - 1];
      }

      const acceptedSubmissions = submissions.filter(
        (submission: any) => submission.verdict === "OK"
      );

      solvedProblems.clear();
      for (const submission of acceptedSubmissions) {
        const problemId = submission.problem.contestId + "-" + submission.problem.index;
        if (!solvedProblems.has(problemId)) {
          solvedProblems.set(problemId, {
            rating: submission.problem.rating ?? 0,
            tags: submission.problem.tags ?? [],
          });
        }
      }

      const tagFrequency = new Map<string, number>();
      for (const [id, problem] of solvedProblems) {
        for (const tag of problem.tags) {
          if (!tagFrequency.has(tag)) tagFrequency.set(tag, 0);
          tagFrequency.set(tag, tagFrequency.get(tag)! + 1);
        }
      }

      const weakTopics = targetDivision.relevantTags.map((tag) => {
        const count = tagFrequency.get(tag) ?? 0;
        return [tag, count] as [string, number];
      });
      weakTopics.sort((a, b) => a[1] - b[1]);

      const sortedAllTopics = [...tagFrequency.entries()];
      sortedAllTopics.sort((a, b) => b[1] - a[1]);

      return {
        currentRating,
        currentRank,
        targetDivision,
        totalSubmissions: submissions.length,
        acceptedSubmissions: acceptedSubmissions.length,
        solvedCount: solvedProblems.size,
        weakTopics: weakTopics.slice(0, 5),
        strongTopics: sortedAllTopics.slice(0, 5),
      };
    }

    vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: "Syncing with Codeforces API...",
      cancellable: false
    }, async () => {
      try {
        const initialData = await fetchLatestCodeforcesData();
        panel.webview.html = getDashboardHTML(
          handle,
          initialData.currentRating,
          initialData.currentRank,
          initialData.targetDivision.name,
          initialData.targetDivision.minRating,
          initialData.targetDivision.maxRating,
          initialData.totalSubmissions,
          initialData.acceptedSubmissions,
          initialData.solvedCount,
          initialData.weakTopics,
          initialData.strongTopics
        );
      } catch (err) {
        vscode.window.showErrorMessage("Could not load data for handle: " + handle);
        panel.webview.html = getLoginHTML('login');
      }
    });

    panel.webview.onDidReceiveMessage(
      async (message) => {
        switch (message.command) {
          case "triggerSyncRefresh": {
            try {
              const updatedData = await fetchLatestCodeforcesData();
              panel.webview.postMessage({
                command: "syncRefreshResponse",
                status: "success",
                data: updatedData,
              });
            } catch (refreshErr) {
              panel.webview.postMessage({ command: "syncRefreshResponse", status: "error" });
            }
            break;
          }

          case "fetchRecommendations": {
            const { topic, rating } = message;
            try {
              const response = await axios.get(
                "https://codeforces.com/api/problemset.problems?tags=" + encodeURIComponent(topic)
              );
              if (response.data.status !== "OK") throw new Error();

              const allProblems = response.data.result.problems;
              const recommended = allProblems.filter((prob: any) => {
                const problemId = prob.contestId + "-" + prob.index;
                const targetRating = rating < 800 ? 800 : rating;
                return prob.rating === targetRating && !solvedProblems.has(problemId);
              });

              const finalSelection = recommended
                .sort(() => 0.5 - Math.random())
                .slice(0, 5)
                .map((p: any) => ({
                  contestId: p.contestId,
                  index: p.index,
                  name: p.name,
                  rating: p.rating,
                }));

              panel.webview.postMessage({
                command: "recommendationsResponse",
                topic: topic,
                problems: finalSelection,
              });
            } catch (err) {
              panel.webview.postMessage({
                command: "recommendationsResponse",
                topic: topic,
                problems: [],
              });
            }
            break;
          }
        }
      },
      undefined,
      context.subscriptions
    );
  }

  // Unified controller to manage form inputs and routing transitions safely
  function setupLoginMessageListener(panel: vscode.WebviewPanel) {
    panel.webview.onDidReceiveMessage(async (msg) => {
      if (msg.command === "saveHandle") {
        const enteredHandle = msg.handle.trim();
        if (!enteredHandle) return;

        // Tab routing check
        if (openPanels.has(enteredHandle)) {
          // If the user chooses the SAME ID, close the login page and focus the existing tab
          panel.dispose(); 
          const existingPanel = openPanels.get(enteredHandle);
          existingPanel?.reveal(vscode.ViewColumn.One);
          return;
        }

        // Save new handle to global profile configurations
        await context.globalState.update("cfHandle", enteredHandle);
        sidebarProvider.refresh();

        // Track and map panel references to the newly entered handle
        openPanels.set(enteredHandle, panel);
        panel.title = "CP Gym: " + enteredHandle;

        panel.onDidDispose(() => {
          openPanels.delete(enteredHandle);
        }, null, context.subscriptions);

        await launchMainGymDashboard(panel, enteredHandle);
      }
    });
  }

  const disposableDashboard = vscode.commands.registerCommand(
    "cp-gym.helloWorld",
    async (mode: 'login' | 'switch' = 'login') => {
      const handle = context.globalState.get<string>("cfHandle");

      if (mode === 'switch') {
        // Switch context triggers a unique clean input canvas inside a new panel instance
        const switchPanel = vscode.window.createWebviewPanel(
          "cpGymLogin",
          "CP Gym: Switch Profile",
          vscode.ViewColumn.One,
          { enableScripts: true }
        );
        switchPanel.webview.html = getLoginHTML('switch');
        setupLoginMessageListener(switchPanel);
        return;
      }

      if (!handle) {
        if (fallbackLoginPanel) {
          fallbackLoginPanel.reveal(vscode.ViewColumn.One);
          return;
        }
        const loginPanel = vscode.window.createWebviewPanel(
          "cpGymLogin",
          "CP Gym: Setup Profile",
          vscode.ViewColumn.One,
          { enableScripts: true }
        );
        fallbackLoginPanel = loginPanel;
        loginPanel.onDidDispose(() => { fallbackLoginPanel = undefined; });
        loginPanel.webview.html = getLoginHTML('login');
        setupLoginMessageListener(loginPanel);
        return;
      }

      // Standard click execution loop routing logic checks
      if (openPanels.has(handle)) {
        openPanels.get(handle)!.reveal(vscode.ViewColumn.One);
      } else {
        const panel = vscode.window.createWebviewPanel(
          "cpGymDashboard",
          "CP Gym: " + handle,
          vscode.ViewColumn.One,
          { enableScripts: true }
        );
        openPanels.set(handle, panel);
        panel.onDidDispose(() => { openPanels.delete(handle); }, null, context.subscriptions);
        await launchMainGymDashboard(panel, handle);
      }
    }
  );

  const disposableChangeHandle = vscode.commands.registerCommand(
    "cp-gym.changeHandle",
    async () => {
      vscode.commands.executeCommand("cp-gym.helloWorld", "switch");
    }
  );

  context.subscriptions.push(disposableDashboard, disposableChangeHandle);
}

export function deactivate() {}