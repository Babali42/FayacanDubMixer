import 'reflect-metadata';
import { Container } from 'typedi';
import Game from './game';

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

const main = async () => {
  const game = Container.get(Game);
  game.createScene();
  game.run();

  buttonStart.addEventListener('click', e => {
    game.PlaySound();
    TogglePlayPauseToPlay();
    CloseModal();
  });

  buttonCredit.addEventListener('click', e => {
    toggleCreditModal();
  });

  buttonCloseCredit.addEventListener('click', e => {
    toggleCreditModal();
  });

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
  var a = document.createElement('a');
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