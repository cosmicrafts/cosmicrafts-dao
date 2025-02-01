import { Scene } from 'phaser';
import { useCanisterStore } from '@/stores/canister';
import { EntityManager } from './EntityManager';
import type { ActorSubclass } from '@dfinity/agent';
import type { backend } from '../../../../../declarations/backend';

type _SERVICE = typeof backend extends ActorSubclass<infer T> ? T : never;

type EntityType = _SERVICE['export_entities'] extends () => Promise<Array<infer T>> ? T : never;

type RawEntity = {
    id: bigint;
    entity_type: any;
    position: { x: number; y: number };
    target_position: [] | [{ x: number; y: number }];
    speed: number;
};

type GameFrame = {
    frame_number: bigint;
    timestamp: bigint;
    entities: RawEntity[];
};

export class EntityService {
    private static pollingInterval: number = 100; // .1 second polling
    private static intervalId: NodeJS.Timeout | null = null;
    private static lastFrame = 0n; // Track last processed frame

    static async startPolling(scene: Scene) {
        if (this.intervalId) return; // Prevent multiple intervals

        // Initial full entity fetch
        await this.fetchInitialEntities(scene);

        // Start frame updates
        this.intervalId = setInterval(() => this.fetchAndUpdateFrames(scene), this.pollingInterval);
    }

    static stopPolling() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    private static async fetchInitialEntities(scene: Scene) {
        try {
            const canisterStore = useCanisterStore();
            const cosmicrafts = await canisterStore.get("cosmicrafts");

            const entitiesData: EntityType[] = await cosmicrafts.export_entities();
            const parsedEntities = entitiesData.map(entity => this.parseEntity(entity)).filter(e => e);
            EntityManager.getInstance().updateEntities(parsedEntities);

            console.log("📅 Initial Entities Loaded:", parsedEntities);
        } catch (error) {
            console.error("❌ Error fetching initial entities:", error);
        }
    }

    private static async fetchAndUpdateFrames(scene: Scene) {
        try {
            const canisterStore = useCanisterStore();
            const cosmicrafts = await canisterStore.get("cosmicrafts");
    
            const latestFrame: bigint = BigInt(await cosmicrafts.get_latest_frame_number());
            if (latestFrame > this.lastFrame) {
                const frames: GameFrame[] = await cosmicrafts.get_frames_since(this.lastFrame);
                
                frames.forEach(frame => {
                    console.log(`🛠 Processing Frame: ${frame.frame_number}`, frame.entities);
                    
                    const parsedEntities = frame.entities.map(entity => this.parseEntity(entity)).filter(e => e);
                    console.log(`🎨 Parsed Entities for Frame ${frame.frame_number}:`, parsedEntities);
    
                    // ✅ Store frames for future playback
                    EntityManager.getInstance().storeFrame(parsedEntities);
    
                    // ✅ Immediately update entities to keep graphics running
                    EntityManager.getInstance().updateEntities(parsedEntities);
    
                    // Keep track of the last processed frame
                    this.lastFrame = frame.frame_number;
                });
    
                console.log(`📆 Updated to Frame: ${this.lastFrame}`);
            }
        } catch (error) {
            console.error("❌ Error fetching frames:", error);
        }
    }

    private static parseEntity(entity: RawEntity) {
        console.log("🔍 Raw Entity:", entity);
        if (!entity.position) return null;
        return {
            id: Number(entity.id),
            type: Object.keys(entity.entity_type)[0],
            speed: entity.speed,
            x: entity.position.x,
            y: entity.position.y,
            targetPosition: (Array.isArray(entity.target_position) && entity.target_position.length > 0 ? entity.target_position[0] : null),
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
