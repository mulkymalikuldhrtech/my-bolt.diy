#!/bin/bash
echo "🧠 Starting AGI System..."

cd agi-system

# Start core system
echo "🚀 Launching AGI Core..."
npm start &
CORE_PID=$!

# Wait a bit for core to start
sleep 3

# Start autonomous agents
echo "🤖 Launching Autonomous Agents..."
npm run agent &
AGENT_PID=$!

echo "✅ AGI System is running!"
echo "🌐 Web interface: http://localhost:3000"
echo "🤖 Autonomous agents are thinking..."
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap 'echo "🛑 Stopping AGI System..."; kill $CORE_PID $AGENT_PID; exit' INT
wait
