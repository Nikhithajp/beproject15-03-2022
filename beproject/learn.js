let video;
let poseNet;
let pose;
let skeleton;
let posesArray = ['Mountain', 'Tree', 'Downward Dog', 'Warrior I', 'Warrior II', 'Chair'];
var imgArray = new Array();

var poseImage;

let yogi;
let poseLabel;

var targetLabel;
var errorCounter;
var iterationCounter;
var poseCounter;
var target;

var timeLeft;

function setup() {
  var canvas = createCanvas(640, 480);//width,height
  canvas.position(130, 210);
  video = createCapture(VIDEO);
  video.hide();
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on('pose', gotPoses);//to get skeleton

  imgArray[0] = new Image();
  imgArray[0].src = 'imgs/mountain.svg';
  imgArray[1] = new Image();
  imgArray[1].src = 'imgs/tree.svg';
  imgArray[2] = new Image();
  imgArray[2].src = 'imgs/dog.svg';
  imgArray[3] = new Image();
  imgArray[3].src = 'imgs/warrior1.svg';
  imgArray[4] = new Image();
  imgArray[4].src = 'imgs/warrior2.svg';
  imgArray[5] = new Image();
  imgArray[5].src = 'imgs/chair.svg';


  poseCounter = 0;
  targetLabel = 1;
  target = posesArray[poseCounter];
  document.getElementById("poseName").textContent = target;
  timeLeft = 10;
  document.getElementById("time").textContent = "00:" + timeLeft;
  errorCounter = 0;
  iterationCounter = 0;
  document.getElementById("poseImg").src = imgArray[poseCounter].src;
  
  let options = {
    inputs: 34, // How much keypoints as input, 17 keypoints consist of x and y pairs so it's 34 coordinates 
    outputs: 6,// How much pose you want to save
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
    console.log("Pose not found");
    setTimeout(classifyPose, 100);
  }
}

function gotResult(error, results) {
  document.getElementById("welldone").textContent = "";
  document.getElementById("sparkles").style.display = "none";
  
  if (results[0].confidence > 0.75) {
    console.log("Confidence=",results[0].confidence);
    if (results[0].label == targetLabel.toString()){
      console.log(targetLabel);
      iterationCounter = iterationCounter + 1;

      console.log(iterationCounter)
      
      if (iterationCounter == 10) {
        console.log("you held the pose for 10 sec")
        iterationCounter = 0;
        nextPose();}
      else{
        console.log("doing pose")
        timeLeft = timeLeft - 1;
        if (timeLeft < 10){
          document.getElementById("time").textContent = "00:0" + timeLeft;
        }else{
        document.getElementById("time").textContent = "00:" + timeLeft;}
        setTimeout(classifyPose, 1000);}}
    else{
      errorCounter = errorCounter + 1;
      console.log("error");
      if (errorCounter >= 4){
        console.log("four errors");
        iterationCounter = 0;
        timeLeft = 10;
        if (timeLeft < 10){
          document.getElementById("time").textContent = "00:0" + timeLeft;
        }else{
        document.getElementById("time").textContent = "00:" + timeLeft;}
        errorCounter = 0;
        setTimeout(classifyPose, 100);
      }else{
        setTimeout(classifyPose, 100);
      }}}
  else{
    console.log("Perform your pose properly")
    setTimeout(classifyPose, 100);
}}


function gotPoses(poses) {//check if pose is  present
  if (poses.length > 0) {
    pose = poses[0].pose;
    skeleton = poses[0].skeleton;
  }
}

function modelLoaded() {
  document.getElementById("rectangle").style.display = "none";
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

}

function nextPose(){
  if (poseCounter >= 5) {
    console.log("Well done, you have learnt all poses!");
    document.getElementById("finish").textContent = "Amazing!";
    document.getElementById("welldone").textContent = "All poses done.";
    document.getElementById("sparkles").style.display = 'block';
  }else{
    console.log("Well done, you did this pose!");
    errorCounter = 0;
    iterationCounter = 0;
    poseCounter = poseCounter + 1;
    targetLabel = poseCounter + 1;
    console.log("next pose target label" + targetLabel)
    target = posesArray[poseCounter];
    document.getElementById("poseName").textContent = target;
    document.getElementById("welldone").textContent = "Well done, next pose!";
    document.getElementById("sparkles").style.display = 'block';
    document.getElementById("poseImg").src = imgArray[poseCounter].src;
    timeLeft = 10;
    document.getElementById("time").textContent = "00:" + timeLeft;
    setTimeout(classifyPose, 4000)}
}
