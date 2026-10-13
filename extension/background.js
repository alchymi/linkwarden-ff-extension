function extractPage() {
  const title = document.title || location.hostname;
  const excerpt = document.querySelector('meta[name="description"]')?.content || '';
  const selection = getSelection()?.toString().trim();
  const source = document.querySelector('article') || document.querySelector('main') || document.querySelector('[role="main"]') || document.body;
  const pieces = [];
  let length = 0;
  if (!selection && source) {
    const walker = document.createTreeWalker(source, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode()) && length < 60000) {
      const parent = node.parentElement;
      if (!parent || parent.closest('script,style,noscript,nav,footer,header,form,input,textarea,select,button,[hidden],[aria-hidden="true"],[contenteditable="true"]')) continue;
      const style = getComputedStyle(parent);
      if (style.display === 'none' || style.visibility === 'hidden' || !parent.getClientRects().length) continue;
      const value = node.textContent.replace(/\s+/g, ' ').trim();
      if (value) { pieces.push(value); length += value.length + 1; }
    }
  }
  return {url: location.href, title, excerpt, text: (selection || pieces.join('\n')).slice(0, 60000), selected: !!selection};
}
browser.action.onClicked.addListener(async tab => {
  const id = crypto.randomUUID();
  let value;
  try {
    if (!/^https?:\/\//.test(tab.url || '')) throw new Error('Ouvrez une page web HTTP ou HTTPS. Les pages internes et le lecteur PDF ne sont pas accessibles.');
    const result = await browser.scripting.executeScript({target: {tabId: tab.id}, func: extractPage});
    value = {page: result[0].result};
  } catch { value = {error: 'Cette page ne peut pas être lue. Essayez une page web classique (hors pages internes Firefox, lecteur PDF et sites protégés).'}; }
  await browser.storage.session.set({['page-' + id]: value});
  await browser.windows.create({url: browser.runtime.getURL('page.html') + '?id=' + id, type: 'popup', width: 780, height: 880});
});
