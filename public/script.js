const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myPeer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "3002",
});
const myVideo = document.getElementById("myVideo");
myVideo.muted = true;
const canvasStream = canvas.captureStream();
const peers = {};
var color = "blue";
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    //addVideoStream(myVideo, stream);
    myVideo.srcObject = stream;
    myVideo.addEventListener("loadedmetadata", () => {
      myVideo.play();
    });
    const detectpose = async () => {
      const poses = await detector.estimatePoses(myVideo);
      //console.log(poses);
      ctx.drawImage(myVideo, 0, 0, 600, 400);
      poses.forEach((pred) => {
        const key = pred.keypoints;
        for (let i = 0; i < key.length; i++) {
          const x = key[i].x;
          const y = key[i].y;

          ctx.beginPath();
          ctx.arc(x, y, 5, 0, 3 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();
        }
      });
    };

    myVideo.addEventListener("loadeddata", async () => {
      detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet
      );
      detectpose();
      setInterval(detectpose, 20);
    });
  });

myPeer.on("call", (call) => {
  console.log("Sending my stream" + canvasStream);
  call.answer(canvasStream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    console.log("Receiving  user stream", userVideoStream);
    addVideoStream(video, userVideoStream);
  });
});

socket.on("user-connected", (userId) => {
  connectToNewUser(userId, canvasStream);
});
socket.on("user-disconnected", (userId) => {
  if (peers[userId]) peers[userId].close();
});

myPeer.on("open", (id) => {
  console.log("Join room", ROOM_ID, id);
  socket.emit("join-room", ROOM_ID, id);
});

function connectToNewUser(userId, stream) {
  console.log("Connecting to new user:" + userId);
  const video = document.createElement("video");
  const call = myPeer.call(userId, stream);
  console.log(call);
  call.on("stream", (userVideoStream) => {
    console.log("Receiving  user stream" + userId);
    addVideoStream(video, userVideoStream);
  });
  call.on("close", () => {
    video.remove();
  });

  peers[userId] = call;
}

function addVideoStream(video, stream) {
  console.log("addVideoStream:", video, stream.length);
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
}
