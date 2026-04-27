document.addEventListener("DOMContentLoaded", () => {

  const urlParams = new URLSearchParams(window.location.search);
  const roomID = urlParams.get("room");
  const userName = urlParams.get("name") || "Student";
 
  if (!roomID) {
    window.location.href = "index.html";
    return;
  }

  const socket = io("http://localhost:3000");
  let activeLanguage = "JavaScript";

  document.getElementById("currentRoom").innerText = roomID;

  socket.emit("join-room", {
    roomID,
    role: "student",
    userName
  });

  socket.on("invalid-room", () => {
    alert("Invalid room ID. Please check with your teacher.");
    window.location.href = "index.html";
  });

  socket.on("room-closed", () => {
    alert("This class has ended.");
    window.location.href = "index.html";
  });

  socket.on("code-update", (data) => {
    document.getElementById("TeacherCode").value = data.code;
  });
  socket.on("terminal-update" ,(data)=>{
    document.getElementById("TeacherTerminal").value= data.code;
  });

  socket.on("timer-update", (data) => {
    document.getElementById("timerDisplay").innerText = data.timeLeft;
  });

  socket.on("timer-stopped", () => {
    
    document.getElementById("timerDisplay").innerText = "00:00";
  });

  socket.on("language-updated", (lang) => {
    activeLanguage = lang;
    document.getElementById("activeLang").innerText = lang;
  });

  const userMsg = document.getElementById("userMsg");
  const chatBox = document.getElementById("chatBox");

  userMsg.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && userMsg.value.trim() !== "") {
      socket.emit("chat-message", {
        roomID,
        message: userMsg.value,
        sender: userName
      });
      
      userMsg.value = "";
    }
  });

  socket.on("receive-message", (data) => {
    appendMessage(data.sender, data.message);
  });

  function appendMessage(sender, message) {
    const div = document.createElement("div");
    const name = document.createElement("b");
    name.textContent = `${sender}: `;
    div.appendChild(name);
    div.append(document.createTextNode(message));
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  document.querySelector(".run button").addEventListener("click", () => {
    socket.emit("run-code", {
      roomID,
      code: document.getElementById("StudentEditor").value,
      language: activeLanguage
    });
  });

  socket.on("code-result", (output) => {
    const terminal = document.getElementById("StudentTerminal");
    terminal.value += `\n> ${output}\n`;
    terminal.scrollTop = terminal.scrollHeight;
  });

  let lastActivitySent = 0;
  const sendActivity = () => {
    const now = Date.now();
    if (now - lastActivitySent < 5000) return;
    lastActivitySent = now;
    socket.emit("user-activity");
  };

  ["keydown", "mousemove", "click", "input"].forEach((eventName) => {
    document.addEventListener(eventName, sendActivity);
  });
  sendActivity();

});

function toggleChat() {
  document.getElementById("chatFloat").classList.toggle("minimized");
}

