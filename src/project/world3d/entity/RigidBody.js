// https://github.com/mrdoob/three.js/blob/dev/examples/jsm/physics/RapierPhysics.js
// https://github.com/pmndrs/react-three-rapier

import * as THREE from 'three';
import RAPIER from 'rapier';
import { ComponentManager } from '../../../app/ComponentManager.js';
import { SceneManager } from '../../../app/SceneManager.js';

import { ConvexGeometry } from 'three/addons/geometries/ConvexGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const styles = [ 'fixed', 'dynamic', 'kinematic' ];
const colliders = [ 'auto', 'ball', 'capsule', 'cone', 'cuboid', 'cylinder' ];
const automatic = [ 'box', 'sphere', 'hull', 'mesh' ];

const _box = new THREE.Box3();
const _center = new THREE.Vector3();
const _quaternion = new THREE.Quaternion();
const _matrix = new THREE.Matrix4();
const _position = new THREE.Vector3();
const _scale = new THREE.Vector3();
const _size = new THREE.Vector3();
const _zero = new THREE.Vector3();

class Rigidbody {

    init(data = {}) {
        // Generate Backend
        let rigidbody = undefined;

        // Save Backend / Data
        this.backend = rigidbody;
        this.data = data;
    }

    /********** APP EVENTS */

    onLoad() {
        const world = SceneManager.app?.scene?.physics?.backend;
        const entity = this.entity;
        const data = this.data ?? {};
        if (!world || !entity) return;

        // Rigidbody Description
        let description = undefined;
        switch (data.style) {
            case 'dynamic':
                description = RAPIER.RigidBodyDesc.dynamic();
                break;
            case 'kinematic':
                // description = RAPIER.RigidBodyDesc.kinematicPositionBased();
                description = RAPIER.RigidBodyDesc.kinematicVelocityBased();
                break;
            case 'fixed':
            default:
                description = RAPIER.RigidBodyDesc.fixed();
        }

        // Position
        description.setTranslation(...entity.position);
        description.setRotation(entity.quaternion);

        // Velocity
        if (data.style === 'dynamic' || data.style === 'kinematic') {
            if (Array.isArray(data.velocity) && data.velocity.length > 2) {
                const vx = data.velocity[0];
                const vy = data.velocity[1];
                const vz = data.velocity[2];
                description.setLinvel(vx, vy, vz);
            }
            if (Array.isArray(data.angular) && data.angular.length > 2) {
                const ax = data.angular[0];
                const ay = data.angular[1];
                const az = data.angular[2];
                description.setAngvel({ x: ax, y: ay, z: az });
            }
        }

        // Rigidbody
        const rigidbody = world.createRigidBody(description);
        this.backend = rigidbody; /* save to backend */

        // Shape Properties
        function addColliderToRigidBody(colliderDescription) {
            // Mass (Auto)
            // MANUAL: colliderDescription.setMass(data.mass);
            // Restitution (Bounce)
            colliderDescription.setRestitution(data.bounce ?? 0);
            // Add to Rigidbody
            world.createCollider(colliderDescription, rigidbody);
        }

        // Collider Description
        if (data.collider === 'auto') {
            const geometryComponent = entity.getComponent('geometry');
            const geometry = geometryComponent.backend;
            if (geometry && geometry.isBufferGeometry) {
                switch (data.generate) {
                    case 'box':
                        geometry.computeBoundingBox();
                        geometry.boundingBox.getSize(_size);
                        const sx = Math.abs((_size.x * entity.scale.x) / 2);
                        const sy = Math.abs((_size.y * entity.scale.y) / 2);
                        const sz = Math.abs((_size.z * entity.scale.z) / 2);
                        addColliderToRigidBody(RAPIER.ColliderDesc.cuboid(sx, sy, sz));
                        break;

                    case 'sphere':
                        geometry.computeBoundingSphere();
                        const radius = isNaN(geometry.boundingSphere.radius) ? 0.5 : geometry.boundingSphere.radius;
                        const maxSize = Math.max(entity.scale.x, Math.max(entity.scale.y, entity.scale.z));
                        addColliderToRigidBody(RAPIER.ColliderDesc.ball(radius * maxSize));
                        break;

                    case 'hull':
                        const points = new Float32Array(geometry.attributes.position.array);
                        addColliderToRigidBody(RAPIER.ColliderDesc.convexHull(points));
                        break;

                    case 'mesh':
                        const vertices = new Float32Array(geometry.attributes.position.array);
                        const indices = (geometry.index)
                            ? new Uint32Array(geometry.index.array)
                            : new Uint32Array([...Array(vertices.length / 3).keys()]);
                        addColliderToRigidBody(RAPIER.ColliderDesc.trimesh(vertices, indices));
                        break;
                }
            }

        } else if (data.collider === 'ball') {
            const radius = (0.5) * Math.max(entity.scale.x, Math.max(entity.scale.y, entity.scale.z));
            addColliderToRigidBody(RAPIER.ColliderDesc.ball(radius));

        } else if (data.collider === 'capsule') {

            // TODO

        } else if (data.collider === 'cone') {

            // TODO

        } else if (data.collider === 'cuboid') {
            const sx = (0.5) * entity.scale.x; /* radius, i.e. "width / 2" */
            const sy = (0.5) * entity.scale.y;
            const sz = (0.5) * entity.scale.z;
            addColliderToRigidBody(RAPIER.ColliderDesc.cuboid(sx, sy, sz));

        } else if (data.collider === 'cylinder') {
            const sy = (0.5) * entity.scale.y;
            const radius = (0.5) * Math.max(entity.scale.x, entity.scale.z);
            addColliderToRigidBody(RAPIER.ColliderDesc.cylinder(sy, radius));

        }

        // MORE COLLIDER TYPES:
        // - 'heightField'
        // - 'polyline'
    }

