import { Scene, GameObjects } from 'phaser';
import { EventBus } from '../EventBus';
import { EntityVisuals } from './EntityVisuals';
import { useCanisterStore } from '@/stores/canister';

export interface GameEntity {
    sprite: GameObjects.Sprite;
    isSelected: boolean;
    data: any;
}

export class EntityManager {
    private static instance: EntityManager;
    private scene!: Scene;
    private entities: GameEntity[] = [];
    private selectedEntities: GameEntity[] = [];

    private constructor() {}

    static getInstance(): EntityManager {
        if (!EntityManager.instance) {
            EntityManager.instance = new EntityManager();
        }
        return EntityManager.instance;
    }

    initialize(scene: Scene) {
        this.scene = scene;
    }

    createEntity(x: number, y: number, texture: string, data: any): GameEntity {
     const sprite = this.scene.add.sprite(x, y, texture)
            .setInteractive({ cursor: 'pointer' })
            .setDataEnabled();

        const scale = texture === 'ship' ? 0.01 : 0.1;
        sprite.setScale(scale);

        const entity: GameEntity = { sprite, isSelected: false, data };

        // ✅ Delegate visuals to EntityVisuals
        EntityVisuals.attachVisuals(this.scene, entity);

        this.setupEntityInteractions(entity);
        this.entities.push(entity);

        return entity;
    }

    private setupEntityInteractions(entity: GameEntity) {
        entity.sprite.on('pointerover', () => {
            EventBus.emit('show-tooltip', {
                id: entity.data.id,
                type: entity.data.type,
                speed: entity.data.speed,
                position: `(${entity.data.x}, ${entity.data.y})`,
                target: entity.data.targetPosition
                    ? `(${entity.data.targetPosition.x}, ${entity.data.targetPosition.y})`
                    : 'None'
            });
            EntityVisuals.onHover(entity);
        });
    
        entity.sprite.on('pointerout', () => {
            EventBus.emit('hide-tooltip');
            EntityVisuals.onHoverEnd(entity);
        });
    
        entity.sprite.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (pointer.leftButtonDown()) {
                this.handleSelection(entity);
            }
        });
    }
    

    private handleSelection(entity: GameEntity) {
        const shiftKey = this.scene.input.keyboard?.addKey('SHIFT')?.isDown;
        if (!shiftKey) this.clearSelections();

        entity.isSelected = !entity.isSelected;
        EntityVisuals.onSelect(entity, entity.isSelected);

        if (entity.isSelected) {
            this.selectedEntities.push(entity);
            EventBus.emit('entity-selected', entity.data);
        } else {
            this.selectedEntities = this.selectedEntities.filter(e => e !== entity);
            if (this.selectedEntities.length === 0) EventBus.emit('clear-selection');
        }
    }

    private clearSelections() {
        this.selectedEntities.forEach(entity => {
            entity.isSelected = false;
            EntityVisuals.onSelect(entity, false);
        });
        this.selectedEntities = [];
    }
}
