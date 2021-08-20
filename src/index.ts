import 'reflect-metadata';
import { Container } from 'typedi';
import Game from './game';

const main = async () => {
  const game = Container.get(Game);
  game.createScene();
  game.run();

  const button = document.getElementById('close-modal');

  button.addEventListener('click', event => {
    console.log("zbeul");
  });
}

main().catch(err => {
  console.error(err);
});