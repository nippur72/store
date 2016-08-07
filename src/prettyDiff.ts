// deep-diff
// odiff: https://github.com/Tixit/odiff
export function prettyDiff(d: deepDiff.IDiff)
{
   // #if DEBUG_STORE
   try
   {
      var path = "";
      if(d.path) path = d.path.join(".");
      if(d.index !== undefined) path = path + `[${d.index}]`;

      var value = d.item ? d.item.rhs : d.rhs;

      var msg = "";

      switch(d.kind) {
         case "N":
            msg = `${path} = ${JSON.stringify(d.rhs)};`;
            break;

         case "E":
            msg = `${path} = ${JSON.stringify(d.rhs)}; // was: ${JSON.stringify(d.lhs)}`;
            break;

         case "D":
            msg = `delete ${path}; // was: ${JSON.stringify(d.lhs)}`;
            break;

         case "A":
            if(d.item) {
               switch(d.item.kind) {
                  case "N":
                     msg = `${path} = ${JSON.stringify(d.item.rhs)};`;
                     break;

                  case "E":
                     msg = `${path} = ${JSON.stringify(d.item.rhs)}; // was: ${JSON.stringify(d.item.lhs)}`;
                     break;

                  case "D":
                     msg = `delete ${path}; // was ${JSON.stringify(d.item.lhs)}`;
                     break;

                  default:
                     msg = `array change in ${path}: ${JSON.stringify(d)}`;
               }
            }
            break;

         default:
            msg = `unknown diff: ${JSON.stringify(d)}`;
      }

      return msg;
   }
   catch(ex)
   {
      return ex.message;
   }
   // #endif

   /*
        kind: string;
        path: string[];
        lhs: any;
        rhs: any;
        index?: number;
        item?: IDiff;
   */
}
