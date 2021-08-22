import { Service } from "typedi";
import * as Pizzicato from "pizzicato";

@Service()
class SoundService {
    isMusicPlaying = false;
    numberLoaded = 0;
    numberTotalToLoad = 13;
    pist_0_Transition: Pizzicato.sound;
    pist_1_kick: Pizzicato.Sound;
    pist_1_1_kick_fx: Pizzicato.Sound;
    pist_2_snare: Pizzicato.Sound;
    pist_2_snare_fx: Pizzicato.Sound;
    pist_3_hat: Pizzicato.Sound;
    pist_3_1_hat_fx: Pizzicato.Sound;
    pist_4_toms: Pizzicato.Sound;
    pist_5_bass: Pizzicato.Sound;
    pist_6_sub_bass: Pizzicato.Sound;
    pist_7_skank: Pizzicato.Sound;
    pist_7_1_skank_fx: Pizzicato.Sound;
    pist_8_melodies: Pizzicato.Sound;
    pist_4_toms_flanger: Pizzicato.Effects.Flanger;
    pist_8_melodies_flanger: Pizzicato.Effects.Flanger;
    pist_5_bass_lowPassFilter: Pizzicato.Effects.LowPassFilter;
    pist_6_sub_bass_lowPassFilter: Pizzicato.Effects.LowPassFilter;
    analyser: Pizzicato.Analyser;
    dataArray: any;

    LoadSounds(): void {
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

        this.pist_4_toms_flanger = new Pizzicato.Effects.Flanger({
            time: 0.45,
            speed: 0.2,
            depth: 1,
            feedback: 0.1,
            mix: 0
        });

        this.pist_5_bass_lowPassFilter = new Pizzicato.Effects.LowPassFilter({
            frequency: 20000,
            peak: 1
        });

        this.pist_6_sub_bass_lowPassFilter = new Pizzicato.Effects.LowPassFilter({
            frequency: 20000,
            peak: 1
        });

        this.pist_8_melodies_flanger = new Pizzicato.Effects.Flanger({
            time: 0.45,
            speed: 0.2,
            depth: 1,
            feedback: 0.1,
            mix: 0
        });
    }

    Play(): void {
        this.pist_0_Transition.play();
        this.pist_1_kick.play();
        this.pist_1_1_kick_fx.play();
        this.pist_2_snare.play();
        this.pist_2_snare_fx.play();
        this.pist_3_hat.play();
        this.pist_3_1_hat_fx.play();
        this.pist_4_toms.play();
        this.pist_5_bass.play();
        this.pist_6_sub_bass.play();
        this.pist_7_skank.play();
        this.pist_7_1_skank_fx.play();
        this.pist_8_melodies.play();
        this.isMusicPlaying = true;
    }

    Pause(): void {
        this.pist_0_Transition.pause();
        this.pist_1_kick.pause();
        this.pist_1_1_kick_fx.pause();
        this.pist_2_snare.pause();
        this.pist_2_snare_fx.pause();
        this.pist_3_hat.pause();
        this.pist_3_1_hat_fx.pause();
        this.pist_4_toms.pause();
        this.pist_5_bass.pause();
        this.pist_6_sub_bass.pause();
        this.pist_7_skank.pause();
        this.pist_7_1_skank_fx.pause();
        this.pist_8_melodies.pause();
        this.isMusicPlaying = false;
    }

    UpdateAnalizer() : Uint8Array {
        if (this.analyser != null && this.dataArray != undefined && this.isMusicPlaying) {
            this.analyser.getByteTimeDomainData(this.dataArray);

            var awidth = this.analyser.fftSize;
            var aheight = 1;

            var size = awidth * aheight;
            var data = new Uint8Array(3 * size);

            for (var i = 0; i < size; i++) {
                var r = this.dataArray[i];
                var g = this.dataArray[i];
                var b = this.dataArray[i];

                var stride = i * 3;

                data[stride] = r;
                data[stride + 1] = g;
                data[stride + 2] = b;
            }

            return data;
        }
        return null;
    }

    private LoadSound(fileName: string): Pizzicato.Sound {
        return new Pizzicato.Sound({
            source: 'file',
            options: { path: './sounds/' + fileName + '.mp3', loop: true }
        }, x => {
            this.loadIncrease();
        });
    }

    private loadIncrease(): void {
        this.numberLoaded++;

        document.getElementById('number-sounds-loaded').innerHTML = (Math.trunc(this.numberLoaded * 100 / this.numberTotalToLoad)).toString();
        if (this.numberLoaded >= this.numberTotalToLoad) {
            var closeModalButton = document.getElementById('close-modal');
            //@ts-ignore
            closeModalButton.disabled = false;
            closeModalButton.classList.remove("button-disabled");

            var tutoModalButton = document.getElementById('tuto-modal');
            //@ts-ignore
            tutoModalButton.disabled = false;
            tutoModalButton.classList.remove("button-disabled");

            this.setSounds();
        }
    }

    private setSounds(): void {
        this.pist_0_Transition.volume = 1;
        this.pist_1_kick.volume = 1;
        this.pist_1_1_kick_fx.volume = 0;
        this.pist_2_snare.volume = 1;
        this.pist_2_snare_fx.volume = 0;
        this.pist_3_hat.volume = 1;
        this.pist_3_1_hat_fx.volume = 0;
        this.pist_4_toms.volume = 1;
        this.pist_5_bass.volume = 1;
        this.pist_6_sub_bass.volume = 1;
        this.pist_7_skank.volume = 1;
        this.pist_7_1_skank_fx.volume = 0;
        this.pist_8_melodies.volume = 1;

        this.pist_8_melodies.addEffect(this.pist_8_melodies_flanger);
        this.pist_5_bass.addEffect(this.pist_5_bass_lowPassFilter);
        this.pist_6_sub_bass.addEffect(this.pist_6_sub_bass_lowPassFilter);
        this.pist_4_toms.addEffect(this.pist_4_toms_flanger);

        this.analyser = Pizzicato.context.createAnalyser();
        this.analyser.fftSize = 2048;
        this.dataArray = new Uint8Array(this.analyser.fftSize);

        this.pist_0_Transition.connect(this.analyser);
        this.pist_1_kick.connect(this.analyser);
        this.pist_1_1_kick_fx.connect(this.analyser);
        this.pist_2_snare.connect(this.analyser);
        this.pist_2_snare_fx.connect(this.analyser);
        this.pist_3_hat.connect(this.analyser);
        this.pist_3_1_hat_fx.connect(this.analyser);
        this.pist_4_toms.connect(this.analyser);
        this.pist_5_bass.connect(this.analyser);
        this.pist_6_sub_bass.connect(this.analyser);
        this.pist_7_skank.connect(this.analyser);
        this.pist_7_1_skank_fx.connect(this.analyser);
        this.pist_8_melodies.connect(this.analyser);
        this.analyser.connect(Pizzicato.context.destination);
    }
}

export default SoundService;