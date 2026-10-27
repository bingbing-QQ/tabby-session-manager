'use strict';
// Share the existing session service with its settings page without importing
// the Angular module back into the logging adapter or publishing another plugin.
const services=new WeakMap();
function register(config,service){services.set(config,service);return ()=>{if(services.get(config)===service)services.delete(config);};}
function get(config){return services.get(config)||null;}
module.exports={register,get};
