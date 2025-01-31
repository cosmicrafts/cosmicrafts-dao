import { Scene } from 'phaser';
import { useCanisterStore } from '@/stores/canister';
import { EntityManager } from './EntityManager';

// ✅ Type definition for entities
interface Entity {
    id: number;
    speed: number;
    entity_type: { [key: string]: null };
    position: { x: number; y: number };
    target_position?: { x: number; y: number } | null;
}

export class EntityFetcher {
    static async fetchAndCreateEntities(scene: Scene) {
        try {
            const canisterStore = useCanisterStore();
            const cosmicrafts = await canisterStore.get("cosmicrafts");
            const entitiesData: Entity[] = await cosmicrafts.export_entities(); // ✅ Explicitly define type

            console.log("📌  Entities Response:", entitiesData);

            entitiesData.forEach((entity: Entity) => {
                const parsedEntity = EntityFetcher.parseEntity(entity);
                if (parsedEntity) {
                    EntityManager.getInstance().createEntity(
                        parsedEntity.x, 
                        parsedEntity.y, 
                        parsedEntity.texture, 
                        parsedEntity
                    );
                }
            });

        } catch (error) {
            console.error("❌ Error fetching entities:", error);
        }
    }

    private static parseEntity(entity: Entity) {
        if (!entity.position) return null;

        const entityTypeKey = Object.keys(entity.entity_type)[0]; // Extracts "Planet" or "Ship"
        const texture = EntityFetcher.getTextureForEntity(entityTypeKey);

        return {
            id: entity.id,
            type: entityTypeKey,
            speed: entity.speed,
            x: entity.position.x,
            y: entity.position.y,
            targetPosition: entity.target_position || null,
            texture
        };
    }

    private static getTextureForEntity(entityType: string): string {
        const textureMap: { [key: string]: string } = {
            'Planet': 'planet',
            'Ship': 'ship',
            'Station': 'station'
        };
        return textureMap[entityType] || 'ship';
    }
}