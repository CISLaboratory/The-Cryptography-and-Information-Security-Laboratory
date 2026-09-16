import './main.js';
import { ensureResultsSummary } from './polish.js';

function getRoleCategory(person) {
  const role = String(person?.role ?? person?.position ?? '').toLowerCase();

  if (role.includes('professor') || role.includes('mentor')) {
    return { key: 'mentor', label: 'Mentor', rank: 0 };
  }
  if (role.includes('ph.d')) {
    return { key: 'phd', label: 'Ph.D. Students', rank: 1 };
  }
  if (role.includes('master')) {
    return { key: 'master', label: "Master's Students", rank: 2 };
  }
  return { key: 'other', label: 'Other', rank: 3 };
}

async function loadPeople() {
  const tableBody = document.getElementById('people-table-body');
  const filter = document.getElementById('people-filter');
  if (!tableBody || !filter) return;

  const summary = ensureResultsSummary(filter.closest('.table-controls'), 'people-summary');

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
    const categoriesByKey = new Map(categories.map((category) => [category.key, category]));

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
        if (!value) cell.classList.add('muted-placeholder');
      }
      return cell;
    };

    const createEmailLink = (email) => {
      if (!email) return '';
      const link = document.createElement('a');
      link.href = `mailto:${email}`;
      link.textContent = email;
      return link;
    };

    const createWebsiteLink = (person) => {
      if (!person.website) return '';
      const link = document.createElement('a');
      link.href = person.website;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.className = 'website-link';
      link.textContent = 'Website ↗';
      link.setAttribute('aria-label', `Open ${person.name} website in a new tab`);
      return link;
    };

    const sortedPeople = [...people].sort((a, b) => {
      const rankDiff = getRoleCategory(a).rank - getRoleCategory(b).rank;
      if (rankDiff !== 0) return rankDiff;
      return String(a.name ?? '').localeCompare(String(b.name ?? ''));
    });

    const createGroupRow = (category, count) => {
      const row = document.createElement('tr');
      row.className = 'people-group-row';

      const cell = document.createElement('td');
      cell.colSpan = 4;
      cell.textContent = category.label;

      const countText = document.createElement('span');
      countText.className = 'people-group-row__count';
      countText.textContent = `${count} ${count === 1 ? 'member' : 'members'}`;
      cell.appendChild(countText);

      row.appendChild(cell);
      return row;
    };

    const renderRows = () => {
      const selectedRole = filter.value;
      const filteredPeople = sortedPeople.filter(
        (person) => selectedRole === 'all' || getRoleCategory(person).key === selectedRole
      );

      if (summary) {
        const categoryLabel = categoriesByKey.get(selectedRole)?.label;
        summary.textContent = selectedRole === 'all'
          ? `Showing ${filteredPeople.length} current members.`
          : `Showing ${filteredPeople.length} ${categoryLabel ?? 'members'}.`;
      }

      const fragment = document.createDocumentFragment();
      const grouped = new Map();

      filteredPeople.forEach((person) => {
        const category = getRoleCategory(person);
        if (!grouped.has(category.key)) grouped.set(category.key, []);
        grouped.get(category.key).push(person);
      });

      categories.forEach((category) => {
        const group = grouped.get(category.key);
        if (!group?.length) return;

        fragment.appendChild(createGroupRow(category, group.length));

        group.forEach((person) => {
          const row = document.createElement('tr');
          row.append(
            createCell('Name', person.name),
            createCell('Position', person.position),
            createCell('Email', createEmailLink(person.email)),
            createCell('Website', createWebsiteLink(person))
          );
          fragment.appendChild(row);
        });
      });

      tableBody.replaceChildren(fragment);
    };

    filter.addEventListener('change', renderRows);
    renderRows();
  } catch (error) {
    tableBody.innerHTML = '<tr><td colspan="4">Unable to load people data at this time.</td></tr>';
    if (summary) summary.textContent = '';
    console.error(error);
  }
}

loadPeople();
