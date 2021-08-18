import { Service } from "typedi";

@Service()
class SoundService{
    Log(message:string): void{
        console.log(message);
    }
}

export default SoundService;