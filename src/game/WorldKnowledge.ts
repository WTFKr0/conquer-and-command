import {BuildingRepository} from "./repository/BuildingRepository";
import {Player} from "./player/Player";
import {Building} from "./building/Building";
import {Unit} from "./unit/Unit";
import {UnitRepository} from "./repository/UnitRepository";
import {Appear} from "./sprite/Appear";
import {AbstractCreator} from "./creator/AbstractCreator";
import {GeneratedGround} from "./map/GeneratedGround";
import {Shootable} from "./Shootable";

export class WorldKnowledge {
    private game: Phaser.Game;
    private ground: GeneratedGround;
    private unitBuildingGroup: Phaser.Group;
    private unitRepository: UnitRepository;
    private buildingRepository: BuildingRepository;
    private creators: AbstractCreator[];

    constructor() {
        this.ground = new GeneratedGround();
        this.unitRepository = new UnitRepository();
        this.buildingRepository = new BuildingRepository();
    }

    create(game: Phaser.Game) {
        this.game = game;
        this.ground.create(this.game);

        this.unitBuildingGroup = this.game.add.group();
        this.unitBuildingGroup.fixedToCamera = false;
    }

    update() {
        this.unitBuildingGroup.sort('y');
        this.unitRepository.getUnits().forEach((unit) => {
            unit.update();
        });
    }

    isCellAccessible(position: PIXI.Point) {
        return this.ground.isCellAccessible(position) &&
            this.unitRepository.isCellNotOccupied(position) &&
            this.buildingRepository.isCellNotOccupied(position);
    }

    getGroundWidth() {
        return this.ground.getGroundWidth();
    }

    getGroundHeight() {
        return this.ground.getGroundHeight();
    }

    addBuilding(newBuilding: Building, appear: boolean = false) {
        this.buildingRepository.add(newBuilding);
        newBuilding.create(this.game, this.unitBuildingGroup);
        if (appear) {
            newBuilding.setVisible(false);
            let appearSprite = new Appear(newBuilding.getCellPositions()[0]);
            appearSprite.create(this.game, this.unitBuildingGroup);
            this.game.time.events.add(Phaser.Timer.SECOND * 2, () => {
                newBuilding.setVisible(true);
            }, this);
        }
        this.creators.forEach((creator) => {
            creator.update();
        });
    }

    addUnit(newUnit: Unit) {
        this.unitRepository.add(newUnit);
        newUnit.create(this.game, this.unitBuildingGroup);
    }

    removeUnit(unit: Unit, delay: number = 0) {
        if (delay === 0) {
            this.unitRepository.removeUnit(unit);
        } else {
            this.game.time.events.add(delay, () => {
                this.unitRepository.removeUnit(unit);
            });
        }
    }

    getUnitAt(cell: PIXI.Point) {
        return this.unitRepository.unitAt(cell);
    }

    getBuildingAt(cell: PIXI.Point) {
        return this.buildingRepository.buildingAt(cell);
    }

    getUnits() {
        return this.unitRepository.getUnits();
    }

    getSelectedUnits() {
        return this.unitRepository.getSelectedUnits();
    }

    setCreators(creators: AbstractCreator[]) {
        this.creators = creators;
    }

    getPlayerBuildings(player: Player, type: string = null): Building[] {
        return this.buildingRepository.getBuildings(type).filter((building) => {
            return building.getPlayer() === player;
        });
    }

    getEnemyBuildings(player: Player, type: string = null): Building[] {
        return this.buildingRepository.getBuildings(type).filter((building) => {
            return building.getPlayer() !== null && building.getPlayer() !== player;
        });
    }

    getPlayerUnits(player: Player, type: string = null): Unit[] {
        return this.unitRepository.getUnits(type).filter((unit) => {
            return unit.getPlayer() === player;
        });
    }

    getEnemyUnits(player: Player, type: string = null): Unit[] {
        return this.unitRepository.getUnits(type).filter((unit) => {
            return unit.getPlayer() !== null && unit.getPlayer() !== player;
        })
    }

    getCreatorOf(buildingName: string, player: Player) {
        return this.buildingRepository.getCreatorOf(buildingName).filter((building) => {
            return building.getPlayer() === player;
        })[0];
    }

    getEnemies(player: Player): (Shootable)[] {
        let result = [];
        this.getEnemyUnits(player).forEach((unit) => {
            result.push(unit);
        });
        this.getEnemyBuildings(player).forEach((building) => {
            result.push(building);
        });

        return result;
    }

    removeBuilding(building: Building) {
        this.buildingRepository.removeBuilding(building);
    }
}
