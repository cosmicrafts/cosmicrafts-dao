import { Scene } from 'phaser';
import { useCanisterStore } from '@/stores/canister';
import { EntityManager } from './EntityManager';
import { createActor, canisterId } from '../../../../../declarations/backend';

// ✅ Use `import type` for type-only imports
import type { ActorSubclass } from '@dfinity/agent';
import type { backend } from '../../../../../declarations/backend';

// ✅ Infer `_SERVICE` dynamically instead of direct import
type _SERVICE = typeof backend extends ActorSubclass<infer T> ? T : never;

// ✅ Create the actor and cast it properly
const backendActor = createActor(canisterId) as ActorSubclass<_SERVICE>;

// ✅ Extract entity type safely
type EntityType = _SERVICE['export_entities'] extends () => Promise<Array<infer T>> ? T : never;

export class EntityFetcher {
    static async fetchAndCreateEntities(scene: Scene) {
        try {
            const canisterStore = useCanisterStore();
            const cosmicrafts = await canisterStore.get("cosmicrafts");

            // ✅ Use the correct type inferred from `_SERVICE`
            const entitiesData: EntityType[] = await cosmicrafts.export_entities();

            console.log("📌  Entities Response:", entitiesData);

            entitiesData.forEach((entity) => {
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

    // ✅ Ensure `EntityType` is correctly inferred
    private static parseEntity(entity: EntityType) {
        if (!entity.position) return null;

        const entityTypeKey = Object.keys(entity.entity_type)[0]; // Extracts "Planet" or "Ship"
        const texture = EntityFetcher.getTextureForEntity(entityTypeKey);

        return {
            id: Number(entity.id), // ✅ Convert bigint to number
            type: entityTypeKey,
            speed: entity.speed,
            x: entity.position.x,
            y: entity.position.y,
            targetPosition: entity.target_position.length > 0 ? entity.target_position[0] : null,
            texture
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
