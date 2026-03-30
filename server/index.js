const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const { exec } = require("child_process"); 
const fs = require("fs"); 

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const users = {};
const activeRooms = new Set();
const userActivity = {};
const roomCode = {}; 

app.use(express.static(path.join(__dirname, "../public")));

io.on("connection", (socket) => {
    socket.on("join-room", ({ roomID, role, userName }) => {
        if (role === "host") {
            activeRooms.add(roomID);
            socket.join(roomID);
            return;
        }
        if (role === "student") {
            if (!activeRooms.has(roomID)) {
                socket.emit("invalid-room");
                return;
            }
            socket.join(roomID);
            users[socket.id] = { roomID, userName };
            if (roomCode[roomID]) {
                socket.emit("code-update", { code: roomCode[roomID] });
            }
            socket.to(roomID).emit("student-joined", { socketId: socket.id, userName });
        }
    });

    socket.on("run-code", ({ roomID, code, language }) => {
        let command = "";
        let filename = `temp_${socket.id}`; 
        switch (language) {
            case "JavaScript": filename += ".js"; command = `node ${filename}`; break;
            case "Python": filename += ".py"; command = `python "${filename}"`; break;
            case "C": filename += ".c"; command = `gcc ${filename} -o ${filename}.out && ./${filename}.out`; break;
            case "C++": filename += ".cpp"; command = `g++ ${filename} -o ${filename}.out && ./${filename}.out`; break;
            default: socket.emit("code-result", "Language not supported."); return;
        }
        fs.writeFile(filename, code, (err) => {
            if (err) return socket.emit("code-result", "Error: File creation failed.");
            exec(command, { timeout: 5000 }, (error, stdout, stderr) => {
                let output = error ? stderr || error.message : stdout || "Success (No output).";
                socket.emit("code-result", output);
                io.to(roomID).emit("terminal-update", { code: output });
                fs.unlink(filename, () => {});
                if (fs.existsSync(`${filename}.out`)) fs.unlink(`${filename}.out`, () => {});
            });
        });
    });

    socket.on("code-update", ({ roomID, code }) => {
        roomCode[roomID] = code; 
        socket.to(roomID).emit("code-update", { code });
    });

    socket.on("terminal-update", ({ roomID, code }) => {
        socket.to(roomID).emit("terminal-update", { code });
    });

    socket.on("chat-message", ({ roomID, message, sender }) => {
        io.to(roomID).emit("receive-message", { sender, message });
    });

    socket.on("timer-update", ({ roomID, timeLeft }) => {
        socket.to(roomID).emit("timer-update", { timeLeft });
    });

    socket.on("timer-stopped", ({ roomID }) => {
        socket.to(roomID).emit("timer-stopped");
    });

    socket.on("language-change", ({ roomID, lang }) => {
        socket.to(roomID).emit("language-updated", lang);
    });

    socket.on("disconnect", () => {
        const user = users[socket.id];
        if (user) {
            socket.to(user.roomID).emit("student-left", { socketId: socket.id });
            delete users[socket.id];
            delete userActivity[socket.id];
        }
    });

    socket.on("user-activity", () => {
        userActivity[socket.id] = Date.now();
    });
});

setInterval(() => {
    const now = Date.now();
    for (let socketId in users) {
        const lastActive = userActivity[socketId] || now;
        const diff = (now - lastActive) / 1000;
        let status = diff > 600 ? "red" : (diff > 300 ? "yellow" : "green");
        io.to(users[socketId].roomID).emit("user-status", { socketId, status });
    }
}, 5000);

server.listen(3000, () => console.log(`Server running at http://localhost:3000`));