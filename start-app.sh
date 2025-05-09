#!/bin/bash

# Set color codes for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Display startup message
echo -e "${BLUE}========================================================${NC}"
echo -e "${BLUE}  Starting WhatsManage Invoice Generator${NC}"
echo -e "${BLUE}========================================================${NC}"
echo ""

# Function to check if a port is in use
is_port_in_use() {
  lsof -i:"$1" &>/dev/null
  return $?
}

# Function to gracefully stop a process
stop_process() {
  local port=$1
  local process_name=$2
  
  if is_port_in_use "$port"; then
    echo -e "${YELLOW}Found existing $process_name on port $port...${NC}"
    
    # Get PID of the process using the port
    local pid=$(lsof -ti:"$port")
    
    # Try graceful shutdown first
    echo -e "   ${YELLOW}Attempting graceful shutdown...${NC}"
    kill "$pid" 2>/dev/null
    
    # Wait up to 5 seconds for process to end
    for i in {1..5}; do
      if ! is_port_in_use "$port"; then
        echo -e "   ${GREEN}Process stopped successfully.${NC}"
        return 0
      fi
      sleep 1
    done
    
    # If process is still running, force kill
    echo -e "   ${YELLOW}Graceful shutdown timed out, forcing termination...${NC}"
    kill -9 "$pid" 2>/dev/null
    sleep 1
    
    if ! is_port_in_use "$port"; then
      echo -e "   ${GREEN}Process terminated.${NC}"
    else
      echo -e "   ${RED}Failed to terminate process on port $port.${NC}"
      echo -e "   ${RED}Please manually kill the process and try again.${NC}"
      return 1
    fi
  else
    return 0
  fi
}

# Stop any processes using our ports
echo -e "${BLUE}Checking for existing processes...${NC}"
stop_process 8000 "Email Server" || exit 1
stop_process 3000 "Frontend Application" || exit 1

# Create uploads directory if it doesn't exist
if [ ! -d "server/uploads" ]; then
  echo -e "${BLUE}Creating uploads directory...${NC}"
  mkdir -p server/uploads
  echo -e "${GREEN}✓ Directory created${NC}"
fi

# Check if server.js exists
if [ ! -f "server.js" ]; then
  echo -e "${RED}Error: server.js not found${NC}"
  exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
  echo -e "${YELLOW}Warning: .env file not found. Creating from example...${NC}"
  if [ -f "server/.env" ]; then
    cp server/.env .env
    echo -e "${GREEN}✓ Created .env from server/.env${NC}"
  else
    echo -e "${RED}Error: No .env file found. Email functionality may not work.${NC}"
    echo -e "${YELLOW}Creating basic .env file...${NC}"
    echo "PORT=8000" > .env
  fi
fi

# Check network connectivity to email server
echo -e "${BLUE}Checking network connectivity...${NC}"
if ping -c 1 smtp.gmail.com &>/dev/null; then
  echo -e "${GREEN}✓ Network connectivity to SMTP server is good${NC}"
else
  echo -e "${YELLOW}Warning: Cannot reach smtp.gmail.com${NC}"
  echo -e "${YELLOW}Email sending may not work. Check your internet connection.${NC}"
fi

# Start the server
echo ""
echo -e "${BLUE}Starting Email Server on port 8000...${NC}"
node server.js > server.log 2>&1 &
SERVER_PID=$!
echo -e "${GREEN}✓ Server started (PID: $SERVER_PID)${NC}"

# Give the server a moment to start
sleep 2

# Check if server is running
if ! kill -0 $SERVER_PID 2>/dev/null; then
  echo -e "${RED}Error: Server failed to start.${NC}"
  echo -e "${YELLOW}Checking server logs:${NC}"
  tail -n 10 server.log
  exit 1
fi

# Verify server is responding
echo -e "${BLUE}Verifying server is responding...${NC}"
for i in {1..5}; do
  if curl -s http://localhost:8000/api/health &>/dev/null; then
    echo -e "${GREEN}✓ Server is responding${NC}"
    break
  fi
  
  if [ $i -eq 5 ]; then
    echo -e "${RED}Error: Server is not responding.${NC}"
    echo -e "${YELLOW}Checking server logs:${NC}"
    tail -n 10 server.log
    exit 1
  fi
  
  echo -e "${YELLOW}Waiting for server to start... ($i/5)${NC}"
  sleep 2
done

# Start the frontend
echo ""
echo -e "${BLUE}Starting Frontend Application...${NC}"
PORT=3000 npm start > frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"

# Wait for frontend to be available (up to 30 seconds)
echo -e "${BLUE}Waiting for frontend to be available...${NC}"
MAX_RETRIES=15
RETRY_COUNT=0
FRONTEND_STARTED=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  # Check if the process is still running
  if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo -e "${RED}Error: Frontend process terminated unexpectedly${NC}"
    echo -e "${YELLOW}Checking frontend logs:${NC}"
    tail -n 15 frontend.log
    exit 1
  fi
  
  # Try to connect to the frontend port
  if curl -s http://localhost:3000 -o /dev/null; then
    FRONTEND_STARTED=true
    echo -e "${GREEN}✓ Frontend is running at http://localhost:3000${NC}"
    break
  fi
  
  RETRY_COUNT=$((RETRY_COUNT+1))
  echo -e "${YELLOW}Waiting for frontend to start... ($RETRY_COUNT/$MAX_RETRIES)${NC}"
  sleep 2
done

if [ "$FRONTEND_STARTED" = false ]; then
  echo -e "${RED}Error: Frontend application failed to start on port 3000${NC}"
  echo -e "${YELLOW}Possible causes:${NC}"
  echo -e "  • Port 3000 might be in use by another application"
  echo -e "  • React application might have encountered an error"
  echo -e "  • There might be dependency issues"
  echo -e ""
  echo -e "${YELLOW}Try these solutions:${NC}"
  echo -e "  • Check frontend.log for specific errors: ${BLUE}cat frontend.log${NC}"
  echo -e "  • Kill all node processes: ${BLUE}pkill node${NC} and try again"
  echo -e "  • Run npm start manually to see detailed errors"
  echo -e "  • Check your package.json for correct start script"
  exit 1
fi

echo ""
echo -e "${BLUE}========================================================${NC}"
echo -e "${GREEN}  Application Running!${NC}"
echo -e "${BLUE}  Frontend: ${NC}http://localhost:3000"
echo -e "${BLUE}  Backend: ${NC}http://localhost:8000"
echo -e "${BLUE}  Health Check: ${NC}http://localhost:8000/api/health"
echo -e "${BLUE}  Logs: ${NC}server.log, frontend.log"
echo -e "${BLUE}========================================================${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"

# Function to clean up processes on exit
cleanup() {
  echo ""
  echo -e "${BLUE}Shutting down services...${NC}"
  kill $SERVER_PID 2>/dev/null
  kill $FRONTEND_PID 2>/dev/null
  echo -e "${GREEN}Application stopped.${NC}"
  exit 0
}

# Set up trap to catch Ctrl+C
trap cleanup INT

# Wait for user to press Ctrl+C
wait 