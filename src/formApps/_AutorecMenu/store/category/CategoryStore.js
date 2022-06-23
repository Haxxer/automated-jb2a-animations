import { writable }           from "svelte/store";

import { localize }           from "@typhonjs-fvtt/runtime/svelte/helper";

// import { DynArrayReducer }    from '@typhonjs-fvtt/runtime/svelte/store';
// TODO: This is an updated DynArrayReducer that will be in the next TRL release.
import { DynArrayReducer }    from '@typhonjs-utils/dyn-array-reducer';

import {
   isObject,
   uuidv4 }                   from "@typhonjs-fvtt/runtime/svelte/util";

import { AnimationStore }     from "../animation/AnimationStore.js";
import { filterSearch }       from "./filterSearch.js";

import { aaSessionStorage }   from "../../../../sessionStorage.js";
import { constants }          from "../../../../constants.js";
import { gameSettings }       from "../../../../gameSettings.js";

/**
 * @template T
 */
export class CategoryStore {
   /** @type {T[]} */
   #data = [];

   #dataReducer = new DynArrayReducer({
      data: this.#data,
      filters: [filterSearch]
   });

   /** @type {string} */
   #key;

   #stores;

   #StoreClass;

   /**
    * Stores the subscribers.
    *
    * @type {(function(T[]): void)[]}
    */
   #subscriptions = [];

   constructor(key, StoreClass, defaultData) {
      if (typeof key !== 'string') { throw new TypeError(`'key' is not a string.`); }

      if (!(StoreClass instanceof AnimationStore.constructor))
      {
         throw new TypeError(`'StoreClass' is not an instance of AnimationStore.`);
      }

      if (!Array.isArray(defaultData)) { throw new TypeError(`'defaultData' is not an array.`); }

      this.#key = key;
      this.#StoreClass = StoreClass;

      this.#stores = {
         scrollTop: aaSessionStorage.getStore(`${constants.moduleId}-category-scrolltop-${key}`)
      };

      gameSettings.register({
         moduleId: constants.moduleId,
         key,
         store: this,
         options: {
            scope: "world",
            config: false,
            default: defaultData,
            type: Array
         }
      });
   }

   /**
    * @returns {T[]}
    */
   get data() { return this.#data; }

   /**
    * @returns {DynArrayReducer<AnimationStore>}
    */
   get dataReducer() { return this.#dataReducer; }

   get filterSearch() { return filterSearch; }

   get icon() { return localize(`autoanimations.app.${this.#key}.icon`); }

   get label() { return localize(`autoanimations.app.${this.#key}.label`); }

   /**
    * @returns {CategoryStores}
    */
   get stores() { return this.#stores; }

   add(data = {}) {
      if (!isObject(data)) { throw new TypeError(`'data' is not an object.`); }

      if (typeof data.id !== 'string') { data.id = uuidv4(); }

      this.#data.push(new this.#StoreClass(data, this));
      this.updateSubscribers();
   }

   /**
    * Deletes a given animation from the category store.
    *
    * @param {T}  animation -
    */
   delete(animation) {
      if (!(animation instanceof AnimationStore)) {
         throw new TypeError(`'animation' is not an instance of AnimationStore.`);
      }

      const index = this.#data.findIndex((entry) => entry.id === animation.id);

      if (index >= 0) {
         this.#data[index].destroy();
         this.#data.splice(index, 1);
         this.updateSubscribers();
      }
   }

   /**
    * Finds an AnimationStore instance by 'id' / UUIDv4.
    *
    * @param {string}   id - A UUIDv4 string.
    *
    * @returns {T|void} AnimationStore instance.
    */
   find(id)
   {
      const index = this.#data.findIndex((entry) => entry.id === id);
      return index >= 0 ? this.#data[index] : void 0;
   }

   set(newData) {
      if (!Array.isArray(newData)) { throw new TypeError(`'newData' is not an Array.`); }

      const data = this.#data;

      // Create a set of all current entry IDs.
      const removeIDSet = new Set(data.reduce((array, current) => {
         array.push(current.id);
         return array;
      }, []));

      for (const newEntry of newData)
      {
         const id = newEntry.id;

         if (typeof id !== 'string') { throw new Error(`'newEntry.id' is not a string.`)}

         const index = data.findIndex((entry) => entry.id === id);

         if (index >= 0) {
            data[index].set(newEntry);
            removeIDSet.delete(id);
         }
         else {
            data.push(new this.#StoreClass(newEntry, this));
         }
      }

      // Remove entries that are no longer in data.
      for (const id of removeIDSet)
      {
         const index = data.findIndex((entry) => entry.id === id);
         if (index >= 0)
         {
            data[index].destroy();
            data.splice(index, 1);
         }
      }

      this.updateSubscribers();
   }

   /**
    * Sorts data entries by name attribute.
    */
   sortAlpha() {
      this.#data.sort((a, b) => {
         const aName = a?.name ?? '';
         const bName = b?.name ?? '';
         return aName.localeCompare(bName);
      });

      this.updateSubscribers();
   }

   toJSON() {
      return foundry.utils.deepClone(this.#data, { strict: true });
   }

// -------------------------------------------------------------------------------------------------------------------

   /**
    * @param {function(T[]): void} handler - Callback function that is invoked on update / changes.
    *
    * @returns {(function(): void)} Unsubscribe function.
    */
   subscribe(handler) {
      this.#subscriptions.push(handler); // add handler to the array of subscribers

      handler(this.#data);                     // call handler with current value

      // Return unsubscribe function.
      return () => {
         const index = this.#subscriptions.findIndex((sub) => sub === handler);
         if (index >= 0) { this.#subscriptions.splice(index, 1); }
      };
   }

   updateSubscribers() {
      const subscriptions = this.#subscriptions;

      const data = this.#data;

      for (let cntr = 0; cntr < subscriptions.length; cntr++) { subscriptions[cntr](data); }

      // This will update the filtered data and `dataReducer` store and forces an update to subscribers.
      this.#dataReducer.index.update(true);
   }
}

/**
 * @typedef {object} CategoryStores
 *
 * @property {import('svelte/store').Writable<number|void>} scrollTop - Stores current scroll top.
 */
