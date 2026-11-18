const SUPABASE_URL = "https://eagwosdtokwxicicvkqf.supabase.co";
const SUPABASE_KEY = "sb_publishable_L52lco6_z5_FnmF4lwe-Lg_uX_QNkGm";
const SUPABASE_SDK = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.2/dist/umd/supabase.js";
const SUPABASE_SDK_HASH = "sha384-Rj26LVGvoeRVR6+mwQmFfcR3QOBEwT+ZmuCWpuiqeTzJpCs0ER4ITAWGb4Hiy3Ok";

// Load the Supabase SDK on demand, so a slow or blocked CDN never delays the app,
// its "load" event or the service worker registration
function loadSupabaseClient(timeoutMs = 8000) {
	return new Promise((resolve, reject) => {
		if (window.supabase) return resolve(window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY));

		const script = document.createElement("script");
		script.src = SUPABASE_SDK;
		script.integrity = SUPABASE_SDK_HASH;
		script.crossOrigin = "anonymous";
		script.async = true;

		const timer = setTimeout(() => {
			script.remove();
			reject(new Error("Supabase SDK timeout"));
		}, timeoutMs);

		script.onload = () => {
			clearTimeout(timer);
			resolve(window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY));
		};
		script.onerror = () => {
			clearTimeout(timer);
			reject(new Error("Supabase SDK failed to load"));
		};

		document.head.appendChild(script);
	});
}
