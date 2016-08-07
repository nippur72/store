
// #if DEBUG_STORE
import { cloneDeep } from "lodash";
import { diff } from "deep-diff";
import { prettyDiff } from "./prettyDiff";
// #endif

export interface IUpdatable {
   update();
}

let debug = false;

// #if DEBUG_STORE
debug = true;
// #endif

export class Store {
   private listeners: IUpdatable[] = [];
   private oldState: any;

   constructor(public name: string) {
   }

   update() {
      // #if DEBUG_STORE
      if(debug) {
         this.showDiff();
      }
      // #endif

      this.listeners.forEach(listener => {
         // calls listener.update() with correct "this"
         listener.update.call(listener);
      });
   }

   subscribe(listener: IUpdatable) {
      if(typeof listener.update !== 'function') {
         throw `can't subscribe to store '${this.name}': missing 'update' function`;
      }

      if(this.listeners.filter(item => item===listener).length) {
         throw `already subscribed to store '${this.name}`;
      }

      this.listeners.push(listener);

      // #if DEBUG_STORE
      if(debug) {
         console.log(`store '${this.name}': subscribed`);
      }
      // #endif
   }

   unsubscribe(listener) {
      this.listeners = this.listeners.filter(item => item!==listener);

      // #if DEBUG_STORE
      if(debug) {
         console.log(`store '${this.name}': unsubscribed`);
      }
      // #endif
   }

   // #if DEBUG_STORE
   showDiff() {
      const oldState = this.oldState;
      const newState = this["data"];

      const diffs = diff(oldState, newState);

      if(diffs)  {
         const header = `store '${this.name}': updated (${diffs.length} diffs)`;
         if(diffs.length>4) {
            console.groupCollapsed(header);
         } else {
            console.group(header);
         }
         diffs.forEach(d => console.log(prettyDiff(d)));
         console.groupEnd();
      } else {
         console.log(`store '${this.name}': updated (no diffs)`);
      }

      this.oldState = _.cloneDeep(newState);
   }
   // #endif

   error(exception) {
      // #if DEBUG_STORE
      if(debug) {
         console.error(`store '${this.name}': exception raised while performing action`);
         console.error(exception);
      }
      // #endif
   }

   // @Store.action decorator
   static action() {
      // #if DEBUG_STORE
      if(debug) {
         return (target: any, name: string, descriptor: TypedPropertyDescriptor<any>) => {
            const oldfun = target[name] as Function;

            descriptor.value = function() {
               const _arguments = Array.prototype.slice.call(arguments);
               let args = JSON.stringify(_arguments);

               // remove trailing "[]"
               args = args.slice(1,args.length-1);

               console.log(`store '${this.name}': triggered action ${name}(${args})`);

               // hook before call
               this["oldState"] = _.cloneDeep(this.data);

               // execute action
               var ret = oldfun.apply(this, arguments);

               // hook after call
               return ret;
            };
         }
      }
      // #endif

      // #if DEBUG_STORE === undefined
      return ()=>{};
      // #endif
   }
}
