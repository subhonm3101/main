window.DONISHEF_SUPABASE_CONFIG = {
  url: 'https://wmlssjgginnqxkjjygmu.supabase.co',
  anonKey: 'sb_publishable_WrrvPHP2CFcwLnfkSAMWCw_XFZEC0zz'
};

window.createDoniSupabaseClient = () => {
  const {url, anonKey} = window.DONISHEF_SUPABASE_CONFIG;
  if (!url || !anonKey) return null;
  if (!window.supabase?.createClient) {
    throw new Error('Библиотека Supabase не загружена.');
  }
  return window.supabase.createClient(url, anonKey);
};