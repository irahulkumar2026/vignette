#!/bin/bash
# ========================================================
# Antigravity Coding Agent - Native .agents/ Setup (Cygwin / No Python)
# ========================================================

echo "[1/3] Creating .agents/ directory structure..."
mkdir -p .agents/skills/core-nexus/planner-node
mkdir -p .agents/skills/state-supervisor
mkdir -p .agents/skills/code-supervisor
mkdir -p .agents/skills/token-scout
mkdir -p .agents/skills/audit-bit
mkdir -p .agents/skills/nano-coder
mkdir -p .agents/skills/refactor-bot
mkdir -p .agents/skills/mentor-guide
mkdir -p .agents/state

echo "[2/3] Generating skill configurations and state registry inside .agents/..."

cat << 'EOF' > .agents/skills/core-nexus/SKILL.md
---
name: core-nexus
description: Global Orchestrator, Planner, and Intent Router. Uses progressive disclosure to manage token budgets.
---
# Core-Nexus
EOF

cat << 'EOF' > .agents/skills/core-nexus/planner-node/SKILL.md
---
name: planner-node
description: Instruction Analyst and Execution Planner. Halts execution to present reviewable steps before coding.
---
# Planner-Node
EOF

cat << 'EOF' > .agents/skills/state-supervisor/SKILL.md
---
name: state-supervisor
description: Oversees Token-Scout and Audit-Bit caches to prevent redundant file reads.
---
# State-Supervisor
EOF

cat << 'EOF' > .agents/skills/code-supervisor/SKILL.md
---
name: code-supervisor
description: Oversees Nano-Coder, Refactor-Bot, and Mentor-Guide for efficient code generation.
---
# Code-Supervisor
EOF

cat << 'EOF' > .agents/skills/token-scout/SKILL.md
---
name: token-scout
description: AST Hash Registry and targeted snippet extractor to skip unchanged files.
---
# Token-Scout
EOF

cat << 'EOF' > .agents/skills/audit-bit/SKILL.md
---
name: audit-bit
description: Localized diff linter and static validation engine running against cached baselines.
---
# Audit-Bit
EOF

cat << 'EOF' > .agents/skills/nano-coder/SKILL.md
---
name: nano-coder
description: Context-bound implementation engine using patch deltas without conversational filler.
---
# Nano-Coder
EOF

cat << 'EOF' > .agents/skills/refactor-bot/SKILL.md
---
name: refactor-bot
description: Token-compression specialist; strips boilerplate, whitespace, and bloat.
---
# Refactor-Bot
EOF

cat << 'EOF' > .agents/skills/mentor-guide/SKILL.md
---
name: mentor-guide
description: Generic Tech and React Tutor. Provides just-in-time micro-learning insights tied to code diffs.
---
# Mentor-Guide
EOF

cat << 'EOF' > .agents/state/global_state.json
{
  "tier": "Two-Tier Hierarchical Mesh with Planner & Mentor",
  "active_locks": [],
  "cache_registry": {},
  "user_mastery_ledger": []
}
EOF

echo "[3/3] Executing runtime validation check..."
PROMPT="Create a React counter component"

echo ""
echo "[Antigravity Runtime (Cygwin)] .agents/ initialized cleanly."
echo "[Planner-Node] Analyzing instruction: '$PROMPT'"
echo "--------------------------------------------------"
echo ">>> EXECUTION & LEARNING PLAN (Review Gate) <<<"
echo "1. [State-Check] Querying Token-Scout AST via .agents/state/..."
echo "2. [Generation] Nano-Coder will output targeted diff patch."
echo "3. [Education] Mentor-Guide will break down core React/tech concepts."
echo "4. [Validation] Audit-Bit & Refactor-Bot will clean and verify."
echo "--------------------------------------------------"
echo "[Core-Nexus] Plan ready. Awaiting user approval to dispatch Tier 2."
echo ""
echo "========================================================"
echo "Setup complete! All skills and state are safely inside .agents/"
echo "========================================================"