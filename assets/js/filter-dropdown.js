function getLabelForSelect(select) {
  if (!select.id) return null;
  return document.querySelector(`label[for="${CSS.escape(select.id)}"]`);
}

export function enhanceFilterSelect(select) {
  if (!select || select.dataset.customDropdown === 'true') return null;

  const label = getLabelForSelect(select);
  const root = document.createElement('div');
  root.className = 'filter-dropdown';
  root.dataset.filterFor = select.id;
  root.dataset.open = 'false';

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'filter-dropdown__trigger';
  trigger.setAttribute('role', 'combobox');
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');

  const value = document.createElement('span');
  value.className = 'filter-dropdown__value';

  const chevron = document.createElement('span');
  chevron.className = 'filter-dropdown__chevron';
  chevron.setAttribute('aria-hidden', 'true');

  trigger.append(value, chevron);

  const menu = document.createElement('div');
  menu.className = 'filter-dropdown__menu';
  menu.setAttribute('role', 'listbox');
  menu.hidden = true;

  const baseId = select.id || `filter-${Math.random().toString(36).slice(2)}`;
  trigger.id = `${baseId}-trigger`;
  menu.id = `${baseId}-listbox`;
  trigger.setAttribute('aria-controls', menu.id);

  if (label) {
    label.htmlFor = trigger.id;
  }

  root.append(trigger, menu);
  select.insertAdjacentElement('afterend', root);
  select.classList.add('native-filter-select');
  select.dataset.customDropdown = 'true';
  select.tabIndex = -1;
  select.setAttribute('aria-hidden', 'true');

  let optionNodes = [];

  const focusOption = (index) => {
    if (!optionNodes.length) return;
    const normalized = (index + optionNodes.length) % optionNodes.length;
    optionNodes.forEach((node) => node.dataset.active = 'false');
    const target = optionNodes[normalized];
    target.dataset.active = 'true';
    target.focus();
  };

  const setOpen = (isOpen, { focusSelected = false } = {}) => {
    root.dataset.open = String(isOpen);
    trigger.setAttribute('aria-expanded', String(isOpen));
    menu.hidden = !isOpen;

    if (isOpen && focusSelected) {
      const selectedIndex = Math.max(0, select.selectedIndex);
      requestAnimationFrame(() => focusOption(selectedIndex));
    }
  };

  const restoreTriggerFocus = () => {
    requestAnimationFrame(() => trigger.focus({ preventScroll: true }));
  };

  const syncSelectedState = () => {
    const selectedOption = select.options[select.selectedIndex] ?? select.options[0];
    value.textContent = selectedOption?.textContent ?? '';

    optionNodes.forEach((node, index) => {
      const selected = index === select.selectedIndex;
      node.setAttribute('aria-selected', String(selected));
      if (selected) node.dataset.active = 'true';
      else if (node !== document.activeElement) node.dataset.active = 'false';
    });
  };

  const selectIndex = (index) => {
    const option = select.options[index];
    if (!option) return;
    select.value = option.value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    syncSelectedState();
    setOpen(false);
    restoreTriggerFocus();
  };

  const renderOptions = () => {
    menu.replaceChildren();
    optionNodes = Array.from(select.options).map((option, index) => {
      const node = document.createElement('div');
      node.className = 'filter-dropdown__option';
      node.id = `${baseId}-option-${index}`;
      node.setAttribute('role', 'option');
      node.tabIndex = -1;
      node.dataset.value = option.value;
      node.dataset.active = 'false';

      const optionLabel = document.createElement('span');
      optionLabel.className = 'filter-dropdown__option-label';
      optionLabel.textContent = option.textContent;

      const check = document.createElement('span');
      check.className = 'filter-dropdown__check';
      check.setAttribute('aria-hidden', 'true');
      check.textContent = '✓';

      node.append(optionLabel, check);

      node.addEventListener('pointermove', () => {
        optionNodes.forEach((item) => item.dataset.active = 'false');
        node.dataset.active = 'true';
      });

      node.addEventListener('click', () => selectIndex(index));

      node.addEventListener('keydown', (event) => {
        const currentIndex = optionNodes.indexOf(node);
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          focusOption(currentIndex + 1);
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          focusOption(currentIndex - 1);
        } else if (event.key === 'Home') {
          event.preventDefault();
          focusOption(0);
        } else if (event.key === 'End') {
          event.preventDefault();
          focusOption(optionNodes.length - 1);
        } else if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          selectIndex(currentIndex);
        } else if (event.key === 'Escape') {
          event.preventDefault();
          setOpen(false);
          restoreTriggerFocus();
        } else if (event.key === 'Tab') {
          setOpen(false);
        }
      });

      menu.appendChild(node);
      return node;
    });

    syncSelectedState();
  };

  trigger.addEventListener('click', () => {
    const nextOpen = root.dataset.open !== 'true';
    setOpen(nextOpen, { focusSelected: nextOpen });
  });

  trigger.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true, { focusSelected: true });
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const nextOpen = root.dataset.open !== 'true';
      setOpen(nextOpen, { focusSelected: nextOpen });
    } else if (event.key === 'Escape' && root.dataset.open === 'true') {
      event.preventDefault();
      setOpen(false);
    }
  });

  document.addEventListener('pointerdown', (event) => {
    if (root.dataset.open !== 'true') return;
    if (root.contains(event.target)) return;
    setOpen(false);
  });

  select.addEventListener('change', syncSelectedState);

  renderOptions();
  return { root, trigger, menu, refresh: renderOptions };
}
