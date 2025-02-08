import { Scene, Tweens, Math as PhaserMath } from 'phaser';
import type { GameEntity } from './EntityManager';

export class EntityMovement {
    static moveEntity(entity: GameEntity, target: { x: number; y: number }, speed: number, dt: number) {
        if (!entity.sprite || !target) return;

        const dx = target.x - entity.sprite.x;
        const dy = target.y - entity.sprite.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // 🚀 Backend formula: movement based on speed & dt
        if (distance <= speed * dt) {
            // Entity has reached target
            entity.sprite.setPosition(target.x, target.y);
            entity.tween?.stop();
            entity.tween = undefined;
        } else {
            // Calculate how far it should move in this update
            const move_x = (dx / distance) * speed * dt;
            const move_y = (dy / distance) * speed * dt;

            // Smoothly interpolate position based on backend
            const newX = entity.sprite.x + move_x;
            const newY = entity.sprite.y + move_y;

            // 🚀 Interpolated movement
            entity.sprite.setPosition(newX, newY);

            // If using tweens, ensure smooth updates
            if (!entity.tween || !entity.tween.isPlaying()) {
                entity.tween = entity.sprite.scene.tweens.add({
                    targets: entity.sprite,
                    x: newX,
                    y: newY,
                    duration: 100,
                    ease: 'Linear',
                    onComplete: () => entity.tween = undefined
                });
            }
        }
    }
}
