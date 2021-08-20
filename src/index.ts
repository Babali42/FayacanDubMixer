import 'reflect-metadata';
import { Container } from 'typedi';
import Game from './game';

const main = async () => {
  const game = Container.get(Game);
  game.createScene();
  game.run();

  const buttonStart = document.getElementById('close-modal');
  const buttonCredit = document.getElementById('credit-modal-button');
  const buttonCloseCredit = document.getElementById('close-credit-modal-button');


  buttonStart.addEventListener('click', event => {
    console.log("zbeul");
  });

  buttonCredit.addEventListener('click', event => {
    toggleCreditModal();
  });

  buttonCloseCredit.addEventListener('click', event => {
    toggleCreditModal();
  })
}

main().catch(err => {
  console.error(err);
});

function toggleCreditModal(){
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