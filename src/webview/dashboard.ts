function getRankColor(rank: string): string {
  const r = rank.toLowerCase();
  if (r.includes("legendary") || r.includes("grandmaster") || r.includes("red")) return "#ff334b";
  if (r.includes("master") || r.includes("orange")) return "#ff9800";
  if (r.includes("candidate") || r.includes("purple")) return "#d81b60";
  if (r.includes("expert") || r.includes("blue")) return "#2979ff";
  if (r.includes("specialist") || r.includes("cyan")) return "#00e5ff";
  if (r.includes("pupil") || r.includes("green")) return "#00e676";
  if (r.includes("newbie") || r.includes("gray") || r.includes("grey")) return "#b0bec5";
  return "#00e5ff";
}

function getRankBgGradient(rank: string): string {
  const color = getRankColor(rank);
  return `linear-gradient(135deg, ${color} 0%, rgba(20, 26, 42, 0.4) 100%)`;
}

function capitalize(str: string): string {
  if (!str) return "";
  return str.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function getDynamicTargetGoal(solvedCount: number): number {
  if (solvedCount < 10) return 15;
  if (solvedCount < 25) return 30;
  if (solvedCount < 45) return 50;
  return Math.ceil((solvedCount + 15) / 10) * 10;
}

// Fixed login view processing conditional routing parameters safely
export function getLoginHTML(mode: 'login' | 'switch'): string {
  const titleText = mode === 'switch' ? 'Switch to Another Account' : 'Welcome to CP Gym';
  const paragraphText = mode === 'switch' 
    ? 'Enter a different Codeforces username handle below to recalculate analytics configurations, re-evaluate tracked weak tags, and switch profile data environments.' 
    : 'Enter your Codeforces handle to load your analytics dashboard, track weak tags, and get optimized problem recommendations.';
  const coreActionBtnText = mode === 'switch' ? 'Switch Context' : 'Connect Profile';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Setup CP Gym Profile</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700;800&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #0b0f19;
            color: #f8fafc;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
        }
        .login-card {
            background: rgba(20, 26, 42, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 16px;
            padding: 40px;
            max-width: 450px;
            width: 100%;
            backdrop-filter: blur(12px);
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
            text-align: center;
        }
        h2 {
            font-family: 'Outfit', sans-serif;
            font-size: 2.2rem;
            font-weight: 800;
            margin-bottom: 8px;
            background: linear-gradient(135deg, #ffffff 0%, #38bdf8 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        p {
            color: #94a3b8;
            font-size: 0.95rem;
            margin-bottom: 30px;
            line-height: 1.5;
        }
        .input-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
            text-align: left;
            margin-bottom: 24px;
        }
        label {
            font-size: 0.85rem;
            color: #94a3b8;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        input {
            background: rgba(11, 15, 25, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 12px 16px;
            color: #f8fafc;
            font-size: 1rem;
            font-family: 'Inter', sans-serif;
            transition: all 0.2s ease;
        }
        input:focus {
            outline: none;
            border-color: #2979ff;
            box-shadow: 0 0 10px rgba(41, 121, 255, 0.25);
        }
        .submit-btn {
            width: 100%;
            background: #2979ff;
            color: #0b0f19;
            border: none;
            border-radius: 8px;
            padding: 14px;
            font-size: 1rem;
            font-weight: 700;
            cursor: pointer;
            font-family: 'Inter', sans-serif;
            transition: all 0.2s ease;
        }
        .submit-btn:hover {
            background: #00e5ff;
            box-shadow: 0 0 15px rgba(0, 229, 255, 0.4);
            transform: translateY(-1px);
        }
    </style>
</head>
<body>
    <div class="login-card">
        <h2>${titleText}</h2>
        <p>${paragraphText}</p>
        
        <div class="input-group">
            <label for="handleInput">Codeforces Handle</label>
            <input type="text" id="handleInput" placeholder="e.g., tourist" autocomplete="off">
        </div>
        
        <button class="submit-btn" id="loginBtn">${coreActionBtnText}</button>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        const input = document.getElementById('handleInput');
        const btn = document.getElementById('loginBtn');

        function submitHandle() {
            const val = input.value.trim();
            if(val) {
                vscode.postMessage({
                    command: 'saveHandle',
                    handle: val
                });
            }
        }

        btn.addEventListener('click', submitHandle);
        input.addEventListener('keydown', (e) => {
            if(e.key === 'Enter') submitHandle();
        });
    </script>
</body>
</html>
  `;
}

export function getDashboardHTML(
  handle: string,
  currentRating: number,
  currentRank: string,
  targetDivisionName: string,
  targetDivisionMinRating: number,
  targetDivisionMaxRating: number,
  totalSubmissions: number,
  acceptedSubmissions: number,
  solvedProblems: number,
  weakTopics: [string, number][],
  strongTopics: [string, number][]
): string {
  const rankColor = getRankColor(currentRank);
  const rankGradient = getRankBgGradient(currentRank);
  const targetRankColor = getRankColor(targetDivisionName);
  
  const startRating = currentRating < 1200 
    ? 800 
    : (targetDivisionMinRating === 1200 ? 800 : (targetDivisionMinRating === 1400 ? 1200 : (targetDivisionMinRating === 1600 ? 1400 : 1600)));
  const range = targetDivisionMinRating - startRating;
  const progressPercent = range > 0 
    ? Math.min(100, Math.max(5, Math.round(((currentRating - startRating) / range) * 100))) 
    : 0;

  const pointsNeeded = targetDivisionMinRating > currentRating ? targetDivisionMinRating - currentRating : 0;
  const acceptanceRate = totalSubmissions > 0 ? Math.round((acceptedSubmissions / totalSubmissions) * 100) : 0;

  const weakTopicsHTML = weakTopics
    .map(([topic, count]) => {
      const targetGoal = getDynamicTargetGoal(count);
      const progress = Math.min(100, Math.round((count / targetGoal) * 100));
      const rawTopicName = topic.toLowerCase();
      return `
        <div class="topic-item weak-topic-card" data-rawtopic="${rawTopicName}">
          <div class="topic-header">
            <span class="topic-name">${capitalize(topic)}</span>
            <span class="topic-badge weak" id="badge-${rawTopicName}">${count}/${targetGoal} solved</span>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar weak" id="bar-${rawTopicName}" style="width: ${progress}%"></div>
          </div>
          
          <div class="solve-trigger-container" id="trigger-container-${rawTopicName}" style="margin-top: 8px;">
            <span class="solve-action-link" id="link-${rawTopicName}" data-topic="${rawTopicName}">Click below to solve new problems</span>
          </div>

          <div class="rating-wrapper" id="wrapper-${rawTopicName}" style="display: none; margin-top: 12px; flex-direction: column; gap: 8px;">
             <div class="instruction-text">Select any of the rating ranges below:</div>
             <div class="rating-selector" id="updater-${rawTopicName}" style="display: flex; gap: 8px; flex-wrap: wrap;"></div>
          </div>

          <div class="problems-block" id="block-${rawTopicName}" style="display: none; flex-direction: column; margin-top: 14px; gap: 8px;">
             <div style="display: flex; justify-content: space-between; align-items: center; padding: 2px 4px;">
                 <span style="font-size: 0.8rem; color: var(--text-secondary); font-weight: 500;">Recommended Problems:</span>
                 <span class="cancel-action-link" data-topic="${rawTopicName}">Cancel</span>
             </div>
             <div class="problems-container" id="problems-${rawTopicName}" style="display: flex; flex-direction: column; gap: 6px;"></div>
          </div>
        </div>
      `;
    })
    .join("");

  const strongTopicsHTML = strongTopics
    .map(([topic, count]) => {
      const rawTopicName = topic.toLowerCase();
      return `
        <div class="topic-item strong-topic-card" data-rawtopic="${rawTopicName}">
          <div class="topic-header">
            <span class="topic-name">${capitalize(topic)}</span>
            <span class="topic-badge strong" id="s-badge-${rawTopicName}">${count} solved</span>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar strong" style="width: 100%"></div>
          </div>
        </div>
      `;
    })
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CP Gym Dashboard</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-color: #0b0f19;
            --card-bg: rgba(20, 26, 42, 0.6);
            --border-color: rgba(255, 255, 255, 0.08);
            --text-primary: #f8fafc;
            --text-secondary: #94a3b8;
            --accent-color: ${rankColor};
            --target-accent: ${targetRankColor};
            --success-color: #00e676;
            --warning-color: #ffd54f;
            --card-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Inter', -apple-system, sans-serif;
            background-color: var(--bg-color);
            color: var(--text-primary);
            padding: 30px;
            min-height: 100vh;
            line-height: 1.5;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            gap: 25px;
        }

        header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 20px;
            margin-bottom: 10px;
        }

        h1 {
            font-family: 'Outfit', sans-serif;
            font-size: 2.2rem;
            font-weight: 800;
            background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .gym-logo-badge {
            background: var(--accent-color);
            color: #0b0f19;
            font-size: 0.8rem;
            font-weight: 700;
            padding: 4px 10px;
            border-radius: 20px;
            text-transform: uppercase;
            box-shadow: 0 0 15px var(--accent-color);
            letter-spacing: 0.5px;
        }

        .sync-action-text-btn {
            font-size: 0.85rem;
            font-weight: 600;
            color: #38bdf8;
            cursor: pointer;
            padding: 6px 14px;
            background: rgba(56, 189, 248, 0.08);
            border: 1px solid rgba(56, 189, 248, 0.2);
            border-radius: 8px;
            transition: all 0.2s ease;
        }
        .sync-action-text-btn:hover {
            background: #38bdf8;
            color: #0b0f19;
            box-shadow: 0 0 12px rgba(56, 189, 248, 0.35);
        }

        .card {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 24px;
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            box-shadow: var(--card-shadow);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.3s ease;
        }

        .card:hover {
            border-color: rgba(255, 255, 255, 0.15);
            transform: translateY(-2px);
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 20px;
        }

        .stat-card {
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding: 20px;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.04);
            position: relative;
            overflow: hidden;
        }

        .stat-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 4px;
            height: 100%;
            background: var(--accent-color);
            opacity: 0.8;
        }

        .stat-card.solved::before { background: var(--success-color); }
        .stat-card.accuracy::before { background: #a855f7; }

        .stat-label {
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--text-secondary);
            font-weight: 600;
        }

        .stat-value {
            font-family: 'Outfit', sans-serif;
            font-size: 1.8rem;
            font-weight: 700;
            color: var(--text-primary);
        }

        .roadmap-card {
            background: linear-gradient(150deg, rgba(20, 26, 42, 0.8) 0%, rgba(11, 15, 25, 0.9) 100%);
            border: 1px solid rgba(255, 255, 255, 0.08);
            position: relative;
            overflow: hidden;
        }

        .roadmap-container {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        .roadmap-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 15px;
        }

        .roadmap-title {
            font-family: 'Outfit', sans-serif;
            font-size: 1.3rem;
            font-weight: 700;
            color: var(--text-primary);
        }

        .points-badge {
            background: rgba(239, 68, 68, 0.15);
            border: 1px solid rgba(239, 68, 68, 0.3);
            color: #f87171;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }

        .roadmap-flow {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
            background: rgba(255, 255, 255, 0.02);
            padding: 20px;
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.04);
        }

        .flow-node {
            display: flex;
            flex-direction: column;
            gap: 4px;
            min-width: 140px;
        }

        .flow-node.current {
            border-left: 3px solid var(--accent-color);
            padding-left: 12px;
        }

        .flow-node.target {
            border-left: 3px solid var(--target-accent);
            padding-left: 12px;
            text-align: left;
        }

        .node-label {
            font-size: 0.75rem;
            text-transform: uppercase;
            color: var(--text-secondary);
            font-weight: 600;
        }

        .node-rank {
            font-family: 'Outfit', sans-serif;
            font-size: 1.15rem;
            font-weight: 700;
        }

        .node-rank.current {
            color: var(--accent-color);
            text-shadow: 0 0 10px rgba(var(--accent-color), 0.3);
        }

        .node-rank.target { color: var(--target-accent); }
        .node-rating { font-size: 0.85rem; color: var(--text-secondary); }

        .flow-arrow {
            color: var(--text-secondary);
            font-size: 1.5rem;
            font-weight: 300;
            opacity: 0.5;
        }

        .roadmap-meter {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .meter-label {
            display: flex;
            justify-content: space-between;
            font-size: 0.8rem;
            color: var(--text-secondary);
        }

        .meter-bar-outer {
            height: 10px;
            background: rgba(255, 255, 255, 0.06);
            border-radius: 5px;
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.04);
        }

        .meter-bar-inner {
            height: 100%;
            background: linear-gradient(90deg, var(--accent-color) 0%, var(--target-accent) 100%);
            border-radius: 5px;
            box-shadow: 0 0 10px var(--accent-color);
            transition: width 1s ease-in-out;
        }

        .topics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 25px;
        }

        @media (max-width: 768px) {
            .topics-grid { grid-template-columns: 1fr; }
        }

        .topics-card-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 15px;
            margin-bottom: 20px;
        }

        .topics-card-title {
            font-family: 'Outfit', sans-serif;
            font-size: 1.25rem;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .topics-card-title.weak { color: var(--warning-color); }
        .topics-card-title.strong { color: var(--success-color); }

        .topic-list {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .topic-item {
            background: rgba(255, 255, 255, 0.015);
            border: 1px solid rgba(255, 255, 255, 0.03);
            border-radius: 10px;
            padding: 14px 16px;
            display: flex;
            flex-direction: column;
            gap: 4px;
            transition: background 0.2s ease;
        }

        .topic-item:hover {
            background: rgba(255, 255, 255, 0.03);
        }

        .topic-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 4px;
        }

        .topic-name {
            font-size: 0.95rem;
            font-weight: 600;
            color: var(--text-primary);
        }

        .topic-badge {
            font-size: 0.75rem;
            font-weight: 600;
            padding: 3px 8px;
            border-radius: 6px;
        }

        .topic-badge.weak {
            background: rgba(255, 213, 79, 0.1);
            color: var(--warning-color);
            border: 1px solid rgba(255, 213, 79, 0.2);
        }

        .topic-badge.strong {
            background: rgba(0, 230, 118, 0.1);
            color: var(--success-color);
            border: 1px solid rgba(0, 230, 118, 0.2);
        }

        .progress-bar-container {
            height: 6px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 3px;
            overflow: hidden;
            margin-bottom: 4px;
        }

        .progress-bar { height: 100%; border-radius: 3px; }
        .progress-bar.weak { background: linear-gradient(90deg, rgba(255, 213, 79, 0.7) 0%, var(--warning-color) 100%); }
        .progress-bar.strong { background: linear-gradient(90deg, rgba(0, 230, 118, 0.7) 0%, var(--success-color) 100%); }

        .solve-action-link {
            font-size: 0.8rem;
            font-weight: 500;
            color: #2979ff;
            cursor: pointer;
            display: inline-block;
            transition: all 0.2s ease;
        }
        .solve-action-link:hover {
            color: #00e5ff;
            text-decoration: underline;
        }
        
        .solve-action-link.active-back {
            color: var(--warning-color);
            font-weight: 600;
        }
        .solve-action-link.active-back:hover {
            color: #fcd34d;
        }

        .cancel-action-link {
            font-size: 0.78rem;
            font-weight: 600;
            color: #ef4444;
            cursor: pointer;
            transition: color 0.2s ease;
        }
        .cancel-action-link:hover {
            color: #f87171;
            text-decoration: underline;
        }

        .instruction-text {
            font-size: 0.8rem;
            color: var(--text-secondary);
            font-weight: 500;
            margin-bottom: 2px;
        }
        .rating-btn {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: var(--text-primary);
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 0.8rem;
            cursor: pointer;
            font-family: 'Inter', sans-serif;
            transition: all 0.2s ease;
        }
        .rating-btn:hover {
            background: var(--warning-color);
            color: #0b0f19;
            border-color: var(--warning-color);
            transform: translateY(-1px);
        }
        
        .rating-btn.selected-rate {
            background: var(--warning-color);
            color: #0b0f19;
            border-color: var(--warning-color);
            font-weight: 600;
        }

        .rec-prob-link {
            color: #38bdf8;
            text-decoration: none;
            font-size: 0.85rem;
            padding: 8px 12px;
            background: rgba(56, 189, 248, 0.04);
            border-radius: 6px;
            border: 1px solid rgba(56, 189, 248, 0.1);
            display: block;
            transition: all 0.2s ease;
        }
        .rec-prob-link:hover {
            background: rgba(56, 189, 248, 0.12);
            border-color: rgba(56, 189, 248, 0.3);
            padding-left: 16px;
        }
    </style>
</head>
<body>

    <div class="container">
        <header>
            <h1>
                <span>CP Gym Dashboard</span>
                <span class="gym-logo-badge">Active</span>
            </h1>
            <button class="sync-action-text-btn" id="global-sync-trigger">Sync Stats</button>
        </header>

        <div class="card">
            <div class="stats-grid">
                <div class="stat-card">
                    <span class="stat-label">Codeforces Handle</span>
                    <span class="stat-value" style="color: var(--accent-color)">${handle}</span>
                </div>
                <div class="stat-card">
                    <span class="stat-label">Total Submissions</span>
                    <span class="stat-value" id="stat-val-total">${totalSubmissions}</span>
                </div>
                <div class="stat-card solved">
                    <span class="stat-label">Unique Solved</span>
                    <span class="stat-value" id="stat-val-solved" style="color: var(--success-color)">${solvedProblems}</span>
                </div>
                <div class="stat-card accuracy">
                    <span class="stat-label">Acceptance Rate</span>
                    <span class="stat-value" id="stat-val-accuracy" style="color: #c084fc">${acceptanceRate}%</span>
                </div>
            </div>
        </div>

        <div class="card roadmap-card">
            <div class="roadmap-container">
                <div class="roadmap-header">
                    <span class="roadmap-title">Division Roadmap Progression</span>
                    <div id="points-badge-container">
                    ${pointsNeeded > 0 
                      ? '<span class="points-badge">🎯 ' + pointsNeeded + ' points to target</span>'
                      : '<span class="points-badge" style="background: rgba(0,230,118,0.15); border-color: rgba(0,230,118,0.3); color: var(--success-color)">🎉 Target Reached!</span>'
                    }
                    </div>
                </div>

                <div class="roadmap-flow">
                    <div class="flow-node current">
                        <span class="node-label">Current Division</span>
                        <span class="node-rank current" id="roadmap-cur-rank">${capitalize(currentRank)}</span>
                        <span class="node-rating">Rating: <strong id="roadmap-cur-rating">${currentRating}</strong></span>
                    </div>
                    
                    <div class="flow-arrow">➔</div>

                    <div class="flow-node target">
                        <span class="node-label">Target Division</span>
                        <span class="node-rank target">${capitalize(targetDivisionName)}</span>
                        <span class="node-rating">Target Min: <strong>${targetDivisionMinRating}</strong></span>
                    </div>
                </div>

                <div class="roadmap-meter">
                    <div class="meter-label">
                        <span>Roadmap Completion</span>
                        <span id="roadmap-completion-percent">${progressPercent}%</span>
                    </div>
                    <div class="meter-bar-outer">
                        <div class="meter-bar-inner" id="roadmap-meter-inner" style="width: ${progressPercent}%"></div>
                    </div>
                </div>
            </div>
        </div>

        <div class="topics-grid">
            <div class="card">
                <div class="topics-card-header">
                    <h2 class="topics-card-title weak">
                        <span>⚠️ Practice Target (Weak Topics)</span>
                    </h2>
                </div>
                <div class="topic-list" id="weak-topic-root-list">
                    ${weakTopicsHTML}
                </div>
            </div>

            <div class="card">
                <div class="topics-card-header">
                    <h2 class="topics-card-title strong">
                        <span>🏆 Strength Profile (Strong Topics)</span>
                    </h2>
                </div>
                <div class="topic-list" id="strong-topic-root-list">
                    ${strongTopicsHTML}
                </div>
            </div>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        let currentRating = ${currentRating};
        const GOAL_LIMIT = getDynamicGoal; // Placeholders mapping fallback validation hooks safely

        function getDynamicGoal(solvedCount) {
            if (solvedCount < 10) return 15;
            if (solvedCount < 25) return 30;
            if (solvedCount < 45) return 50;
            return Math.ceil((solvedCount + 15) / 10) * 10;
        }

        document.getElementById('global-sync-trigger').addEventListener('click', () => {
            const btn = document.getElementById('global-sync-trigger');
            btn.innerText = 'Syncing...';
            btn.disabled = true;
            vscode.postMessage({ command: 'triggerSyncRefresh' });
        });

        function attachTopicCardListeners() {
            document.querySelectorAll('.solve-action-link').forEach(link => {
                const newLink = link.cloneNode(true);
                link.parentNode.replaceChild(newLink, link);

                newLink.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const topic = newLink.getAttribute('data-topic');
                    const wrapperDiv = document.getElementById('wrapper-' + topic);
                    const selectorDiv = document.getElementById('updater-' + topic);
                    const blockDiv = document.getElementById('block-' + topic);
                    const container = document.getElementById('problems-' + topic);
                    
                    if (wrapperDiv.style.display === 'none' || wrapperDiv.style.display === '') {
                        wrapperDiv.style.display = 'flex';
                        newLink.innerText = 'Click to go back';
                        newLink.classList.add('active-back');
                        
                        let base = Math.ceil(currentRating / 100) * 100;
                        if (base === currentRating) base += 100;
                        
                        selectorDiv.innerHTML = '';
                        for(let i = 0; i < 4; i++) {
                            const targetRating = base + (i * 100);
                            const rBtn = document.createElement('button');
                            rBtn.className = 'rating-btn';
                            rBtn.innerText = targetRating;
                            
                            rBtn.onclick = () => {
                                selectorDiv.querySelectorAll('.rating-btn').forEach(b => b.classList.remove('selected-rate'));
                                rBtn.classList.add('selected-rate');

                                blockDiv.style.display = 'flex';
                                container.innerHTML = '<span style="font-size:0.8rem; color:var(--text-secondary); padding: 4px;">Fetching recommendations...</span>';
                                
                                vscode.postMessage({
                                    command: 'fetchRecommendations',
                                    topic: topic,
                                    rating: targetRating
                                });
                            };
                            selectorDiv.appendChild(rBtn);
                        }
                    } else {
                        wrapperDiv.style.display = 'none';
                        blockDiv.style.display = 'none';
                        container.innerHTML = '';
                        selectorDiv.innerHTML = '';
                        
                        newLink.innerText = 'Click below to solve new problems';
                        newLink.classList.remove('active-back');
                    }
                });
            });

            document.querySelectorAll('.cancel-action-link').forEach(cancelBtn => {
                const newCancel = cancelBtn.cloneNode(true);
                cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);

                newCancel.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const topic = newCancel.getAttribute('data-topic');
                    const selectorDiv = document.getElementById('updater-' + topic);
                    const blockDiv = document.getElementById('block-' + topic);
                    const container = document.getElementById('problems-' + topic);
                    
                    container.innerHTML = '';
                    blockDiv.style.display = 'none';
                    if(selectorDiv) {
                        selectorDiv.querySelectorAll('.rating-btn').forEach(b => b.classList.remove('selected-rate'));
                    }
                });
            });
        }

        attachTopicCardListeners();

        window.addEventListener('message', event => {
            const message = event.data;
            
            if (message.command === 'syncRefreshResponse') {
                const syncBtn = document.getElementById('global-sync-trigger');
                syncBtn.innerText = 'Sync Stats';
                syncBtn.disabled = false;

                if (message.status === 'success') {
                    const d = message.data;
                    currentRating = d.currentRating;

                    document.getElementById('stat-val-total').innerText = d.totalSubmissions;
                    document.getElementById('stat-val-solved').innerText = d.solvedCount;
                    document.getElementById('stat-val-accuracy').innerText = Math.round((d.acceptedSubmissions / d.totalSubmissions) * 100) + '%';

                    document.getElementById('roadmap-cur-rank').innerText = d.currentRank.charAt(0).toUpperCase() + d.currentRank.slice(1);
                    document.getElementById('roadmap-cur-rating').innerText = d.currentRating;
                    
                    const pointsNeeded = d.targetDivision.minRating > d.currentRating ? d.targetDivision.minRating - d.currentRating : 0;
                    const badgeContainer = document.getElementById('points-badge-container');
                    if (pointsNeeded > 0) {
                        badgeContainer.innerHTML = '<span class="points-badge">🎯 ' + pointsNeeded + ' points to target</span>';
                    } else {
                        badgeContainer.innerHTML = '<span class="points-badge" style="background: rgba(0,230,118,0.15); border-color: rgba(0,230,118,0.3); color: var(--success-color)">🎉 Target Reached!</span>';
                    }

                    const startRating = d.currentRating < 1200 ? 800 : (d.targetDivision.minRating === 1200 ? 800 : (d.targetDivision.minRating === 1400 ? 1200 : (d.targetDivision.minRating === 1600 ? 1400 : 1600)));
                    const range = d.targetDivision.minRating - startRating;
                    const pct = range > 0 ? Math.min(100, Math.max(5, Math.round(((d.currentRating - startRating) / range) * 100))) : 0;
                    
                    document.getElementById('roadmap-completion-percent').innerText = pct + '%';
                    document.getElementById('roadmap-meter-inner').style.width = pct + '%';

                    const weakCards = document.querySelectorAll('.weak-topic-card');
                    if (weakCards.length > 0 && d.weakTopics) {
                        d.weakTopics.forEach(([topic, count]) => {
                            const rawT = topic.toLowerCase();
                            const badge = document.getElementById('badge-' + rawT);
                            const bar = document.getElementById('bar-' + rawT);
                            const dynamicGoal = getDynamicGoal(count);
                            if(badge) badge.innerText = count + '/' + dynamicGoal + ' solved';
                            if(bar) bar.style.width = Math.min(100, Math.round((count / dynamicGoal) * 100)) + '%';
                        });
                    }

                    const strongCards = document.querySelectorAll('.strong-topic-card');
                    if (strongCards.length > 0 && d.strongTopics) {
                        d.strongTopics.forEach(([topic, count]) => {
                            const rawT = topic.toLowerCase();
                            const sBadge = document.getElementById('s-badge-' + rawT);
                            if(sBadge) sBadge.innerText = count + ' solved';
                        });
                    }
                }
            }

            if (message.command === 'recommendationsResponse') {
                const topic = message.topic;
                const problems = message.problems;
                const blockDiv = document.getElementById('block-' + topic);
                const container = document.getElementById('problems-' + topic);
                const wrapperDiv = document.getElementById('wrapper-' + topic);
                
                if (wrapperDiv.style.display === 'none') return;

                blockDiv.style.display = 'flex';
                container.innerHTML = '';

                if(!problems || problems.length === 0) {
                    container.innerHTML = '<span style="font-size:0.8rem; color:var(--text-secondary); padding: 4px;">No unsolved problems found in this range!</span>';
                    return;
                }

                problems.forEach(p => {
                    const link = document.createElement('a');
                    link.className = 'rec-prob-link';
                    link.href = 'https://codeforces.com/problemset/problem/' + p.contestId + '/' + p.index;
                    link.target = '_blank';
                    link.innerText = '[' + p.contestId + p.index + '] ' + p.name + ' (' + p.rating + ')';
                    container.appendChild(link);
                });
            }
        });
    </script>
</body>
</html>
  `;
}