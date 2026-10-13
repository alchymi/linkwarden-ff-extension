'use strict';
const $ = id => document.getElementById(id);
const api = LinkAssistant;
const draftId = new URL(location.href).searchParams.get('id');
const storageKey = draftId ? 'page-' + draftId : null;
let page, data, busy = false, saved = false;
function status(message, error = false) { $('status').hidden = false; $('status').classList.toggle('error', error); $('status').textContent = message; }
function readConfig() { return api.settings(Object.fromEntries(['base', 'linkToken', 'openKey', 'model', 'limit'].map(id => [id, $(id).value]))); }
function preview() { if (!page) return; const limit = Number($('limit').value) || 24000; $('preview').textContent = [page.excerpt, page.text.slice(0, limit)].filter(Boolean).join('\n\n'); $('previewLabel').textContent = 'Voir le texte à envoyer · ' + Math.min(page.text.length, limit).toLocaleString('fr') + ' caractères'; }
async function permission(config) { const origins = [new URL(config.base).origin + '/*', 'https://openrouter.ai/*']; if (!await browser.permissions.request({origins})) throw new Error('Autorisez l’accès aux deux serveurs pour continuer.'); }
async function run(fn) { if (busy) return; busy = true; document.querySelectorAll('button').forEach(b => b.disabled = true); try { await fn(); } catch (e) { status(e.message, true); } finally { busy = false; document.querySelectorAll('button').forEach(b => b.disabled = false); $('save').disabled = saved; } }
function fillCatalog() {
  $('collection').replaceChildren(...data.collections.map(c => { const option = document.createElement('option'); option.value = c.id; option.textContent = c.name; return option; }));
  $('tagSuggestions').replaceChildren(...data.tags.map(t => { const option = document.createElement('option'); option.value = t.name; return option; }));
}
function getDraft() { return {name: $('name').value, collectionId: Number($('collection').value), tags: $('tags').value.split(',').map(t => t.trim()).filter(Boolean), description: $('description').value}; }
function fillDraft(draft) { $('name').value = draft.name; $('url').value = page.url; $('collection').value = draft.collectionId; $('tags').value = draft.tags.join(', '); $('description').value = draft.description; $('draftPanel').hidden = false; }
$('settingsToggle').addEventListener('click', () => { $('settingsPanel').hidden = !$('settingsPanel').hidden; });
$('limit').addEventListener('input', preview);
$('settingsForm').addEventListener('submit', event => {
  event.preventDefault();
  // Request optional host permissions directly from a user gesture.
  let config; try { config = readConfig(); } catch(e) { status(e.message, true); return; }
  const granted = permission(config);
  run(async () => { await granted; await browser.storage.local.set({config}); $('base').value = config.base; status('Réglages enregistrés. Vous pouvez analyser votre page.'); preview(); });
});
$('testConnection').addEventListener('click', () => {
  let config; try { config = readConfig(); } catch(e) { status(e.message, true); return; }
  const granted = permission(config);
  run(async () => { await granted; const catalog = await api.catalog(config); status('Connexion réussie : ' + catalog.collections.length + ' collections et ' + catalog.tags.length + ' tags.'); });
});
$('forget').addEventListener('click', () => run(async () => { await browser.storage.local.remove('config'); $('linkToken').value = ''; $('openKey').value = ''; status('Clés effacées de l’extension.'); }));
$('analyze').addEventListener('click', () => {
  let config; try { config = readConfig(); } catch(e) { $('settingsPanel').hidden = false; status(e.message, true); return; }
  const granted = permission(config);
  run(async () => {
    await granted; status('Récupération des collections et des tags…');
    const nextData = await api.catalog(config);
    if (!nextData.collections.length) throw new Error('Créez au moins une collection dans Linkwarden.');
    status('Analyse de la page par ' + config.model + '…');
    const result = await api.analyze(config, page, nextData);
    data = nextData; saved = false; fillCatalog(); fillDraft(result.draft);
    if (storageKey) await browser.storage.session.set({[storageKey]: {page, data, draft: result.draft}});
    status('Proposition prête. Vérifiez les champs avant l’enregistrement.' + (typeof result.cost === 'number' ? ' Coût : ' + result.cost.toFixed(5) + ' $.': ''));
  });
});
$('draftForm').addEventListener('submit', event => {
  event.preventDefault(); if (saved) return;
  run(async () => {
    const config = readConfig(); const draft = getDraft();
    if (draft.tags.length > 6) throw new Error('Six tags maximum.');
    status('Enregistrement dans Linkwarden…');
    const link = await api.save(config, page, draft, data);
    saved = true;
    if (storageKey) await browser.storage.session.set({[storageKey]: {page, data, draft, saved: true}});
    status('Favori enregistré dans Linkwarden' + (link.id ? ' · n° ' + link.id : '') + '.');
    $('save').textContent = '✓ Enregistré';
  });
});
async function init() {
  const stored = await browser.storage.local.get('config');
  const config = stored.config || {base: '', linkToken: '', openKey: '', model: 'openai/gpt-4.1-mini', limit: 24000};
  for (const id of ['base', 'linkToken', 'openKey', 'model', 'limit']) $(id).value = config[id];
  $('settingsPanel').hidden = !!stored.config && !!storageKey;
  if (!storageKey) { status('Configurez vos connexions, puis cliquez sur l’icône de l’extension depuis une page web.'); return; }
  const value = (await browser.storage.session.get(storageKey))[storageKey];
  if (!value?.page) { status(value?.error || 'Cette capture a expiré. Cliquez à nouveau sur l’icône depuis la page.', true); return; }
  page = value.page; $('pagePanel').hidden = false; $('pageTitle').textContent = page.title; $('pageURL').textContent = page.url; $('sourceBadge').textContent = page.selected ? 'Texte sélectionné' : 'Texte de la page'; preview();
  if (!page.text.trim()) status('Peu de texte détecté : l’analyse reposera sur le titre et la description. Une application visuelle peut nécessiter une description manuelle.');
  if (value.draft && value.data) { data = value.data; fillCatalog(); fillDraft(value.draft); saved = !!value.saved; $('save').disabled = saved; if (saved) $('save').textContent = '✓ Enregistré'; }
}
init().catch(e => status(e.message, true));
