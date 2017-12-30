import {AbstractUICreator} from "./AbstractUICreator";
import {WorldKnowledge} from "../map/WorldKnowledge";
import {Player} from "../player/Player";

export abstract class AbstractCreator {
    protected timerEvent: Phaser.Timer;
    protected uiCreator: AbstractUICreator = null;
    protected worldKnowledge: WorldKnowledge;
    protected player: Player;

    constructor(worldKnowledge: WorldKnowledge, player: Player) {
        this.worldKnowledge = worldKnowledge;
        this.player = player;
    }

    abstract getProducibles(): string[];

    abstract getRequiredBuildings(itemName: string): string[];

    abstract hasMineralsToProduct(itemName: string): boolean;

    create(game: Phaser.Game, uiCreator: AbstractUICreator = null) {
        this.timerEvent = game.time.events;
        this.uiCreator = uiCreator;
    }

    updateAllowedItems() {
        if (this.uiCreator) {
            this.uiCreator.updateAllowedItems(this.getAlloweds());
        }
    }

    updateBuyableItems() {
        if (this.uiCreator) {
            this.uiCreator.updateBuyableItems(this.getBuyables());
        }
    }

    isAllowed(itemName: string): boolean {
        let found = true;
        this.getRequiredBuildings(itemName).forEach((requiredBuildingName) => {
            if (this.worldKnowledge.getPlayerBuildings(this.player, requiredBuildingName).length === 0) {
                found = false;
            }
        });

        return found;
    }

    private getAlloweds() {
        return this.getProducibles().filter((itemName) => {
            return this.isAllowed(itemName);
        });
    }

    private getBuyables() {
        return this.getProducibles().filter((itemName) => {
            return this.hasMineralsToProduct(itemName);
        });
    }
}
