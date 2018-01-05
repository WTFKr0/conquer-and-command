import {Cell} from "../computing/Cell";
import {GuardTowerSprite} from "../sprite/GuardTowerSprite";
import {AbstractShootingBuilding} from "./AbstractShootingBuilding";

export class GuardTower extends AbstractShootingBuilding {
    create(game: Phaser.Game, group: Phaser.Group, effectsGroup: Phaser.Group) {
        this.sprite = new GuardTowerSprite(
            game,
            group,
            effectsGroup,
            Cell.cellToReal(this.cellPosition.x),
            Cell.cellToReal(this.cellPosition.y),
            'Turret'
        );
        super.create(game, group, effectsGroup);
    }
}
