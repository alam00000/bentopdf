// Puts a translated string into an element that contains links. In the
// string, [0]text[/0] stands for the element's first child element, [1] for
// the second, and so on: the child is cloned without its content and gets the
// translated text, so href and class stay as they are in the page. The text
// is never parsed as HTML. Returns false, leaving the element untouched, if a
// marker is unpaired or names a child that does not exist.
export function applyLinkedText(element, translation) {
  const children = Array.from(element.children);
  const nodes = [];
  for (const part of translation.split(/(\[\d+\][^[\]]*\[\/\d+\])/)) {
    const match = part.match(/^\[(\d+)\]([^[\]]*)\[\/\1\]$/);
    if (!match) {
      if (/\[\/?\d+\]/.test(part)) return false;
      if (part) nodes.push(element.ownerDocument.createTextNode(part));
      continue;
    }
    const child = children[Number(match[1])];
    if (!child) return false;
    const clone = child.cloneNode(false);
    clone.textContent = match[2];
    nodes.push(clone);
  }
  element.replaceChildren(...nodes);
  return true;
}
