import {Unit} from "./Unit";
import {Player} from "../player/Player";
import {Attack} from "../state/Attack";
import {Follow} from "../state/Follow";
import {MoveAttack} from "../state/MoveAttack";
import {Harvest} from "../state/Harvest";
import {TiberiumPlant} from "../sprite/TiberiumPlant";
import {ConstructionYard} from "../building/ConstructionYard";
import {Distance} from "../computing/Distance";
import {UnitProperties} from "./UnitProperties";
import {WorldKnowledge} from "../map/WorldKnowledge";
import {TiberiumSource} from "../building/TiberiumSource";

export class Harvester extends Unit {
    private loading: number;

    constructor(worldKnowledge: WorldKnowledge, cellPosition: PIXI.Point, player: Player) {
        super(
            worldKnowledge,
            cellPosition,
            player,
            UnitProperties.getSprite(Harvester.prototype.constructor.name, player.getId())
        );

        this.life = this.maxLife = UnitProperties.getLife(Harvester.prototype.constructor.name);
        this.loading = 0;
    }

    updateStateAfterClick(cell: PIXI.Point) {
        const unit = this.worldKnowledge.getUnitAt(cell);
        if (null !== unit) {
            if (this.getPlayer() !== unit.getPlayer()) {
                this.state = new Attack(this.worldKnowledge, this, unit);
            } else {
                this.state = new Follow(this.worldKnowledge, this, unit);
            }
        } else {
            const ground = this.worldKnowledge.getGroundAt(cell);
            if (ground && ground instanceof TiberiumPlant) {
                this.state = new Harvest(this.worldKnowledge, this, (<TiberiumPlant> ground).getSource());
            } else {
                this.state = new MoveAttack(this.worldKnowledge, this, cell);
            }
        }
    }

    getClosestBase() {
        return Distance.getClosest(
            this.getCellPositions()[0],
            this.worldKnowledge.getPlayerBuildings(this.player, 'ConstructionYard')
        );
    }

    getClosestPlant(source: TiberiumSource) {
        return Distance.getClosest(this.getCellPositions()[0], source.getPlants());
    }

    isFull() {
        return this.loading >= UnitProperties.getOption(this.constructor.name, 'max_loading');
    }

    unload(base: ConstructionYard) {
        base.addMinerals(this.loading);
        this.loading = 0;

        this.freeze(UnitProperties.getOption(this.constructor.name, 'unload_time') * Phaser.Timer.SECOND);
    }

    load(cube: TiberiumPlant) {
        this.unitSprite.doLoad(cube.getCellPositions()[0]);
        this.loading += cube.harvest();

        this.freeze(UnitProperties.getOption(this.constructor.name, 'load_time') * Phaser.Timer.SECOND);
    }

    isLoaded() {
        return this.loading > 0;
    }
}
