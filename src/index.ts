import 'reflect-metadata';
import { Container, Service } from 'typedi';
import Game from './game';

let mouseCursor = document.querySelector((".cursor"));
window.addEventListener("mousemove",cursor)

function cursor(e){
  //@ts-ignore
  mouseCursor.style.top = e.pageY + "px";
  //@ts-ignore
  mouseCursor.style.left = e.pageX + "px";
}

const main = async () => {
  const game = Container.get(Game);
  game.createScene();
  game.run();
}

main().catch(err => {
  console.error(err);
});