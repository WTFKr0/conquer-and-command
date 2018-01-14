import {Player} from "../player/Player";
import {Positionnable} from "../Positionnable";
import {Army} from "../Army";

export interface Building extends Positionnable, Army {
    create(game: Phaser.Game, group: Phaser.Group, effectsGroup: Phaser.Group): void;
    setVisible(value: boolean): void;
    getPlayer(): Player;
    destroy(): void;
    update(): void;
}
