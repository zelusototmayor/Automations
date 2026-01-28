#!/bin/bash

# Ralph Wiggum Loop for Better Coaching
# Usage:
#   ./loop.sh          # Build mode, unlimited
#   ./loop.sh 20       # Build mode, max 20 iterations
#   ./loop.sh plan     # Plan mode, unlimited
#   ./loop.sh plan 5   # Plan mode, max 5 iterations

set -e

MODE="build"
MAX_ITERATIONS=0  # 0 = unlimited
ITERATION=0

# Parse arguments
if [ "$1" = "plan" ]; then
    MODE="plan"
    shift
fi

if [ -n "$1" ] && [ "$1" -eq "$1" ] 2>/dev/null; then
    MAX_ITERATIONS=$1
fi

echo "🐛 Ralph Wiggum starting..."
echo "   Mode: $MODE"
echo "   Max iterations: $([ $MAX_ITERATIONS -eq 0 ] && echo 'unlimited' || echo $MAX_ITERATIONS)"
echo ""

# Select prompt file
if [ "$MODE" = "plan" ]; then
    PROMPT_FILE="PROMPT_plan.md"
else
    PROMPT_FILE="PROMPT_build.md"
fi

# Main loop
while true; do
    ITERATION=$((ITERATION + 1))

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📍 Iteration $ITERATION"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # Check iteration limit
    if [ $MAX_ITERATIONS -gt 0 ] && [ $ITERATION -gt $MAX_ITERATIONS ]; then
        echo "🛑 Max iterations ($MAX_ITERATIONS) reached. Stopping."
        break
    fi

    # Run Claude with the prompt
    cat "$PROMPT_FILE" | claude -p \
        --dangerously-skip-permissions \
        --model claude-sonnet-4-5-20250929 \
        --output-format=stream-json 2>&1 | tee "logs/ralph_${MODE}_$(date +%Y%m%d_%H%M%S).log"

    EXIT_CODE=$?

    if [ $EXIT_CODE -ne 0 ]; then
        echo "⚠️ Claude exited with code $EXIT_CODE"
        echo "   Continuing to next iteration..."
    fi

    echo ""
    echo "💤 Sleeping 5 seconds before next iteration..."
    sleep 5
done

echo ""
echo "🎉 Ralph Wiggum completed!"
echo "   Total iterations: $ITERATION"
