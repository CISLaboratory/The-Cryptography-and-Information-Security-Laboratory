import './main.js';

function getRoleCategory(person) {
  const role = String(person?.role ?? person?.position ?? '').toLowerCase();

  if (role.includes('professor') || role.includes('mentor')) {
    return { key: 'mentor', label: 'Mentor', rank: 0 };
  }
  if (role.includes('ph.d')) {
    return { key: 'phd', label: 'Ph.D. Students', rank: 1 };
  }
  if (role.includes('master')) {
    return { key: 'master', label: 'Master Students', rank: 2 };
  }
  return { key: 'other', label: 'Other', rank: 3 };
}

async function loadPeople() {
  const tableBody = document.getElementById('people-table-body');
  const filter = document.getElementById('people-filter');
  if (!tableBody || !filter) return;

  try {
    const response = await fetch('data/people.json');
    if (!response.ok) throw new Error(`Failed to load people: ${response.status}`);
    const people = await response.json();

    const categories = Array.from(
      new Map(
        people
          .map((person) => getRoleCategory(person))
          .sort((a, b) => a.rank - b.rank)
          .map((category) => [category.key, category])
      ).values()
    );

    categories.forEach((category) => {
      const option = document.createElement('option');
      option.value = category.key;
      option.textContent = category.label;
      filter.appendChild(option);
    });

    const createCell = (label, value) => {
      const cell = document.createElement('td');
      cell.dataset.label = label;
      if (value instanceof Node) {
        cell.appendChild(value);
      } else {
        cell.textContent = value || '—';
      }
      return cell;
    };

    const createEmailLink = (email) => {
      if (!email) return '—';
      const link = document.createElement('a');
      link.href = `mailto:${email}`;
      link.textContent = email;
      return link;
    };

    const createWebsiteLink = (website) => {
      if (!website) return '—';
      const link = document.createElement('a');
      link.href = website;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = website;
      return link;
    };

    const sortedPeople = [...people].sort(
      (a, b) => getRoleCategory(a).rank - getRoleCategory(b).rank
    );

    const renderRows = () => {
      const selectedRole = filter.value;
      const fragment = document.createDocumentFragment();

      sortedPeople
        .filter(
          (person) => selectedRole === 'all' || getRoleCategory(person).key === selectedRole
        )
        .forEach((person) => {
          const row = document.createElement('tr');
          row.append(
            createCell('Name', person.name),
            createCell('Position', person.position),
            createCell('Email', createEmailLink(person.email)),
            createCell('Website', createWebsiteLink(person.website))
          );
          fragment.appendChild(row);
        });

      tableBody.replaceChildren(fragment);
    };

    filter.addEventListener('change', renderRows);
    renderRows();
  } catch (error) {
    tableBody.innerHTML = '<tr><td colspan="4">Unable to load people data at this time.</td></tr>';
    console.error(error);
  }
}

loadPeople();
