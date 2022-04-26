import { Service } from "typedi";
import * as Pizzicato from "pizzicato";

@Service()
class SoundService {
    isMusicPlaying = false;
    numberLoaded = 0;
    numberTotalToLoad = 13;
    track_0_Transition: Pizzicato.sound;
    track_1_kick: Pizzicato.Sound;
    track_1_1_kick_fx: Pizzicato.Sound;
    track_2_snare: Pizzicato.Sound;
    track_2_snare_fx: Pizzicato.Sound;
    track_3_hat: Pizzicato.Sound;
    track_3_1_hat_fx: Pizzicato.Sound;
    track_4_toms: Pizzicato.Sound;
    track_5_bass: Pizzicato.Sound;
    track_6_sub_bass: Pizzicato.Sound;
    track_7_skank: Pizzicato.Sound;
    track_7_1_skank_fx: Pizzicato.Sound;
    track_8_melodies: Pizzicato.Sound;
    track_4_toms_flanger: Pizzicato.Effects.Flanger;
    track_8_melodies_flanger: Pizzicato.Effects.Flanger;
    track_5_bass_lowPassFilter: Pizzicato.Effects.LowPassFilter;
    track_6_sub_bass_lowPassFilter: Pizzicato.Effects.LowPassFilter;
    analyser: Pizzicato.Analyser;
    dataArray: any;

    LoadSounds(): void {
        this.track_0_Transition = this.LoadSound("0_transitions");
        this.track_1_kick = this.LoadSound("1_kick");
        this.track_1_1_kick_fx = this.LoadSound("1_1_kick_fx");
        this.track_2_snare = this.LoadSound("2_snare");
        this.track_2_snare_fx = this.LoadSound("2_1_snare_fx");
        this.track_3_hat = this.LoadSound("3_hat");
        this.track_3_1_hat_fx = this.LoadSound("3_1_hat_fx");
        this.track_4_toms = this.LoadSound("4_toms");
        this.track_5_bass = this.LoadSound("5_bass");
        this.track_6_sub_bass = this.LoadSound("6_sub_bass");
        this.track_7_skank = this.LoadSound("7_skank");
        this.track_7_1_skank_fx = this.LoadSound("7_1_skank_fx");
        this.track_8_melodies = this.LoadSound("8_melodies");

        this.track_4_toms_flanger = new Pizzicato.Effects.Flanger({
            time: 0.45,
            speed: 0.2,
            depth: 1,
            feedback: 0.1,
            mix: 0
        });

        this.track_5_bass_lowPassFilter = new Pizzicato.Effects.LowPassFilter({
            frequency: 20000,
            peak: 1
        });

        this.track_6_sub_bass_lowPassFilter = new Pizzicato.Effects.LowPassFilter({
            frequency: 20000,
            peak: 1
        });

        this.track_8_melodies_flanger = new Pizzicato.Effects.Flanger({
            time: 0.45,
            speed: 0.2,
            depth: 1,
            feedback: 0.1,
            mix: 0
        });
    }

    Play(): void {
        this.track_0_Transition.play();
        this.track_1_kick.play();
        this.track_1_1_kick_fx.play();
        this.track_2_snare.play();
        this.track_2_snare_fx.play();
        this.track_3_hat.play();
        this.track_3_1_hat_fx.play();
        this.track_4_toms.play();
        this.track_5_bass.play();
        this.track_6_sub_bass.play();
        this.track_7_skank.play();
        this.track_7_1_skank_fx.play();
        this.track_8_melodies.play();
        this.isMusicPlaying = true;
    }

    Pause(): void {
        this.track_0_Transition.pause();
        this.track_1_kick.pause();
        this.track_1_1_kick_fx.pause();
        this.track_2_snare.pause();
        this.track_2_snare_fx.pause();
        this.track_3_hat.pause();
        this.track_3_1_hat_fx.pause();
        this.track_4_toms.pause();
        this.track_5_bass.pause();
        this.track_6_sub_bass.pause();
        this.track_7_skank.pause();
        this.track_7_1_skank_fx.pause();
        this.track_8_melodies.pause();
        this.isMusicPlaying = false;
    }

