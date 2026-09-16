import './main.js';

async function loadPeople() {
  const tableBody = document.getElementById('people-table-body');
  const filter = document.getElementById('people-filter');
  if (!tableBody || !filter) return;

  try {
    const response = await fetch('data/people.json');
    if (!response.ok) throw new Error(`Failed to load people: ${response.status}`);
    const people = await response.json();

    const roles = Array.from(new Set(people.map((person) => person.role))).sort();
    roles.forEach((role) => {
      const option = document.createElement('option');
      option.value = role;
      option.textContent = role;
      filter.appendChild(option);
    });

    const createCell = (label, value) => {
      const cell = document.createElement('td');
      cell.dataset.label = label;
      if (value instanceof Node) {
        cell.appendChild(value);
      } else {
        cell.textContent = value ?? '';
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

    const createWebsiteLink = (website) => {
      if (!website) return '';
      const link = document.createElement('a');
      link.href = website;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = website;
      return link;
    };

    const renderRows = () => {
      const selectedRole = filter.value;
      const fragment = document.createDocumentFragment();

      people
        .filter((person) => selectedRole === 'all' || person.role === selectedRole)
        .forEach((person) => {
          const row = document.createElement('tr');
          row.append(
            createCell('Name', person.name),
            createCell('Job Position', person.position),
            createCell('Email', createEmailLink(person.email)),
            createCell('Personal Website', createWebsiteLink(person.website))
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
