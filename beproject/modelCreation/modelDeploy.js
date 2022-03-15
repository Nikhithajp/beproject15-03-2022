let video;
let poseNet;
let pose;
let skeleton;
let posesArray = ['Mountain', 'Tree',  'Downward Dog','Warrior I', 'Warrior II', 'Chair'];

let yogi;
let poseLabel;


function setup() {
  var canvas = createCanvas(640, 480);
  canvas.position(130, 210);
  video = createCapture(VIDEO);
  video.hide();
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on('pose', gotPoses);
  
  let options = {
    inputs: 34,
    outputs: 6,
    task: 'classification',
    debug: true
  }
  
  yogi = ml5.neuralNetwork(options);
  const modelInfo = {
    model: 'modelv2/model2.json',
    metadata: 'modelv2/model_meta2.json',
    weights: 'modelv2/model.weights2.bin',
  };
  yogi.load(modelInfo, yogiLoaded);
}

function yogiLoaded(){
  console.log("Model ready!");
  classifyPose();
}

function calculate_angle(P1,P2,P3) {
  var angle = (
      Math.atan2(
          P2.position.y - P1.position.y,
          P2.position.x - P1.position.x
      )
      - Math.atan2(
          P3.position.y - P1.position.y,
          P3.position.x - P1.position.x
      )
  ) * (180 / Math.PI);
  if (angle > 90) {
      angle = 450 - angle;
  } else {
      angle = 90 - angle;
  }
  return angle;
}


function classifyPose(){
  if (pose) {
    let inputs = [];
    // angle is denoted by angle(P1,P2,P3) where P1 is the 'origin'
    let lKnee_lAnkle_lHip = calculate_angle(pose.keypoints[13], pose.keypoints[15], pose.keypoints[11]);
    let rKnee_rAnkle_rHip = calculate_angle(pose.keypoints[14], pose.keypoints[16], pose.keypoints[12]);
    inputs.push(lKnee_lAnkle_lHip);
    inputs.push(rKnee_rAnkle_rHip);

    let lHip_lKnee_lShoulder = calculate_angle(pose.keypoints[11], pose.keypoints[13], pose.keypoints[5]);
    let rHip_rKnee_rShoulder = calculate_angle(pose.keypoints[12], pose.keypoints[14], pose.keypoints[6]);
    inputs.push(lHip_lKnee_lShoulder);
    inputs.push(rHip_rKnee_rShoulder);

    let lShoulder_lHip_lElbow = calculate_angle(pose.keypoints[5], pose.keypoints[11], pose.keypoints[7]);
    let rShoulder_rHip_rElbow = calculate_angle(pose.keypoints[6], pose.keypoints[12], pose.keypoints[8]);
    inputs.push(lShoulder_lHip_lElbow);
    inputs.push(rShoulder_rHip_rElbow);

    let lElbow_lShoulder_lWrist = calculate_angle(pose.keypoints[7], pose.keypoints[5], pose.keypoints[9]);
    let rElbow_rShoulder_rWrist = calculate_angle(pose.keypoints[8], pose.keypoints[6], pose.keypoints[10]);
    inputs.push(lElbow_lShoulder_lWrist);
    inputs.push(rElbow_rShoulder_rWrist);

    let lShoulder_lAnkle_lWrist = calculate_angle(pose.keypoints[5], pose.keypoints[15], pose.keypoints[9]);
    let rShoulder_rAnkle_rWrist = calculate_angle(pose.keypoints[6], pose.keypoints[16], pose.keypoints[10]);
    inputs.push(lShoulder_lAnkle_lWrist);
    inputs.push(rShoulder_rAnkle_rWrist);

    let lShoulder_lKnee_lWrist = calculate_angle(pose.keypoints[5], pose.keypoints[13], pose.keypoints[9]);
    let rShoulder_rKnee_rWrist = calculate_angle(pose.keypoints[6], pose.keypoints[14], pose.keypoints[10]);
    inputs.push(lShoulder_lKnee_lWrist);
    inputs.push(rShoulder_rKnee_rWrist);

    let lShoulder_lHip_lWrist = calculate_angle(pose.keypoints[5], pose.keypoints[11], pose.keypoints[9]);
    let rShoulder_rHip_rWrist = calculate_angle(pose.keypoints[6], pose.keypoints[12], pose.keypoints[10]);
    inputs.push(lShoulder_lHip_lWrist);
    inputs.push(rShoulder_rHip_rWrist);

    yogi.classify(inputs, gotResult);
  } else {
    setTimeout(classifyPose, 1000);
  }
}

function gotResult(error, results) {
  if (results[0].confidence > 0.75) {
    if (results[0].label == "1"){
      poseLabel = "Mountain";
      }else if(results[0].label == "2"){
        poseLabel = "Tree";
      }else if(results[0].label == "3"){
        poseLabel = "Downward Dog";
      }else if(results[0].label == "4"){
        poseLabel = "Warrior 1";
      }else if(results[0].label == "5"){
        poseLabel = "Warrior 2";
      }else{
          poseLabel = "Chair";
        }
      }
  classifyPose();
}


function gotPoses(poses) {
  if (poses.length > 0) {
    pose = poses[0].pose;
    skeleton = poses[0].skeleton;
  }
}

function modelLoaded() {
  console.log('poseNet ready');
}

function draw() {
  push();
  translate(video.width, 0);
  scale(-1,1);
  image(video, 0, 0, video.width, video.height);
  
  if (pose) {
    for (let i = 0; i < pose.keypoints.length; i++){
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      nostroke();
      ellipse(x, y, 16, 16);
  }
  
    for (let i = 0; i < skeleton.length; i++) {
      let a = skeleton[i][0];
      let b = skeleton[i][1];
      strokeWeight(8);
      stroke(255);
      line(a.position.x, a.position.y, b.position.x, b.position.y);
    }
  }
  pop();

  fill(255, 0, 255);
  
  if (poseLabel == "Downward Dog"){
    textSize(90);
  }else{
  textSize(150);}
  textAlign(CENTER, CENTER);
  text(poseLabel, width / 2, height /2);
}

function startTimer(duration, display) {
  var timer = duration, minutes, seconds;
  setInterval(function () {
      minutes = parseInt(timer / 60, 10);
      seconds = parseInt(timer % 60, 10);

      minutes = minutes < 10 ? "0" + minutes : minutes;
      seconds = seconds < 10 ? "0" + seconds : seconds;

      display.textContent = minutes + ":" + seconds;

      if (--timer < 0) {
          timer = duration;
      }
  }, 1000);
}
