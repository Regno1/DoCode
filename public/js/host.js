const urlParams = new URLSearchParams(window.location.search);
const roomID = urlParams.get("room");

if (!roomID) {
  window.location.href = "index.html";
}

const displayRoomID = document.getElementById("displayRoomID");
const hostEditor = document.getElementById("HostEditor");
const hostTerminal = document.getElementById("HostTerminal");
const userMsg = document.getElementById("userMsg");
const chatBox = document.getElementById("chatBox");
const studentList = document.getElementById("studentList");

displayRoomID.innerText = roomID;

const socket = io("http://localhost:3000");

socket.emit("join-room", {
  roomID,
  role: "host",
  userName: "Host"
});

hostEditor.addEventListener("input", () => {
  socket.emit("code-update", {
    roomID,
    code: hostEditor.value
  });
});
hostTerminal.addEventListener("input",()=>{
  socket.emit("terminal-update",{
  roomID,
  code:hostTerminal.value    
  })
})

userMsg.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && userMsg.value.trim() !== "") {
    socket.emit("chat-message", {
      roomID,
      message: userMsg.value,
      sender: "Host"
    });
    userMsg.value = "";
  }
});


socket.on("receive-message", (data) => {
  appendMessage(`<b>${data.sender}:</b> ${data.message}`);
});

function appendMessage(msg) {
  const div = document.createElement("div");
  div.innerHTML = msg;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}



document.getElementById("Language").addEventListener("change", (e) => {
  const lang = e.target.value;

  hostEditor.value = getBoilerplate(lang);

  socket.emit("language-change", {
    roomID,
    lang
  });

  socket.emit("code-update", {
    roomID,
    code: hostEditor.value
  });
});

let timerInterval;

function startTimer() {

  let timeInSeconds =
    parseInt(document.getElementById("Timer").value) * 60;

  clearInterval(timerInterval);

  timerInterval = setInterval(() => {

    if (timeInSeconds <= 0) {
      clearInterval(timerInterval);

      document.getElementById("timerDisplay").innerText = "00:00";

      socket.emit("timer-stopped", { roomID });

      return;
    }

    timeInSeconds--;

    const mins = Math.floor(timeInSeconds / 60);
    const secs = timeInSeconds % 60;

    const formatted =
      `${mins}:${secs < 10 ? "0" : ""}${secs}`;

    document.getElementById("timerDisplay").innerText = formatted;

    socket.emit("timer-update", {
      roomID,
      timeLeft: formatted
    });

  }, 1000);
}


function stopTimer() {
  clearInterval(timerInterval);
  socket.emit("stop-timer", { roomID });
}

function copyRoomID() {
  navigator.clipboard.writeText(roomID);
}

socket.on("student-joined", ({ socketId, userName }) => {

  if (document.getElementById(socketId)) return;

  const div = document.createElement("div");
  div.className = "student-item";
  div.id = socketId;
  div.innerHTML = `${userName} <span class="online-dot"></span>`;

  document.getElementById("studentList").appendChild(div);
});

socket.on("student-left", ({ socketId }) => {
  const el = document.getElementById(socketId);
  if (el) el.remove();
});

document.querySelector(".run button").addEventListener("click", () => {
  const language = document.getElementById("Language").value;

  socket.emit("run-code", {
    roomID,
    code: hostEditor.value,
    language
  });
});

socket.on("code-result", (output) => {
  hostTerminal.value = output;
});

socket.on("user-status", ({ socketId, status }) => {
  const student = document.getElementById(socketId);

  if (!student) return;

  const dot = student.querySelector(".online-dot");

  if (dot) {
   if (status === "green") {
  dot.style.background = "#1aff6e";
}

if (status === "yellow") {
  dot.style.background = "#facc15";
}

if (status === "red") {
  dot.style.background = "#ff0a0a";
}
  }
});


