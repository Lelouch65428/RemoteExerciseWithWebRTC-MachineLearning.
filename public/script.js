var stage = null;
var count = 0;
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myPeer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "443",
});
const myVideo = document.getElementById("myVideo");
myVideo.muted = true;
const canvasStream = canvas.captureStream();
const peers = {};
var color = "blue";
navigator.mediaDevices
  .getUserMedia({
    video: { width: 600, height: 400 },
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
      const mesh = {
        face: [4, 2, 0, 1, 3],
        rightHand: [6, 8, 10],
        leftHand: [5, 7, 9],
        leftLeg: [5, 11, 13, 15],
        rightLeg: [6, 12, 14, 16],
        hip: [11, 12],
        shoulder: [6, 5],
      };
      poses.forEach((pred) => {
        const points = pred.keypoints;
        for (let j = 0; j < Object.keys(mesh).length; j++) {
          let Head_Line = Object.keys(mesh)[j];
          //console.log(Head_Line);

          for (let k = 0; k < mesh[Head_Line].length - 1; k++) {
            const firstJointIndex = mesh[Head_Line][k];
            const secondJointIndex = mesh[Head_Line][k + 1];

            if (
              points[firstJointIndex].score > 0.4 &&
              points[secondJointIndex].score > 0.4
            ) {
              //console.log(secondJointIndex);
              ctx.beginPath();
              ctx.moveTo(points[firstJointIndex].x, points[firstJointIndex].y);
              ctx.lineTo(
                points[secondJointIndex].x,
                points[secondJointIndex].y
              );
              //console.log([secondJointIndex][0]);

              ctx.strokeStyle = "red";
              ctx.lineWidth = 4;
              ctx.stroke();
            }
          }
        }
        const key = pred.keypoints;
        for (let i = 0; i < key.length; i++) {
          if (key[i].score > 0.5) {
            const x = key[i].x;
            const y = key[i].y;

            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 3 * Math.PI);
            ctx.fillStyle = "blue";
            ctx.fill();
          }
        }

        let shoulderx = key[5].x;
        let shouldery = key[5].y;
        let elbowx = key[7].x;
        let elbowy = key[7].y;
        let wristx = key[9].x;
        let wristy = key[9].y;

        //console.log(shoulder);
        let ko = find_angle(
          shoulderx,
          shouldery,
          elbowx,
          elbowy,
          wristx,
          wristy
        );
        ctx.font = "30px Comic Sans MS";
        ctx.fillStyle = "green";
        ctx.fillText(ko, elbowx, elbowy);

        if (ko > 150) {
          stage = "Down";
        }

        if (ko < 50 && stage == "Down") {
          stage = "Up";
          count += 1;
        }
        ctx.font = "30px Comic Sans MS";
        ctx.fillStyle = "green";
        ctx.fillText(count, 40, 40);
        console.log(count);
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

function find_angle(Ax, Ay, Bx, By, Cx, Cy) {
  var AB = Math.sqrt(Math.pow(Bx - Ax, 2) + Math.pow(By - Ay, 2));
  var BC = Math.sqrt(Math.pow(Bx - Cx, 2) + Math.pow(By - Cy, 2));
  var AC = Math.sqrt(Math.pow(Cx - Ax, 2) + Math.pow(Cy - Ay, 2));
  var angles =
    Math.acos((BC * BC + AB * AB - AC * AC) / (2 * BC * AB)) * (180 / Math.PI);
  if (angles > 180) {
    angles = 360 - angles;
  }
  return angles;
}
