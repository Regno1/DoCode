# DoCode

A real-time collaborative coding platform that lets multiple users write, run, and discuss code together in the same session — built for pair programming, teaching, and interviews.

**Live Demo:** [docode-e4jc.onrender.com](https://docode-e4jc.onrender.com/)

## Features

- **Real-time collaborative editor** — code changes sync instantly across all connected users in a room
- **Room-based sessions** — create or join a room using a unique room ID
- **Teacher/Student roles** — role-based permissions to control who can edit vs. view
- **In-app chat** — built-in messaging so users can discuss code without leaving the session
- **Multi-language support** — write and run code in multiple programming languages
- **In-browser code execution** — run code directly from the editor and see output instantly

## Tech Stack

**Frontend:** React
**Backend:** Node.js, Express
**Real-time Communication:** Socket.IO

## How It Works

1. A user creates a room and shares the room ID with collaborators
2. Other users join the room using the ID
3. Socket.IO maintains a persistent connection between all clients in a room, broadcasting code changes and chat messages in real time
4. The backend handles room state, role assignment, and code execution requests

## Getting Started

### Prerequisites
- Node.js installed on your machine

### Installation

```bash
# Clone the repository
git clone https://github.com/regno001/DoCode.git
cd DoCode

# Install dependencies (adjust paths below to match your folder structure,
# e.g. separate /client and /server directories)
npm install
```

### Running Locally

```bash
# Start the backend server
npm run server

# In a separate terminal, start the frontend
npm run client
```

> Note: Update the commands above to match your actual npm scripts / folder structure (e.g. if client and server are in separate directories, `cd` into each and run `npm start` there).

## Author

**Rahul Rawat**
- Portfolio: [rahulrawat.netlify.app](http://rahulrawat.netlify.app)
- LinkedIn: [rahul-rawat-992863321](https://linkedin.com/in/rahul-rawat-992863321)
- GitHub: [@regno001](https://github.com/regno1)

## License

This project is open source and available for learning and reference purposes.
