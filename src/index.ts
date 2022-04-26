import 'reflect-metadata';
import { Container } from 'typedi';
import Game from './game';
import game from "./game";

const buttonStart = document.getElementById('close-modal');
const buttonCredit = document.getElementById('credit-modal-button');
const buttonCloseCredit = document.getElementById('close-credit-modal-button');
const buttonPlay = document.getElementById('play');
const buttonPause = document.getElementById('pause');
const facebookLink = document.getElementById("facebookLink");
const youtubeLink = document.getElementById("youtubeLink");
const soundcloudLink = document.getElementById("soundcloudLink");
const openModal = document.getElementsByClassName("open-modal")[0];
const modal = document.getElementById("modal-container");
const body = document.getElementsByTagName("body")[0];
const menuTopLeft = document.getElementsByClassName("menu-top-left")[0];

//eventCreation
// document.addEventListener("touchmove", onTouchMove, false);
// document.addEventListener("touchstart", onTouchStart, false);
// document.addEventListener("touchend", onTouchEnd, false);



const main = async () => {
  const game = Container.get(Game);
  game.createScene();
  game.run();

  buttonStart.addEventListener('click', e => {
    game.PlaySound();
    TogglePlayPauseToPlay();
    CloseModal();
  });

  buttonCredit.addEventListener('click', e => toggleCreditModal());

  buttonCloseCredit.addEventListener('click', e => toggleCreditModal());

  buttonPlay.addEventListener('click', e => {
    TogglePlayPauseToPlay();
    game.PlaySound();
  });

  buttonPause.addEventListener('click', e => {
    TogglePlayPauseToPause()
    game.PauseSound();
  });

  openModal.addEventListener('click', e => {
    modal.removeAttribute("class");
    modal.classList.add("two");
    body.classList.add("modal-active");
    menuTopLeft.classList.add("invisible");
    game.PauseSound();
  });

  document.addEventListener('mousemove', e => onDocumentMouseMove(e, game), false);
  document.addEventListener('mousedown', e => onDocumentMouseDown(e, game), false);
  document.addEventListener('mouseup', e => onDocumentMouseUp(e, game), false);
}

main().catch(err => {
  console.error(err);
});

function toggleCreditModal() {
  var creditModal = document.getElementById("creditModal");
  var startModal = document.getElementById("startModal");
  if (creditModal.style.display === "none") {
    creditModal.style.display = "flex";
    startModal.style.display = "none";
  } else {
    creditModal.style.display = "none";
    startModal.style.display = "table-cell";
  }
}

function CloseModal() {
  modal.classList.add("out");
  body.classList.remove("out");
  menuTopLeft.classList.remove("invisible");
}

function TogglePlayPauseToPlay(){
  buttonPause.classList.remove("invisible");
  buttonPlay.classList.add("invisible");
}

function TogglePlayPauseToPause(){
  buttonPause.classList.add("invisible");
  buttonPlay.classList.remove("invisible");
}

function RedirectBlank(url) {
  const a = document.createElement('a');
  a.target='_blank';
  a.href=url;
  a.click();
}

facebookLink.addEventListener('click', e => {
  RedirectBlank("https://www.facebook.com/FayacanSon/");
});

youtubeLink.addEventListener('click', e => {
  RedirectBlank("https://www.youtube.com/channel/UCSGj18XL9iVpVZ4y7Rg3IEA");
});

soundcloudLink.addEventListener('click', e => {
  RedirectBlank("https://soundcloud.com/user-683591571");
});

function getMouseX(event) {
  return (event.clientX / window.innerWidth) * 2 - 1;
}

function getMouseY(event) {
  return -(event.clientY / window.innerHeight) * 2 + 1;
}

function onDocumentMouseDown(event, game: Game) {
  const mouseX = getMouseX(event);
  const mouseY = getMouseY(event);
  game.MouseEventStart(mouseX, mouseY);
}

function onDocumentMouseMove(event, game: Game) {
  const mouseX = getMouseX(event);
  const mouseY = getMouseY(event);
  game.MouseEventMove(mouseX, mouseY);
}

function onDocumentMouseUp(event, game: Game) {
  game.MouseEventEnd();
}



/*
function onTouchStart(event){
  var mouseX = ((event.targetTouches[0] ? event.targetTouches[0].pageX : event.changedTouches[event.changedTouches.length - 1].pageX) / window.innerWidth) * 2 - 1;
  var mouseY = -((event.targetTouches[0] ? event.targetTouches[0].pageY : event.changedTouches[event.changedTouches.length - 1].pageY) / window.innerHeight) * 2 + 1;
  var vector = new THREE.Vector3(mouseX, mouseY, 1);
  vector.unproject(camera);
  raycaster.set(camera.position, vector.sub(camera.position).normalize());
  var intersects = raycaster.intersectObject(planeFaders);
  planeFaders.position.copy(intersects[0].point);
  mouseEventStart(mouseX, mouseY);
}
function onTouchMove(event){}
function onTouchEnd(event){}*/
