import { Service } from "typedi";
import * as Pizzicato from "pizzicato";

@Service()
class SoundService{
    numberLoaded = 0;
    numberTotalToLoad = 13;
    pist_0_Transition : Pizzicato.sound;
    pist_1_kick :Pizzicato.Sound;
    pist_1_1_kick_fx :Pizzicato.Sound;
    pist_2_snare :Pizzicato.Sound;
    pist_2_snare_fx :Pizzicato.Sound;
    pist_3_hat :Pizzicato.Sound;
    pist_3_1_hat_fx :Pizzicato.Sound;
    pist_4_toms :Pizzicato.Sound;
    pist_5_bass :Pizzicato.Sound;
    pist_6_sub_bass :Pizzicato.Sound;
    pist_7_skank :Pizzicato.Sound;
    pist_7_1_skank_fx :Pizzicato.Sound;
    pist_8_melodies :Pizzicato.Sound;

    Log(message:string): void{
        this.pist_0_Transition = this.LoadSound("0_transitions");
        this.pist_1_kick = this.LoadSound("1_kick");
        this.pist_1_1_kick_fx = this.LoadSound("1_1_kick_fx");
        this.pist_2_snare = this.LoadSound("2_snare");
        this.pist_2_snare_fx = this.LoadSound("2_1_snare_fx");
        this.pist_3_hat = this.LoadSound("3_hat");
        this.pist_3_1_hat_fx = this.LoadSound("3_1_hat_fx");
        this.pist_4_toms = this.LoadSound("4_toms");
        this.pist_5_bass = this.LoadSound("5_bass");
        this.pist_6_sub_bass = this.LoadSound("6_sub_bass");
        this.pist_7_skank = this.LoadSound("7_skank");
        this.pist_7_1_skank_fx = this.LoadSound("7_1_skank_fx");
        this.pist_8_melodies = this.LoadSound("8_melodies");
    }

    LoadSound(fileName: string) : Pizzicato.Sound{
        return new Pizzicato.Sound({source: 'file',
        options: { path: './sounds/' + fileName + '.mp3', loop: true }}, x => {
            this.loadIncrease();
        });
    }

    private loadIncrease() : void{
        this.numberLoaded++;
      
        document.getElementById('number-sounds-loaded').innerHTML = (Math.trunc(this.numberLoaded * 100 / this.numberTotalToLoad)).toString();
        if(this.numberLoaded >= this.numberTotalToLoad){
            console.log("yes c'est frais");
          var closeModalButton = document.getElementById('close-modal');
          //@ts-ignore
          closeModalButton.disabled = false;
          closeModalButton.classList.remove("button-disabled");

          var tutoModalButton = document.getElementById('tuto-modal');
          //@ts-ignore
          tutoModalButton.disabled = false;
          tutoModalButton.classList.remove("button-disabled");
          //soundSetting();
        }
      }
}

export default SoundService;