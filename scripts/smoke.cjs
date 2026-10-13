// Explicit API integration test. Never bundled into the extension archive.
const fs = require('node:fs');
const api = require('../extension/core.js');
async function main() {
  const values = {};
  for (const line of fs.readFileSync('tocken.git', 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*(url|tocken|openrouterkey)\s*:\s*(.*?)\s*$/i);
    if (match) values[match[1].toLowerCase()] = match[2];
  }
  const config = api.settings({base: values.url, linkToken: values.tocken, openKey: values.openrouterkey, model: 'openai/gpt-4.1-mini', limit: 24000});
  const catalog = await api.catalog(config);
  console.log('Linkwarden OK:', catalog.collections.length, 'collections,', catalog.tags.length, 'tags');
  const page = {url: 'https://example.com/?test=linkwarden-firefox-ai', title: 'Example Domain', excerpt: 'Domaine de démonstration', text: 'Example Domain. This domain is for use in illustrative examples in documents. You may use this domain in literature without prior coordination or asking for permission.'};
  const result = await api.analyze(config, page, catalog);
  console.log('OpenRouter OK:', JSON.stringify(result));
  if (!process.argv.includes('--save')) return;
  result.draft.name = 'Test extension Firefox IA — ' + result.draft.name;
  result.draft.description = 'Test de bout en bout de l’extension Firefox. Supprimable.\n\n' + result.draft.description;
  const link = await api.save(config, page, result.draft, catalog);
  if (!link.id) throw new Error('Identifiant absent après création.');
  const stored = await api.request(config.base + '/api/v1/links/' + link.id, config.linkToken);
  const saved = stored.response ?? stored.data ?? stored;
  if (saved.url !== page.url || saved.name !== result.draft.name || saved.description !== result.draft.description || saved.collectionId !== result.draft.collectionId) throw new Error('Les champs relus ne correspondent pas.');
  console.log('Création et relecture OK:', link.id, saved.name, 'collection', saved.collectionId);
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
