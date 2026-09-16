export function getCurrentMemberNames(people) {
  return new Set(
    (Array.isArray(people) ? people : [])
      .map((person) => person?.name)
      .filter(Boolean)
  );
}

export function appendAuthors(container, authors, currentMemberNames) {
  if (!container) return;

  if (typeof authors === 'string') {
    container.textContent = authors;
    return;
  }

  if (!Array.isArray(authors)) return;

  authors.forEach((author, index) => {
    if (index > 0) container.append(', ');

    const name = typeof author === 'string' ? author : author?.name ?? '';
    const isCurrentMember = currentMemberNames.has(name);
    const element = document.createElement(isCurrentMember ? 'strong' : 'span');
    element.textContent = name;

    if (typeof author === 'object' && author?.correspondingAuthor) {
      const marker = document.createElement('sup');
      marker.className = 'corresponding-author-marker';
      marker.title = 'Corresponding author';
      marker.setAttribute('aria-label', ' corresponding author');
      marker.textContent = '*';
      element.appendChild(marker);
    }

    container.appendChild(element);
  });
}
