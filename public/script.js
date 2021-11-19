var stage = null;
var count = 0;
const canvas1 = document.getElementById("canvas1");
const canvas2 = document.getElementById("canvas2");
const canvas = document.getElementById("canvas");
const ctx = canvas1.getContext("2d");
const ctx2 = canvas2.getContext("2d");
const contex = canvas.getContext("2d"); //final
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
var exercise = "";
function selectedExercise() {
  exercise = document.getElementById("exercise").value;
}
navigator.mediaDevices
  .getUserMedia({
    video: { width: 600, height: 600 },
    audio: true,
  })
  .then((stream) => {
    //addVideoStream(myVideo, stream);
    myVideo.srcObject = stream;
    myVideo.addEventListener("loadedmetadata", () => {
      myVideo.play();
    });
    const detectpose = async () => {
      const poses = await detector.estimatePoses(myVideo, false);
      // console.log(poses);
      ctx.drawImage(myVideo, 0, 0, 600, 600);
      // ctx.beginPath();
      // ctx.arc(300, 200, 5, 0, 3 * Math.PI);
      // ctx.fillStyle = "red";
      // ctx.fill();
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
        let lshoulderx = key[5].x;
        let lshouldery = key[5].y;
        let lelbowx = key[7].x;
        let lelbowy = key[7].y;
        let lwristx = key[9].x;
        let lwristy = key[9].y;
        let lhipx = key[11].x;
        let lhipy = key[11].y;
        let lkneex = key[13].x;
        let lkneey = key[13].y;
        let lanklex = key[15].x;
        let lankley = key[15].y;
        let rshoulderx = key[6].x;
        let rshouldery = key[6].y;
        let relbowx = key[8].x;
        let relbowy = key[8].y;
        let rwristx = key[10].x;
        let rwristy = key[10].y;
        let rhipx = key[12].x;
        let rhipy = key[12].y;
        let rkneex = key[14].x;
        let rkneey = key[14].y;
        let ranklex = key[16].x;
        let rankley = key[16].y;

        //console.log(shoulder);
        //po = find_angle1(shoulderx, shouldery, elbowx, elbowy, wristx, wristy);

        // let po = find_angle(
        //   rshoulderx,
        //   rshouldery,
        //   relbowx,
        //   relbowy,
        //   rwristx,
        //   rwristy
        // );
        // ctx.font = "30px Comic Sans MS";
        // ctx.fillStyle = "green";
        // ctx.fillText(ko, elbowx, elbowy);

        console.log(exercise);
        if (exercise == "leftcurls") {
          if (key[9].score > 0.3) {
            let leftcurlangle = find_angle1(
              lshoulderx,
              lshouldery,
              lelbowx,
              lelbowy,
              lwristx,
              lwristy
            );

            leftcurls(leftcurlangle);
          }
        } else if (exercise == "rightcurls") {
          if (key[10].score > 0.3) {
            let rightcurllangle = find_angle1(
              rshoulderx,
              rshouldery,
              relbowx,
              relbowy,
              rwristx,
              rwristy
            );
            rightcurls(rightcurllangle);
          }
        } else if (exercise == "JumpingJacks") {
          if (key[5].score > 0.3 && key[13].score > 0.3) {
            let po = find_angle1(
              lhipx,
              lhipy,
              lshoulderx,
              lshouldery,
              lwristx,
              lwristy
            );

            // }
            // if (key[13].score > 0.3) {
            let op = find_angle2(
              lanklex,
              lankley,
              lhipx,
              lhipy,
              lshoulderx,
              lshouldery
            );
            ctx.font = "100px Comic Sans MS";
            ctx.fillStyle = "green";
            //ctx.fillText(po, lelbowx, lelbowy);
            ctx.fillText(po, 300, 300);
            JumpingJacks(po, op);
          }
          // ctx.font = "100px Comic Sans MS";
          // ctx.fillStyle = "green";
          // //ctx.fillText(po, lelbowx, lelbowy);
          // ctx.fillText(po, 300, 300);
          // JumpingJacks(po, op);
        } else if (exercise == "squats") {
          if (key[13].score > 0.3) {
            let squatangle = find_angle1(
              lanklex,
              lankley,
              lkneex,
              lkneey,
              lhipx,
              lhipy
            );
            squats(squatangle);
          }
        } else if (exercise == "pushup") {
          if (key[9].score > 0.3) {
            let pushupa = find_angle1(
              lwristx,
              lwristy,
              lelbowx,
              lelbowy,
              lshoulderx,
              lshouldery
            );
            pushup(pushupa);
          }
        }
        // leftcurls(ko);
        // rightcurls(po); #give a choice to run this function and more function (jumping jacks, lunges , pushups)
        // ctx.font = "30px Comic Sans MS";
        // ctx.fillStyle = "green";
        // ctx.fillText(count, 40, 40);
        // console.log(count);
        contex.drawImage(canvas1, 0, 0);
        contex.clearRect(0, 500, 600, 100);
        contex.drawImage(canvas2, 0, 500);

        ctx2.clearRect(0, 0, 600, 100);
        ctx2.beginPath();
        ctx2.fillStyle = "red";
        ctx2.rect(0, 0, 600, 100);
        ctx2.fill();
        ctx2.font = "30px Comic Sans MS";
        ctx2.fillStyle = "black";
        //ctx2.clearRect(0, 0, 600, 100);
        ctx2.fillText(count, 300, 50);
      });
    };
    myVideo.addEventListener("loadeddata", async () => {
      const detectorConfig = {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        enableTracking: true,
        trackerType: poseDetection.TrackerType.BoundingBox,
      };
      detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        detectorConfig
      );

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

function find_angle1(Ax, Ay, Bx, By, Cx, Cy) {
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
function find_angle2(Ax, Ay, Bx, By, Cx, Cy) {
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

function leftcurls(ko) {
  if (ko > 150) {
    stage = "Down";
  }

  if (ko < 50 && stage == "Down") {
    stage = "Up";

    console.log((count -= 1));
  }
}

function JumpingJacks(ko, ok) {
  if (ko < 20 && ok > 170) {
    stage = "Down";
  }

  if (ko > 100 && ok < 170 && stage == "Down") {
    stage = "Up";
    console.log((count -= 1));
  }
}
function squats(ao) {
  if (ao > 160) {
    stage = "Down";
    //console.log("down");
  }
  if (ao < 120 && stage == "Down") {
    stage = "Up";
    //console.log("up");
    console.log((count -= 1));
  }
}

function pushup(lol) {
  if (lol > 170) {
    stage = "Down";
  }
  if (lol < 150 && stage == "Down") {
    stage = "Up";
    console.log((count -= 1));
  }
}

function rightcurls(ko) {
  if (ko > 150) {
    stage = "Down";
  }

  if (ko < 50 && stage == "Down") {
    stage = "Up";

    console.log((count -= 1));
  }
}

function reset() {
  count = 20;
}
