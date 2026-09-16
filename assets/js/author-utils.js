export function getCurrentStudentNames(people) {
  return new Set(
    (Array.isArray(people) ? people : [])
      .filter((person) => {
        const role = String(person?.role ?? person?.position ?? '').toLowerCase();
        return role.includes('student');
      })
      .map((person) => person?.name)
      .filter(Boolean)
  );
}

export function appendAuthors(container, authors, currentStudentNames) {
  if (!container) return;

  if (typeof authors === 'string') {
    container.textContent = authors;
    return;
  }

  if (!Array.isArray(authors)) return;

  authors.forEach((author, index) => {
    if (index > 0) container.append(', ');

    const name = typeof author === 'string' ? author : author?.name ?? '';
    const element = document.createElement(currentStudentNames.has(name) ? 'strong' : 'span');
    element.textContent = name;
    container.appendChild(element);
  });
}
