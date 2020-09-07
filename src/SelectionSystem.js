import * as THREE from 'three';
import { GPUPicker } from 'three_gpu_picking';

const selectionSystem = {
    init(renderer, scene, camera) {
        this.renderer = renderer;
        this.gpuPicker = new GPUPicker(THREE, renderer, scene, camera);
        this.callbackMap = new Map();
        this.ignoreSet = new Set();

        window.onclick = (ev) => {           
            const objectId = this.gpuPicker.pick(ev.clientX / this.renderer.getPixelRatio(), ev.clientY / this.renderer.getPixelRatio(), (obj3d) => {        
                return !(this.ignoreSet.has(obj3d.id));
            });
            if (this.callbackMap.has(objectId)) {
                this.callbackMap.get(objectId)();
            }
        };
    },

    subscribeToSelect(obj3d, callback) {
        this.callbackMap.set(obj3d.id, callback);
        return () => {
            this.callbackMap.delete(obj3d.id);
        };
    },

    subscribeToIgnore(obj3d) {
        this.ignoreSet.add(obj3d.id);
        return () => {
            this.ignoreSet.delete(obj3d.id);
        };
    }
};

export default selectionSystem;
