import * as THREE from 'three';
import RAPIER from 'rapier';
import { ComponentManager } from '../../../app/ComponentManager.js';
import { SceneManager } from '../../../app/SceneManager.js';

const styles = [ 'dynamic', 'fixed' ]; // 'static', 'kinematic'
const shapes = [ 'ball', 'cuboid' ];

class Rigidbody {

    init(data = {}) {
        // Generate Backend
        let body = undefined;

        // Save Backend / Data
        this.backend = body;
        this.data = data;
    }

    /********** APP EVENTS */

    onLoad() {
        // if (mesh.geometry.type === 'BoxGeometry') {
        //     const sx = parameters.width !== undefined ? parameters.width / 2 : 0.5;
        //     const sy = parameters.height !== undefined ? parameters.height / 2 : 0.5;
        //     const sz = parameters.depth !== undefined ? parameters.depth / 2 : 0.5;
        //     shape = RAPIER.ColliderDesc.cuboid(sx, sy, sz);
        // } else if (mesh.geometry.type === 'SphereGeometry' || mesh.geometry.type === 'IcosahedronGeometry') {
        //     const radius = parameters.radius !== undefined ? parameters.radius : 1;
        //     shape = RAPIER.ColliderDesc.ball(radius);
        // }

        const mass = 1; // 0 == fixed
        const restitution = 0;
        const shape = RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5);
        shape.setMass(mass);
        shape.setRestitution(restitution);

        const world = SceneManager.app?.scene?.physics?.backend;
        const entity = this.entity;
        if (world && entity) {
            // Body
            let description;
            if (this.data.style === 'fixed' /* || this.data.mass <= 0 */) {
                description = RAPIER.RigidBodyDesc.fixed();
            } else /* if this.data.style === 'dynamic') */ {
                description = RAPIER.RigidBodyDesc.dynamic();
            }
            description.setTranslation(...entity.position);
            description.setRotation(entity.quaternion);
            const body = world.createRigidBody(description);
            this.backend = body;

            // Collider
            world.createCollider(shape, body);
        }

    }

    onUpdate(delta = 0) {
        const body = this.backend;
        const entity = this.entity;
        if (!body || !entity) return;

        body.translation();

        entity.position.copy(body.translation());
        entity.quaternion.copy(body.rotation());
    }

    // setPosition(position /* Vector3 */) {
    //     const body = this.backend;
    //     if (!body) return;
    //     body.setAngvel(_zero);
    //     body.setLinvel(_zero);
    //     body.setTranslation(position);
    // }

    // setVelocity(velocity) {
    //     const body = this.backend;
    //     if (!body) return;
    //     body.setLinvel(velocity);
    // }

}

Rigidbody.config = {
    schema: {
        style: { type: 'select', default: 'dynamic', select: styles },

        // DIVIDER
        styleDivider: { type: 'divider' },

        // Shape
        shape: { type: 'select', default: 'cuboid', select: shapes },

        // DIVIDER
        shapeDivider: { type: 'divider' },

        // Mass / Velocity
        mass: { type: 'number', default: 1 },
        // velocity: { type: 'vector3', if: { style: [ 'dynamic', 'kinematic' ] } },
        // angularVelocity: { type: 'vector3', if: { style: [ 'dynamic', 'kinematic' ] } },

        // linearDamping: { type: 'number', default: 0.01, min: 0, max: 1, if: { style: [ 'dynamic', 'kinematic' ] } },
        // angularDamping: { type: 'number', default: 0.01, min: 0, max: 1, if: { style: [ 'dynamic', 'kinematic' ] } },

        // fixedRotation: { type: 'boolean', default: false, if: { style: [ 'dynamic', 'kinematic' ] } },
        // linearFactor: { type: 'vector3', default: [ 1, 1, 1 ], min: 0, max: 1, if: { style: [ 'dynamic', 'kinematic' ] } },
        // angularFactor: { type: 'vector3', default: [ 1, 1, 1 ], min: 0, max: 1, if: { style: [ 'dynamic', 'kinematic' ] } },

        // sleepSpeedLimit: { type: 'number', default: 0.1, min: 0, if: { style: [ 'dynamic', 'kinematic' ] } },
        // sleepTimeLimit: { type: 'number', default: 1, min: 0, if: { style: [ 'dynamic', 'kinematic' ] } },

        // material: { type: 'asset' },
        // collisionResponse: { type: 'boolean', default: true },
        // collisionFilterGroup: { type: 'int', default: 1 },
        // collisionFilterMask: { type: 'int', default: - 1 },
    },
    icon: ``,
    color: '#1365C2',
    multiple: false,
    group: [ 'Entity3D' ],
};

ComponentManager.register('rigidbody', Rigidbody);
