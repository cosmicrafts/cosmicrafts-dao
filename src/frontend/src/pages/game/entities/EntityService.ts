import { Scene } from 'phaser';
import { useCanisterStore } from '@/stores/canister';
import { EntityManager } from './EntityManager';
import { createActor, canisterId } from '../../../../../declarations/backend';

import type { ActorSubclass } from '@dfinity/agent';
import type { backend } from '../../../../../declarations/backend';

type _SERVICE = typeof backend extends ActorSubclass<infer T> ? T : never;
const backendActor = createActor(canisterId) as ActorSubclass<_SERVICE>;

type EntityType = _SERVICE['export_entities'] extends () => Promise<Array<infer T>> ? T : never;

export class EntityService {
    private static pollingInterval: number = 1000; // 100ms polling
    private static intervalId: NodeJS.Timeout | null = null;

    static startPolling(scene: Scene) {
        if (this.intervalId) return; // Prevent multiple intervals
        this.intervalId = setInterval(() => this.fetchAndUpdateEntities(scene), this.pollingInterval);
    }

    static stopPolling() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    private static async fetchAndUpdateEntities(scene: Scene) {
        try {
            const canisterStore = useCanisterStore();
            const cosmicrafts = await canisterStore.get("cosmicrafts");

            const entitiesData: EntityType[] = await cosmicrafts.export_entities();
            console.log("📌 Entities Response:", entitiesData);

            const parsedEntities = entitiesData.map(entity => this.parseEntity(entity)).filter(e => e);
            EntityManager.getInstance().updateEntities(parsedEntities);
        } catch (error) {
            console.error("❌ Error fetching entities:", error);
        }
    }

    private static parseEntity(entity: EntityType) {
        if (!entity.position) return null;

        return {
            id: Number(entity.id), // Convert bigint to number
            type: Object.keys(entity.entity_type)[0], // Extracts "Planet" or "Ship"
            speed: entity.speed,
            x: entity.position.x,
            y: entity.position.y,
            targetPosition: entity.target_position.length > 0 ? entity.target_position[0] : null,
            texture: this.getTextureForEntity(Object.keys(entity.entity_type)[0])
        };
    }

    private static getTextureForEntity(entityType: string): string {
        const textureMap: { [key: string]: string } = {
            'Planet': 'planet',
            'Ship': 'ship',
            'Star': 'star',
            'Mine': 'mine',
            'Player': 'player'
        };
        return textureMap[entityType] || 'ship';
    }
}