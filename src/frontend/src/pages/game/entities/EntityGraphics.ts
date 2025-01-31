import { Scene, GameObjects, Tweens } from 'phaser';

export class EntityGraphics {
    private static textureMap: { [key: string]: string } = {
        'Planet': 'planet',
        'Ship': 'ship',
        'Star': 'star',
        'Mine': 'mine',
        'Player': 'player'
    };

    static getTextureForEntity(entityType: string): string {
        return this.textureMap[entityType] || 'ship';
    }

    static attachVisuals(scene: Scene, entity: any) {
        // ✅ Create floating name tag
        entity.nameText = scene.add.text(
            entity.sprite.x, 
            entity.sprite.y - entity.sprite.displayHeight * 0.6, 
            entity.data.type, 
            {
                fontSize: '36px',
                fontStyle: "bold",
                color: '#00FF00',
                fontFamily: 'Montserrat',
                stroke: '#000000',
                strokeThickness: 2,
                align: 'center'
            }
        ).setOrigin(0.5).setDepth(1000);

        // ✅ Make sure name follows entity movement
        scene.events.on('update', () => {
            if (entity.nameText) {
                entity.nameText.setPosition(
                    entity.sprite.x, 
                    entity.sprite.y - entity.sprite.displayHeight * 0.6
                );
            }
        });
    }

    static onHover(entity: any) {
        entity.sprite.setTint(0xA5FFAE);
        entity.sprite.setBlendMode(Phaser.BlendModes.ADD);

        if (!entity.glowSprite) {
            entity.glowSprite = entity.sprite.scene.add.sprite(
                entity.sprite.x, entity.sprite.y, entity.sprite.texture.key
            ).setTint(0xffffff)
            .setAlpha(0.5)
            .setBlendMode(Phaser.BlendModes.ADD)
            .setScale(entity.sprite.scaleX * 1.2)
            .setDepth(entity.sprite.depth - 1);

            entity.sprite.scene.tweens.add({
                targets: entity.glowSprite,
                scaleX: { from: entity.sprite.scaleX * 1.1, to: entity.sprite.scaleX * 1.3 },
                scaleY: { from: entity.sprite.scaleY * 1.1, to: entity.sprite.scaleY * 1.3 },
                alpha: { from: 0.6, to: 0.3 },
                duration: 600,
                yoyo: true,
                repeat: -1
            });
        }
    }

    static onHoverEnd(entity: any) {
        entity.sprite.clearTint();
        entity.sprite.setBlendMode(Phaser.BlendModes.NORMAL);

        if (entity.glowSprite) {
            entity.glowSprite.destroy();
            entity.glowSprite = undefined;
        }
    }

    static onSelect(entity: any, isSelected: boolean) {
        if (isSelected) {
            if (!entity.selectionGraphic) {
                entity.selectionGraphic = entity.sprite.scene.add.graphics()
                    .lineStyle(2, 0x00FF00, 1)
                    .strokeCircle(0, 0, entity.sprite.displayWidth * 1.1)
                    .setDepth(entity.sprite.depth - 1)
                    .setAlpha(0.75);

                entity.sprite.scene.events.on('update', () => {
                    if (entity.selectionGraphic) {
                        entity.selectionGraphic.setPosition(entity.sprite.x, entity.sprite.y);
                    }
                });

                entity.selectionTween = entity.sprite.scene.tweens.add({
                    targets: entity.selectionGraphic,
                    alpha: { from: 0, to: 1 },
                    scaleX: { from: 0.4, to: 0.6 },
                    scaleY: { from: 0.4, to: 0.6 },
                    duration: 600,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.circinOut'
                });
            }
        } else {
            if (entity.selectionGraphic) {
                entity.sprite.scene.tweens.add({
                    targets: entity.selectionGraphic,
                    alpha: 0,
                    scaleX: 0.25,
                    scaleY: 0.25,
                    duration: 400,
                    ease: 'Sine.BackinOut',
                    onComplete: () => {
                        entity.selectionGraphic?.destroy();
                        entity.selectionGraphic = undefined;
                    }
                });

                entity.selectionTween?.stop();
                entity.selectionTween = undefined;
            }
        }
    }
}
