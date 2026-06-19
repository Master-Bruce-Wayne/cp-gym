function getRankColor(rank: string): string {
  const r = rank.toLowerCase();
  if (r.includes("legendary") || r.includes("grandmaster") || r.includes("red")) {
    return "#ff334b"; // Bright red
  }
  if (r.includes("master") || r.includes("orange")) {
    return "#ff9800"; // Orange
  }
  if (r.includes("candidate") || r.includes("purple")) {
    return "#d81b60"; // Violet / CM Purple
  }
  if (r.includes("expert") || r.includes("blue")) {
    return "#2979ff"; // Neon Blue
  }
  if (r.includes("specialist") || r.includes("cyan")) {
    return "#00e5ff"; // Bright Cyan
  }
  if (r.includes("pupil") || r.includes("green")) {
    return "#00e676"; // Emerald Green
  }
  if (r.includes("newbie") || r.includes("gray") || r.includes("grey")) {
    return "#b0bec5"; // Sleek gray
  }
  return "#00e5ff"; // Default cyan
}

function getRankBgGradient(rank: string): string {
  const color = getRankColor(rank);
  return `linear-gradient(135deg, ${color} 0%, rgba(20, 26, 42, 0.4) 100%)`;
}

function capitalize(str: string): string {
  if (!str) return "";
  return str.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
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
  
  // Calculate division progress
  const startRating = currentRating < 1200 
    ? 800 
    : (targetDivisionMinRating === 1200 ? 800 : (targetDivisionMinRating === 1400 ? 1200 : (targetDivisionMinRating === 1600 ? 1400 : 1600)));
  const range = targetDivisionMinRating - startRating;
  const progressPercent = range > 0 
    ? Math.min(100, Math.max(5, Math.round(((currentRating - startRating) / range) * 100))) 
    : 0;

  const pointsNeeded = targetDivisionMinRating > currentRating ? targetDivisionMinRating - currentRating : 0;
  const acceptanceRate = totalSubmissions > 0 ? Math.round((acceptedSubmissions / totalSubmissions) * 100) : 0;

  // Render weak topics HTML
  const weakTopicsHTML = weakTopics
    .map(([topic, count]) => {
      // Practice target is 10 solved problems
      const targetCount = 10;
      const progress = Math.min(100, Math.round((count / targetCount) * 100));
      return `
        <div class="topic-item">
          <div class="topic-header">
            <span class="topic-name">${capitalize(topic)}</span>
            <span class="topic-badge weak">${count}/${targetCount} solved</span>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar weak" style="width: ${progress}%"></div>
          </div>
        </div>
      `;
    })
    .join("");

  // Render strong topics HTML
  const strongTopicsHTML = strongTopics
    .map(([topic, count]) => {
      return `
        <div class="topic-item">
          <div class="topic-header">
            <span class="topic-name">${capitalize(topic)}</span>
            <span class="topic-badge strong">${count} solved</span>
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
    <!-- Fonts -->
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

        /* Container & Layout */
        .container {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            gap: 25px;
        }

        /* Header */
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

        /* Cards Base */
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

        /* Profile Summary Grid */
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

        .stat-card.solved::before {
            background: var(--success-color);
        }
        
        .stat-card.accuracy::before {
            background: #a855f7;
        }

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

        /* Roadmap Progression Card */
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

        .node-rank.target {
            color: var(--target-accent);
        }

        .node-rating {
            font-size: 0.85rem;
            color: var(--text-secondary);
        }

        .flow-arrow {
            color: var(--text-secondary);
            font-size: 1.5rem;
            font-weight: 300;
            opacity: 0.5;
        }

        /* Roadmap Progress Meter */
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

        /* Topic Columns Layout */
        .topics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 25px;
        }

        @media (max-width: 768px) {
            .topics-grid {
                grid-template-columns: 1fr;
            }
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

        .topics-card-title.weak {
            color: var(--warning-color);
        }

        .topics-card-title.strong {
            color: var(--success-color);
        }

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
            gap: 8px;
            transition: background 0.2s ease;
        }

        .topic-item:hover {
            background: rgba(255, 255, 255, 0.03);
        }

        .topic-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
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
        }

        .progress-bar {
            height: 100%;
            border-radius: 3px;
        }

        .progress-bar.weak {
            background: linear-gradient(90deg, rgba(255, 213, 79, 0.7) 0%, var(--warning-color) 100%);
        }

        .progress-bar.strong {
            background: linear-gradient(90deg, rgba(0, 230, 118, 0.7) 0%, var(--success-color) 100%);
        }

    </style>
</head>
<body>

    <div class="container">
        <!-- Header -->
        <header>
            <h1>
                <span>CP Gym Dashboard</span>
                <span class="gym-logo-badge">Active</span>
            </h1>
        </header>

        <!-- Profile Summary Card -->
        <div class="card">
            <div class="stats-grid">
                <div class="stat-card">
                    <span class="stat-label">Codeforces Handle</span>
                    <span class="stat-value" style="color: var(--accent-color)">${handle}</span>
                </div>
                <div class="stat-card">
                    <span class="stat-label">Total Submissions</span>
                    <span class="stat-value">${totalSubmissions}</span>
                </div>
                <div class="stat-card solved">
                    <span class="stat-label">Unique Solved</span>
                    <span class="stat-value" style="color: var(--success-color)">${solvedProblems}</span>
                </div>
                <div class="stat-card accuracy">
                    <span class="stat-label">Acceptance Rate</span>
                    <span class="stat-value" style="color: #c084fc">${acceptanceRate}%</span>
                </div>
            </div>
        </div>

        <!-- Roadmap / Progression Card -->
        <div class="card roadmap-card">
            <div class="roadmap-container">
                <div class="roadmap-header">
                    <span class="roadmap-title">Division Roadmap Progression</span>
                    ${pointsNeeded > 0 
                      ? `<span class="points-badge">🎯 ${pointsNeeded} points to target</span>`
                      : `<span class="points-badge" style="background: rgba(0,230,118,0.15); border-color: rgba(0,230,118,0.3); color: var(--success-color)">🎉 Target Reached!</span>`
                    }
                </div>

                <div class="roadmap-flow">
                    <div class="flow-node current">
                        <span class="node-label">Current Division</span>
                        <span class="node-rank current">${capitalize(currentRank)}</span>
                        <span class="node-rating">Rating: <strong>${currentRating}</strong></span>
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
                        <span>${progressPercent}%</span>
                    </div>
                    <div class="meter-bar-outer">
                        <div class="meter-bar-inner" style="width: ${progressPercent}%"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Topics Grid -->
        <div class="topics-grid">
            <!-- Weak Topics -->
            <div class="card">
                <div class="topics-card-header">
                    <h2 class="topics-card-title weak">
                        <span>⚠️ Practice Target (Weak Topics)</span>
                    </h2>
                </div>
                <div class="topic-list">
                    ${weakTopicsHTML}
                </div>
            </div>

            <!-- Strong Topics -->
            <div class="card">
                <div class="topics-card-header">
                    <h2 class="topics-card-title strong">
                        <span>🏆 Strength Profile (Strong Topics)</span>
                    </h2>
                </div>
                <div class="topic-list">
                    ${strongTopicsHTML}
                </div>
            </div>
        </div>
    </div>

</body>
</html>
  `;
}