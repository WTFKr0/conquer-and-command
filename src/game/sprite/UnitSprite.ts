import {CIRCLE_RADIUS, SCALE} from "../game_state/Play";
import {Explosion} from "./Explosion";
import {Shoot} from "./Shoot";
import {Cell} from "../Cell";

export enum Rotation {
    TOP = 1,
    TOP_RIGHT,
    RIGHT,
    BOTTOM_RIGHT,
    BOTTOM,
    BOTTOM_LEFT,
    LEFT,
    TOP_LEFT
}

export class UnitSprite extends Phaser.Sprite {
    private lifeRectangle: Phaser.Graphics;
    private selectedRectable: Phaser.Graphics = null;

    constructor(game: Phaser.Game, x: number, y: number, key: string) {
        super(game, x, y, key);

        this.scale.setTo(SCALE, SCALE);
        this.anchor.setTo(0.5, 0.5);

        this.lifeRectangle = this.game.add.graphics(0, 0);
        this.lifeRectangle.beginFill(0x00ff00);
        this.lifeRectangle.drawRect(-CIRCLE_RADIUS/SCALE/2, CIRCLE_RADIUS/SCALE/2, CIRCLE_RADIUS/SCALE, 2);
        this.addChild(this.lifeRectangle);

        this.game.add.existing(this);
    }

    doDestroy() {
        this.doExplodeEffect();
        this.destroy(true);
    }

    doShoot(cellPosition: PIXI.Point) {
        this.rotateTowards(cellPosition);
        this.doShootEffect(cellPosition);
    }

    updateLife(life: number, maxLife: number) {
        this.lifeRectangle.clear();
        this.lifeRectangle.beginFill(0x00ff00);
        this.lifeRectangle.drawRect(
            -CIRCLE_RADIUS/SCALE/2,
            CIRCLE_RADIUS/SCALE/2, life / maxLife * CIRCLE_RADIUS/SCALE, 2);
    }

    doMove(cellPosition: PIXI.Point, duration: number) {
        this.rotateTowards(cellPosition);
        this.game.add.tween(this).to({
            x: Cell.cellToReal(cellPosition.x),
            y: Cell.cellToReal(cellPosition.y)
        }, duration, Phaser.Easing.Default, true);
    }

    doLoad(cellPosition: PIXI.Point) {
        this.rotateTowards(cellPosition);
    }

    setSelected(value: boolean = true) {
        if (value) {
            if (null === this.selectedRectable) {
                this.selectedRectable = this.game.add.graphics(0, 0);
                this.selectedRectable.lineStyle(1, 0x00ff00, 0.5);
                this.selectedRectable.drawRect(-CIRCLE_RADIUS / SCALE / 2, -CIRCLE_RADIUS / SCALE / 2, CIRCLE_RADIUS / SCALE, CIRCLE_RADIUS / SCALE);
                this.addChild(this.selectedRectable);
            }
        } else if (this.selectedRectable !== null) {
            this.selectedRectable.destroy();
            this.selectedRectable = null;
        }
    }

    private rotateTowards(cellPosition: PIXI.Point): void {
        const rotation = this.getRotation(new Phaser.Point(
            cellPosition.x - Cell.realToCell(this.x),
            cellPosition.y - Cell.realToCell(this.y)
        ));
        this.loadRotation(rotation);
    }

    private doExplodeEffect() {
        this.game.add.existing(new Explosion(this.game, this.x, this.y));
    }

    private doShootEffect(cellPosition: PIXI.Point) {
        const rotation = this.getRotation(new Phaser.Point(
            cellPosition.x - Cell.realToCell(this.x),
            cellPosition.y - Cell.realToCell(this.y)
        ));
        this.game.add.existing(new Shoot(this.game, this.x, this.y, rotation));
    }

    private loadRotation(rotation: Rotation)
    {
        switch(rotation) {
            case Rotation.TOP: this.loadTexture(this.key, 1); break;
            case Rotation.TOP_RIGHT: this.loadTexture(this.key, 2); break;
            case Rotation.RIGHT: this.loadTexture(this.key, 5); break;
            case Rotation.BOTTOM_RIGHT: this.loadTexture(this.key, 8); break;
            case Rotation.BOTTOM: this.loadTexture(this.key, 7); break;
            case Rotation.BOTTOM_LEFT: this.loadTexture(this.key, 6); break;
            case Rotation.LEFT: this.loadTexture(this.key, 3); break;
            case Rotation.TOP_LEFT: this.loadTexture(this.key, 0); break;
        }
    }

    private getRotation(vector: PIXI.Point): Rotation
    {
        if (null === vector) {
            return Rotation.TOP_LEFT;
        }

        const angle = Math.atan2(vector.y, vector.x);
        if (angle > Math.PI/8 * 7) {
            return Rotation.LEFT;
        }
        if (angle > Math.PI/8 * 5) {
            return Rotation.BOTTOM_LEFT;
        }
        if (angle > Math.PI/8 * 3) {
            return Rotation.BOTTOM;
        }
        if (angle > Math.PI/8) {
            return Rotation.BOTTOM_RIGHT;
        }
        if (angle > Math.PI/8 * -1) {
            return Rotation.RIGHT;
        }
        if (angle > Math.PI/8 * -3) {
            return Rotation.TOP_RIGHT;
        }
        if (angle > Math.PI/8 * -5) {
            return Rotation.TOP;
        }
        if (angle > Math.PI/8 * -7) {
            return Rotation.TOP_LEFT;
        }

        return Rotation.LEFT;
    }

    isInside(left: number, right: number, top: number, bottom: number): boolean {
        return this.x + this.width/2 > left &&
            this.x - this.width/2 < right &&
            this.y + this.height/2 > top &&
            this.y - this.height/2 < bottom;
    }
}