    onUpdate(delta = 0) {
        const rigidbody = this.backend;
        const entity = this.entity;
        const data = this.data ?? {};
        if (!rigidbody || !entity) return;

        if (data.style === 'fixed') {
            rigidbody.setTranslation(entity.position);
            rigidbody.setRotation(entity.quaternion);
        } else {
            entity.position.copy(rigidbody.translation());
            entity.rotation.setFromQuaternion(_quaternion.copy(rigidbody.rotation()), undefined, false);
        }
    }

    onRemove() {
        //
        // TODO: Removed from Scene
        //
    }

    /********** CUSTOM */

    setLinvel(x = 0, y = 0, z = 0) {
        const rigidbody = this.backend;
        const entity = this.entity;
        if (!rigidbody || !entity) return;
        rigidbody.setLinvel({ x, y, z }, true /* awake */);
    }

    setAngvel(x = 0, y = 0, z = 0) {
        const rigidbody = this.backend;
        const entity = this.entity;
        if (!rigidbody || !entity) return;
        rigidbody.setAngvel({ x, y, z }, true /* awake */);
    }

    colliderGeometry() {
        const entity = this.entity;
        const data = this.data ?? {};
        if (!data || !entity) return undefined;

        if (data.collider && data.collider === 'auto' && entity.isEntity) {
            const geometryComponent = entity.getComponent('geometry');
            const geometry = geometryComponent ? geometryComponent.backend : undefined;
            if (geometry && geometry.isBufferGeometry) {
                switch (data.generate) {
                    case 'box':
                        geometry.computeBoundingBox();
                        geometry.boundingBox.getCenter(_center);
                        geometry.boundingBox.getSize(_size);
                        const sx = Math.abs(_size.x);
                        const sy = Math.abs(_size.y);
                        const sz = Math.abs(_size.z);
                        const boxGeometry = new THREE.BoxGeometry(sx, sy, sz);
                        boxGeometry.translate(_center.x, _center.y, _center.z);
                        return boxGeometry;
                    case 'sphere':
                        geometry.computeBoundingSphere();
                        _center.copy(geometry.boundingSphere.center);
                        const radius = isNaN(geometry.boundingSphere.radius) ? 0.5 : geometry.boundingSphere.radius;
                        const sphereGeometry = new THREE.SphereGeometry(radius, 32);
                        sphereGeometry.translate(_center.x, _center.y, _center.z);
                        return sphereGeometry;
                    case 'hull':
                        const vertices = [];
                        const positionAttribute = geometry.getAttribute('position');
                        for (let i = 0; i < positionAttribute.count; i++) {
                            const vertex = new THREE.Vector3();
                            vertex.fromBufferAttribute(positionAttribute, i);
                            vertices.push(vertex);
                        }
                        return new ConvexGeometry(vertices);
                    case 'mesh':
                        return geometry.clone();
                }
            }
        }

        switch (data.collider) {
            case 'ball':
                return new THREE.SphereGeometry(0.5, 32);
            case 'capsule':

                // TODO

                return undefined;
            case 'cone':

                // TODO

                return undefined;
            case 'cuboid':
                return new THREE.BoxGeometry(1, 1, 1);
            case 'cylinder':
                return new THREE.CylinderGeometry(0.5, 0.5, 1);
        }

        return undefined;
    }

    colliderShape() {
        return (this.data.collider === 'auto') ? this.data.generate : this.data.collider;
    }

    colliderStyle() {
        return this.data.style ?? 'fixed';
    }

}

Rigidbody.config = {
    schema: {
        style: { type: 'select', default: 'dynamic', select: styles },

        // DIVIDER
        styleDivider: { type: 'divider' },

        // Shape
        collider: { type: 'select', default: 'auto', select: colliders, rebuild: true },
        generate: { type: 'select', default: 'box', select: automatic, if: { collider: [ 'auto' ] } },

        // DIVIDER
        shapeDivider: { type: 'divider' },

        // Mass / Restitution (Bounciness)
        // mass: { type: 'number', default: 1 },
        bounce: { type: 'slider', default: 0, min: 0, max: 1, precision: 2 },

        // Velocity
        velocity: { type: 'vector', size: 3, tint: true, step: 1.0, precision: 2, if: { style: [ 'dynamic', 'kinematic' ] } },
        angular: { type: 'vector', size: 3, tint: true, step: 1.0, precision: 2, if: { style: [ 'dynamic', 'kinematic' ] } },

        // Options
        // canSleep: { type: 'boolean', default: true, },
        // ccdEnabled: { type: 'boolean', default: false, },
        // gravityScale: { type: 'number', default: 1.0, if: { style: [ 'dynamic' ] }, },

        ///// Possible??

        // friction: { type: 'slider', default: 0.5 },

        // linearDamping: { type: 'number', default: 0.01, min: 0, max: 1, if: { style: [ 'dynamic', 'kinematic' ] } },
        // angularDamping: { type: 'number', default: 0.01, min: 0, max: 1, if: { style: [ 'dynamic', 'kinematic' ] } },

        // fixedRotation: { type: 'boolean', default: false, if: { style: [ 'dynamic', 'kinematic' ] } },

        // collisionResponse: { type: 'boolean', default: true },
        // collisionFilterGroup: { type: 'int', default: 1 },
        // collisionFilterMask: { type: 'int', default: - 1 },
    },
    icon: ``,
    color: '#0F4F94',
    multiple: false,
    group: [ 'Entity3D' ],
};

ComponentManager.register('rigidbody', Rigidbody);
