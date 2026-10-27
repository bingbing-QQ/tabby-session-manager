'use strict';
// SSH credentials in Tabby 1.0.238 are shared by connection target, not profile ID.
function installSharedCredentialGuard(profilesService, config) {
 if (!profilesService) return () => {};
 let provider;
 try {
  const providers = typeof profilesService.getProviders === 'function' ? profilesService.getProviders() : [];
  provider = providers.find(p => p && p.id === 'ssh') || (typeof profilesService.providerForProfile === 'function' && profilesService.providerForProfile({type:'ssh'}));
 } catch (_) { return () => {}; }
 if (!provider || typeof provider.deleteProfile !== 'function') return () => {};
 const hadOwn = Object.prototype.hasOwnProperty.call(provider,'deleteProfile');
 const original = provider.deleteProfile;
 function connection(profile) {
  const full = typeof profilesService.getConfigProxyForProfile === 'function' ? profilesService.getConfigProxyForProfile(profile) : profile;
  if (!full || full.type !== 'ssh' || !full.options || !full.options.host) return null;
  const o = full.options;
  return [String(o.host), o.port == null ? '' : String(o.port), o.user == null ? '' : String(o.user)];
 }
 const guarded = function(profile) {
  let key, shared = false;
  try {
   key = connection(profile);
   if (key) shared = (config && config.store && config.store.profiles || []).some(other => {
    if (!other || other.type !== 'ssh' || other.id === profile.id || other.isTemplate) return false;
    const otherKey = connection(other); return otherKey && otherKey.every((value,index) => value === key[index]);
   });
  } catch (_) {
   // Cannot establish whether another profile shares a secret: retain it rather than erase it.
   return;
  }
  if (shared) return;
  return original.call(this,profile);
 };
 provider.deleteProfile = guarded;
 return () => { if (provider.deleteProfile === guarded) { if (hadOwn) provider.deleteProfile = original; else delete provider.deleteProfile; } };
}
module.exports = {installSharedCredentialGuard};
