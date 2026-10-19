// On phones every data table is shown as a stack of cards (see `.mobile-cards` in index.css).
// The CSS needs each cell to know its column title, so copy the header text into `data-label`.
// Done once here for every table instead of editing each view's markup.

const SKIP_SELECTOR = '#printable-receipt, .no-cards';

const labelTable = (table: HTMLTableElement) => {
  if (table.closest(SKIP_SELECTOR)) return;
  table.classList.add('mobile-cards');

  const headerRow = table.tHead?.rows[table.tHead.rows.length - 1];
  if (!headerRow) return;
  const labels: string[] = [];
  for (const cell of Array.from(headerRow.cells)) {
    const text = cell.textContent?.trim() ?? '';
    for (let i = 0; i < cell.colSpan; i++) labels.push(text);
  }

  // Card roles: the row-number column is dropped, the last column (edit/delete buttons) gets its
  // own row, and the first real column becomes the card title.
  const lastColumn = labels.length - 1;
  const isDataColumn = (label: string, index: number) => label !== '' && label !== '#' && index !== lastColumn;
  const nameColumn = labels.findIndex((label, index) => isDataColumn(label, index) && /ناو|name|اسم/i.test(label));
  const titleColumn = nameColumn !== -1 ? nameColumn : labels.findIndex(isDataColumn);

  const bodies = [...Array.from(table.tBodies), ...(table.tFoot ? [table.tFoot] : [])];
  for (const body of bodies) {
    for (const row of Array.from(body.rows)) {
      let column = 0;
      for (const cell of Array.from(row.cells)) {
        const label = cell.colSpan > 1 ? '' : labels[column] ?? '';
        const role = cell.colSpan > 1 ? ''
          : label === '#' ? 'hide'
            : column === lastColumn && cell.querySelector('button, a') ? 'actions'
              : column === titleColumn && body !== table.tFoot ? 'title' : '';
        if (cell.getAttribute('data-label') !== label) cell.setAttribute('data-label', label);
        if ((cell.getAttribute('data-card') ?? '') !== role) {
          if (role) cell.setAttribute('data-card', role);
          else cell.removeAttribute('data-card');
        }
        column += cell.colSpan;
      }
    }
  }
};

let scheduled = false;
const labelAll = () => {
  scheduled = false;
  document.querySelectorAll('table').forEach(labelTable);
};

new MutationObserver(() => {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(labelAll);
}).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
