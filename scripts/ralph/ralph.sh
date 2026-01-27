#!/bin/bash

# Ralph Loop for Claude Code
# Runs Claude Code repeatedly until all PRD items are complete

set -e

# Configuration
MAX_ITERATIONS=${1:-10}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
PRD_FILE="$SCRIPT_DIR/prd.json"
PROGRESS_FILE="$SCRIPT_DIR/progress.txt"
PROMPT_FILE="$SCRIPT_DIR/prompt.md"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           Ralph Loop - Better Coaching UI Revamp           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Project Root:${NC} $PROJECT_ROOT"
echo -e "${YELLOW}PRD File:${NC} $PRD_FILE"
echo -e "${YELLOW}Max Iterations:${NC} $MAX_ITERATIONS"
echo ""

# Check prerequisites
if ! command -v claude &> /dev/null; then
    echo -e "${RED}Error: Claude Code CLI not found. Please install it first.${NC}"
    exit 1
fi

if ! command -v jq &> /dev/null; then
    echo -e "${RED}Error: jq not found. Please install it: brew install jq${NC}"
    exit 1
fi

if [ ! -f "$PRD_FILE" ]; then
    echo -e "${RED}Error: PRD file not found at $PRD_FILE${NC}"
    exit 1
fi

# Function to check PRD completion status
check_completion() {
    local total=$(jq '.userStories | length' "$PRD_FILE")
    local completed=$(jq '[.userStories[] | select(.passes == true)] | length' "$PRD_FILE")
    echo "$completed/$total"
}

# Function to get next story
get_next_story() {
    jq -r '[.userStories[] | select(.passes == false)] | sort_by(.priority) | .[0].id // "NONE"' "$PRD_FILE"
}

# Main loop
echo -e "${GREEN}Starting Ralph Loop...${NC}"
echo ""

for ((i=1; i<=MAX_ITERATIONS; i++)); do
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}🔄 Ralph Iteration $i of $MAX_ITERATIONS${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

    # Check current progress
    PROGRESS=$(check_completion)
    NEXT_STORY=$(get_next_story)

    echo -e "${GREEN}Progress:${NC} $PROGRESS stories complete"
    echo -e "${GREEN}Next story:${NC} $NEXT_STORY"
    echo ""

    if [ "$NEXT_STORY" == "NONE" ]; then
        echo -e "${GREEN}✅ All stories complete!${NC}"
        echo "<promise>COMPLETE</promise>"
        break
    fi

    # Run Claude Code with the prompt
    echo -e "${YELLOW}Running Claude Code...${NC}"
    echo ""

    # Change to project root and run Claude
    cd "$PROJECT_ROOT"

    # Run Claude Code with prompt piped in
    # Using --dangerously-skip-permissions for autonomous operation
    # You may need to adjust flags based on your Claude Code version
    OUTPUT=$(cat "$PROMPT_FILE" | claude --dangerously-skip-permissions 2>&1 | tee /dev/stderr) || true

    # Check for completion signal
    if echo "$OUTPUT" | grep -q "<promise>COMPLETE</promise>"; then
        echo ""
        echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║           🎉 UI REVAMP COMPLETE! 🎉                        ║${NC}"
        echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
        break
    fi

    # Brief pause between iterations
    echo ""
    echo -e "${YELLOW}Iteration $i complete. Pausing before next iteration...${NC}"
    sleep 2
done

# Final status
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Final Status${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
FINAL_PROGRESS=$(check_completion)
echo -e "${GREEN}Stories completed:${NC} $FINAL_PROGRESS"
echo ""
echo -e "${YELLOW}Remaining stories:${NC}"
jq -r '.userStories[] | select(.passes == false) | "  - \(.id): \(.title)"' "$PRD_FILE"
echo ""