    UpdateAnalyzer() : Uint8Array {
        if (this.analyser != null && this.dataArray != undefined && this.isMusicPlaying) {
            this.analyser.getByteTimeDomainData(this.dataArray);

            const width = this.analyser.fftSize;
            const height = 1;

            const size = width * height;
            const data = new Uint8Array(3 * size);

            for (let i = 0; i < size; i++) {
                const r = this.dataArray[i];
                const g = this.dataArray[i];
                const b = this.dataArray[i];

                const stride = i * 3;

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
        }, () => {
            this.loadIncrease();
        });
    }

    private loadIncrease(): void {
        this.numberLoaded++;
        document.getElementById('number-sounds-loaded').innerHTML = (Math.trunc(this.numberLoaded * 100 / this.numberTotalToLoad)).toString();
        
        if (this.numberLoaded < this.numberTotalToLoad)
            return;
        const closeModalButton = document.getElementById('close-modal');
        //@ts-ignore
        closeModalButton.disabled = false;
        closeModalButton.classList.remove("button-disabled");
        const tutorialModalButton = document.getElementById('tutorial-modal');
        //@ts-ignore
        tutorialModalButton.disabled = false;
        tutorialModalButton.classList.remove("button-disabled");
        this.setSounds();
    }

    private setSounds(): void {
        this.track_0_Transition.volume = 1;
        this.track_1_kick.volume = 1;
        this.track_1_1_kick_fx.volume = 0;
        this.track_2_snare.volume = 1;
        this.track_2_snare_fx.volume = 0;
        this.track_3_hat.volume = 1;
        this.track_3_1_hat_fx.volume = 0;
        this.track_4_toms.volume = 1;
        this.track_5_bass.volume = 1;
        this.track_6_sub_bass.volume = 1;
        this.track_7_skank.volume = 1;
        this.track_7_1_skank_fx.volume = 0;
        this.track_8_melodies.volume = 1;

        this.track_8_melodies.addEffect(this.track_8_melodies_flanger);
        this.track_5_bass.addEffect(this.track_5_bass_lowPassFilter);
        this.track_6_sub_bass.addEffect(this.track_6_sub_bass_lowPassFilter);
        this.track_4_toms.addEffect(this.track_4_toms_flanger);

        this.analyser = Pizzicato.context.createAnalyser();
        this.analyser.fftSize = 2048;
        this.dataArray = new Uint8Array(this.analyser.fftSize);

        this.track_0_Transition.connect(this.analyser);
        this.track_1_kick.connect(this.analyser);
        this.track_1_1_kick_fx.connect(this.analyser);
        this.track_2_snare.connect(this.analyser);
        this.track_2_snare_fx.connect(this.analyser);
        this.track_3_hat.connect(this.analyser);
        this.track_3_1_hat_fx.connect(this.analyser);
        this.track_4_toms.connect(this.analyser);
        this.track_5_bass.connect(this.analyser);
        this.track_6_sub_bass.connect(this.analyser);
        this.track_7_skank.connect(this.analyser);
        this.track_7_1_skank_fx.connect(this.analyser);
        this.track_8_melodies.connect(this.analyser);
        this.analyser.connect(Pizzicato.context.destination);
    }

    AdjustVolume(faderNumber : number, value : number) : void {
        switch(faderNumber) {
            case 1:
                this.track_1_kick.volume = value;
                break;
            case 2:
                this.track_2_snare.volume = value;
                break;
            case 3:
                this.track_3_hat.volume = value;
                break;
            case 4:
                this.track_4_toms.volume = value;
                break;
            case 5:
                this.track_5_bass.volume = value;
                break;
            case 6:
                this.track_6_sub_bass.volume = value;
                break;
            case 7:
                this.track_7_skank.volume = value;
                break;
            case 8:
                this.track_8_melodies.volume = value;
                break;
        }
    }

    AdjustEffect(knobNumber, value) : void {
        switch(knobNumber) {
            case 1:
                this.track_1_1_kick_fx.volume = value;
                break;
            case 2:
                this.track_2_snare_fx.volume = value;
                break;
            case 3:
                this.track_3_1_hat_fx.volume = value;
                break;
            case 4:
                this.track_4_toms_flanger.mix = value;
                break;
            case 5:
                this.track_5_bass_lowPassFilter.frequency = value * 1000 + 100;
                break;
            case 6:
                this.track_6_sub_bass_lowPassFilter.frequency = value * 600 + 100;
                break;
            case 7:
                this.track_7_1_skank_fx.volume = value;
                break;
            case 8:
                this.track_8_melodies_flanger.mix = value;
                break;
        }
    }
}

export default SoundService;