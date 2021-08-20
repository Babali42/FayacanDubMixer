import 'reflect-metadata';
import { Container } from 'typedi';
import Game from './game';

const main = async () => {
  const game = Container.get(Game);
  game.createScene();
  game.run();
}

main().catch(err => {
  console.error(err);
});