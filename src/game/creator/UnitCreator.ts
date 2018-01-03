import {AbstractCreator, ProductionStatus} from "./AbstractCreator";
import {UnitProperties} from "../unit/UnitProperties";
import {Harvester} from "../unit/Harvester";
import {MediumTank} from "../unit/MediumTank";
import {MCV} from "../unit/MCV";
import {AlternativePosition} from "../computing/AlternativePosition";
import {MinigunInfantry} from "../unit/MinigunInfantry";
import {Grenadier} from "../unit/Grenadier";
import {RocketSoldier} from "../unit/RocketSoldier";

export class UnitCreator extends AbstractCreator {
    canProduct(itemName: string): boolean {
        return !this.isProducingAny() &&
            this.isAllowed(itemName) &&
            this.hasMineralsToProduct(itemName);
    }

    getAllowedUnits() {
        return UnitProperties.getConstructableUnits().filter((unitName) => {
            return this.isAllowed(unitName);
        });
    }

    getRequiredBuildings(itemName: string): string[] {
        return UnitProperties.getRequiredBuildings(itemName);
    }

    hasMineralsToProduct(buildingName: string) {
        return this.player.getMinerals() >= UnitProperties.getPrice(buildingName);
    }

    runProduction(unitName: string) {
        this.player.removeMinerals(UnitProperties.getPrice(unitName));
        this.productionStatus = new ProductionStatus(
            unitName,
            UnitProperties.getConstructionTime(unitName) * Phaser.Timer.SECOND,
            this.game
        );

        this.timerEvent.add(UnitProperties.getConstructionTime(unitName) * Phaser.Timer.SECOND, () => {
            this.productionStatus = null;

            const building = this.worldKnowledge.getCreatorOf(unitName, this.player);
            if (null == building) {
                return;
            }

            const cellPosition = AlternativePosition.getClosestAvailable(
                building.getCellPositions()[0],
                building.getCellPositions()[0],
                this.worldKnowledge.isCellAccessible.bind(this.worldKnowledge)
            );
            switch (unitName) {
                case 'Harvester':
                    let harvester = new Harvester(this.worldKnowledge, cellPosition, this.player);
                    this.worldKnowledge.addUnit(harvester, true);
                    break;
                case 'MediumTank':
                    let tank = new MediumTank(this.worldKnowledge, cellPosition, this.player);
                    this.worldKnowledge.addUnit(tank, true);
                    break;
                case 'MCV':
                    let mcv = new MCV(this.worldKnowledge, cellPosition, this.player);
                    this.worldKnowledge.addUnit(mcv, true);
                    break;
                case 'MinigunInfantry':
                    let minigunInfantry = new MinigunInfantry(this.worldKnowledge, cellPosition, this.player);
                    this.worldKnowledge.addUnit(minigunInfantry, true);
                    break;
                case 'Grenadier':
                    let grenadier = new Grenadier(this.worldKnowledge, cellPosition, this.player);
                    this.worldKnowledge.addUnit(grenadier, true);
                    break;
                case 'RocketSoldier':
                    let rocketSoldier = new RocketSoldier(this.worldKnowledge, cellPosition, this.player);
                    this.worldKnowledge.addUnit(rocketSoldier, true);
                    break;
                default:
                    throw "Unable to build unit " + unitName;
            }
        });
    }
}
