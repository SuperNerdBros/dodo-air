const fs = require('fs');
const path = './src/routes/+layout.svelte';
let content = fs.readFileSync(path, 'utf8');

const startMarker = "let showLogoutModal = $state(false);";
const endMarker = "onDestroy(() => {";

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + `let showLogoutModal = $state(false);

  let pollTimer: ReturnType<typeof setInterval>;

  onMount(() => {
    dalStore.initAuth();
    dalStore.fetchState(true);

    let visitorId = localStorage.getItem('dal_visitor_id');
    if (!visitorId) {
      visitorId = \`v-\${Date.now()}-\${Math.random().toString(36).substring(2, 11)}\`;
      localStorage.setItem('dal_visitor_id', visitorId);
    }
    
    fetch('/wp-json/dodo-air/v1/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId })
    }).catch(err => console.error('Failed to record visit:', err));

    pollTimer = setInterval(() => {
      dalStore.fetchState(false);
    }, 30000);
  });

  ` + content.substring(endIndex);
}

// 2. Remove the clockTimer and clear interval logic from onDestroy
content = content.replace('clearInterval(clockTimer);', '');

fs.writeFileSync(path, content, 'utf8');
console.log('Stripped duplicate onMount logic.');
