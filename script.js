document.addEventListener('DOMContentLoaded', () => {
  // --- Header Scroll Effect ---
  const header = document.getElementById('main-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // --- Mobile Navigation Menu ---
  const mobileToggle = document.getElementById('btn-mobile-toggle');
  const navLinksList = document.getElementById('menu-links');
  
  if (mobileToggle && navLinksList) {
    mobileToggle.addEventListener('click', () => {
      mobileToggle.classList.toggle('active');
      navLinksList.classList.toggle('active');
    });

    document.querySelectorAll('.nav-link-item').forEach(link => {
      link.addEventListener('click', () => {
        mobileToggle.classList.remove('active');
        navLinksList.classList.remove('active');
      });
    });
  }

  // --- Active Nav Link Scrolling Tracking ---
  const sections = document.querySelectorAll('section');
  const navItems = document.querySelectorAll('.nav-link-item');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      if (window.scrollY >= (sectionTop - 150)) {
        current = section.getAttribute('id');
      }
    });

    navItems.forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('href').slice(1) === current) {
        item.classList.add('active');
      }
    });
  });

  // --- Ambient Glow Cursor Tracking ---
  const ambientBg = document.getElementById('ambient-grid');
  if (ambientBg) {
    document.addEventListener('mousemove', (e) => {
      const x = ((e.clientX / window.innerWidth) * 100).toFixed(2);
      const y = ((e.clientY / window.innerHeight) * 100).toFixed(2);
      document.documentElement.style.setProperty('--glow-x', `${x}%`);
      document.documentElement.style.setProperty('--glow-y', `${y}%`);
    });
  }

  // --- Database / State Setup ---
  let items = [];
  let watchers = [];
  let pings = [];

  const defaultItems = [
    {
      id: 'item_1',
      name: 'AirPods Pro',
      category: 'electronics',
      tags: ['#airpods', '#apple'],
      location: 'Computer Science Lab',
      storage: 'Main Staff Office, Drawer B',
      reporter: 'Sarah (Staff)',
      secret: '1234',
      desc: 'White AirPods Pro inside a black silicone case. One side has a small sticker residue.',
      status: 'active',
      date: '2026-07-18T14:30:00Z'
    },
    {
      id: 'item_2',
      name: 'Yellow HydroFlask',
      category: 'accessories',
      tags: ['#waterbottle', '#hydroflask'],
      location: 'Dining Hall Lobby',
      storage: 'Dining Kitchen Reception Desk',
      reporter: 'David (Shad)',
      secret: 'david123',
      desc: '32oz wide-mouth HydroFlask. Covered in various laptop stickers including GitHub and Shad logos.',
      status: 'active',
      date: '2026-07-19T09:15:00Z'
    },
    {
      id: 'item_3',
      name: 'Grey Champion Hoodie',
      category: 'clothing',
      tags: ['#hoodie', '#grey', '#champion'],
      location: 'Recreation Gym Bleachers',
      storage: 'Gym Supervisor Office Lobby bin',
      reporter: 'Emma (PA)',
      secret: 'gympass',
      desc: 'Size Medium, slightly faded grey. Left sleeve has a small white paint spot.',
      status: 'active',
      date: '2026-07-17T17:45:00Z'
    }
  ];

  const defaultWatchers = [
    { id: 'watch_1', name: 'Alex', contact: 'Room 302', tag: '#airpods' },
    { id: 'watch_2', name: 'Chloe', contact: 'Room 114', tag: '#keys' }
  ];

  const defaultPings = [
    { time: '13:57:02', type: 'system', text: 'Telemetry Monitor initialized. Listening for tags...' },
    { time: '13:58:15', type: 'match', text: 'Ping Correlation: Watcher Alex (#airpods) matches reported AirPods Pro!' }
  ];

  // Load and save functions
  function loadState() {
    const savedItems = localStorage.getItem('shad_lf_items');
    const savedWatchers = localStorage.getItem('shad_lf_watchers');
    const savedPings = localStorage.getItem('shad_lf_pings');

    if (savedItems) items = JSON.parse(savedItems);
    else {
      items = defaultItems;
      localStorage.setItem('shad_lf_items', JSON.stringify(items));
    }

    if (savedWatchers) watchers = JSON.parse(savedWatchers);
    else {
      watchers = defaultWatchers;
      localStorage.setItem('shad_lf_watchers', JSON.stringify(watchers));
    }

    if (savedPings) pings = JSON.parse(savedPings);
    else {
      pings = defaultPings;
      localStorage.setItem('shad_lf_pings', JSON.stringify(pings));
    }
  }

  function saveState() {
    localStorage.setItem('shad_lf_items', JSON.stringify(items));
    localStorage.setItem('shad_lf_watchers', JSON.stringify(watchers));
    localStorage.setItem('shad_lf_pings', JSON.stringify(pings));
  }

  // --- Rendering Functions ---
  const itemsContainer = document.getElementById('items-grid-container');
  const watchersContainer = document.getElementById('watcher-tags-list');
  const pingLogsContainer = document.getElementById('ping-logs');

  const cntActive = document.getElementById('cnt-active');
  const cntResolved = document.getElementById('cnt-resolved');
  const cntWatchers = document.getElementById('cnt-watchers');

  function updateStats() {
    const activeCount = items.filter(i => i.status === 'active').length;
    const resolvedCount = items.filter(i => i.status === 'resolved').length;
    
    if (cntActive) cntActive.textContent = activeCount;
    if (cntResolved) cntResolved.textContent = resolvedCount;
    if (cntWatchers) cntWatchers.textContent = watchers.length;
  }

  function formatTime(dateObj) {
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const seconds = String(dateObj.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  function addPingLog(type, text) {
    const timeStr = formatTime(new Date());
    pings.push({ time: timeStr, type, text });
    saveState();
    renderPings();
  }

  function renderPings() {
    if (!pingLogsContainer) return;
    pingLogsContainer.innerHTML = '';
    
    pings.forEach(log => {
      const line = document.createElement('div');
      line.className = 'terminal-line';
      
      let prefix = '';
      if (log.type === 'system') {
        prefix = `<span class="blue">[SYSTEM]</span> `;
      } else if (log.type === 'match') {
        prefix = `<span class="success">[PING MATCH]</span> `;
      } else if (log.type === 'archive') {
        prefix = `<span class="accent">[CLAIMED]</span> `;
      }
      
      line.innerHTML = `[${log.time}] ${prefix}${log.text}`;
      pingLogsContainer.appendChild(line);
    });
    
    // Scroll to bottom of terminal
    pingLogsContainer.scrollTop = pingLogsContainer.scrollHeight;
  }

  function showToast(watcherName, itemName, tag) {
    const toastCenter = document.getElementById('toast-alerts-center');
    if (!toastCenter) return;

    const toast = document.createElement('div');
    toast.className = 'toast-notification success';
    
    toast.innerHTML = `
      <div class="toast-title">
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" style="color: #10b981;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        Lost Match Found!
      </div>
      <div class="toast-desc">
        Watcher <strong>${watcherName}</strong> matched with <strong>${itemName}</strong> (${tag})!
      </div>
    `;

    toastCenter.appendChild(toast);

    // Auto remove after 5s
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 5000);
  }

  function getCategorySVG(category) {
    switch (category) {
      case 'electronics':
        return `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="1.5" fill="none"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>`;
      case 'clothing':
        return `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="1.5" fill="none"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>`;
      case 'accessories':
        return `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="1.5" fill="none"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;
      default:
        return `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="1.5" fill="none"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
    }
  }

  function renderFoundItems(filterValue = 'all') {
    if (!itemsContainer) return;
    itemsContainer.innerHTML = '';

    const filtered = items.filter(item => {
      return filterValue === 'all' || item.category === filterValue;
    });

    if (filtered.length === 0) {
      itemsContainer.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-dark);">
          <h3>No reported items found.</h3>
          <p>Check back later or register an alert watcher.</p>
        </div>
      `;
      return;
    }

    // Sort items so active found items appear first
    filtered.sort((a, b) => {
      if (a.status === 'active' && b.status === 'resolved') return -1;
      if (a.status === 'resolved' && b.status === 'active') return 1;
      return new Date(b.date) - new Date(a.date);
    });

    filtered.forEach(item => {
      const card = document.createElement('div');
      card.className = 'project-card glass-panel';
      card.setAttribute('data-category', item.category);
      card.id = `item-card-${item.id}`;

      const tagSpans = item.tags.map(t => `<span class="project-tag">${t}</span>`).join('');
      const isClaimed = item.status === 'resolved';

      const statusBadge = isClaimed 
        ? `<span class="status-badge resolved-status">Claimed</span>`
        : `<span class="status-badge active-status">Active Found</span>`;

      const resolveBtn = isClaimed
        ? `<button class="btn btn-secondary" disabled style="opacity: 0.5; width: 100%; justify-content: center;">Archived &amp; Returned</button>`
        : `<button class="btn btn-primary resolve-trigger-btn" data-id="${item.id}" data-name="${item.name}" style="width: 100%; justify-content: center;">Resolve &amp; Return</button>`;

      card.innerHTML = `
        ${statusBadge}
        <div class="project-img">
          ${getCategorySVG(item.category)}
        </div>
        <div class="project-body">
          <h3>${item.name}</h3>
          <p>${item.desc}</p>
          
          <div class="item-details-list">
            <div class="item-detail-row">
              <strong>Found:</strong>
              <span>${item.location}</span>
            </div>
            <div class="item-detail-row">
              <strong>Storage Room:</strong>
              <span>${item.storage}</span>
            </div>
            <div class="item-detail-row">
              <strong>Finder:</strong>
              <span>${item.reporter}</span>
            </div>
          </div>

          <div class="project-tags">
            ${tagSpans}
          </div>

          <div class="project-links" style="border: none; padding: 0;">
            ${resolveBtn}
          </div>
        </div>
      `;

      itemsContainer.appendChild(card);
    });

    // Attach click listeners to Resolve triggers
    document.querySelectorAll('.resolve-trigger-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        const name = e.target.getAttribute('data-name');
        openResolveModal(id, name);
      });
    });
  }

  function renderWatchers() {
    if (!watchersContainer) return;
    watchersContainer.innerHTML = '';

    if (watchers.length === 0) {
      watchersContainer.innerHTML = `<span class="no-watchers-msg" style="font-size: 0.9rem; color: var(--text-dark);">No active watchers currently listening.</span>`;
      return;
    }

    watchers.forEach(w => {
      const badge = document.createElement('span');
      badge.className = 'watcher-badge';
      badge.id = `watcher-${w.id}`;
      badge.innerHTML = `
        <strong>${w.name}</strong> is looking for: <span>${w.tag}</span> (${w.contact})
        <button class="remove-watcher-btn" data-id="${w.id}" aria-label="Remove alert hook">&times;</button>
      `;
      watchersContainer.appendChild(badge);
    });

    // Attach delete listeners
    document.querySelectorAll('.remove-watcher-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        removeWatcher(id);
      });
    });
  }

  function removeWatcher(id) {
    const watcher = watchers.find(w => w.id === id);
    if (!watcher) return;
    watchers = watchers.filter(w => w.id !== id);
    saveState();
    renderWatchers();
    updateStats();
    addPingLog('system', `Watcher alert hook removed for ${watcher.name} (${watcher.tag}).`);
  }

  // --- Initial Loading ---
  loadState();
  updateStats();
  renderFoundItems();
  renderWatchers();
  renderPings();

  // --- Modal Logic ---
  const reportModal = document.getElementById('report-modal');
  const resolveModal = document.getElementById('resolve-modal');
  
  const triggerReportBtn = document.getElementById('btn-trigger-report');
  const closeReportBtn = document.getElementById('btn-close-report');
  const closeResolveBtn = document.getElementById('btn-close-resolve');

  function openModal(modal) {
    modal.classList.add('active');
  }

  function closeModal(modal) {
    modal.classList.remove('active');
  }

  if (triggerReportBtn && reportModal) {
    triggerReportBtn.addEventListener('click', () => openModal(reportModal));
  }

  if (closeReportBtn && reportModal) {
    closeReportBtn.addEventListener('click', () => closeModal(reportModal));
  }

  if (closeResolveBtn && resolveModal) {
    closeResolveBtn.addEventListener('click', () => {
      closeModal(resolveModal);
      const errLbl = document.getElementById('lbl-resolve-error');
      if (errLbl) errLbl.style.display = 'none';
    });
  }

  // Close modals when clicking overlay
  window.addEventListener('click', (e) => {
    if (e.target === reportModal) closeModal(reportModal);
    if (e.target === resolveModal) {
      closeModal(resolveModal);
      const errLbl = document.getElementById('lbl-resolve-error');
      if (errLbl) errLbl.style.display = 'none';
    }
  });

  function openResolveModal(id, name) {
    const inputId = document.getElementById('ipt-resolve-item-id');
    const labelName = document.getElementById('lbl-resolve-item-name');
    const inputKey = document.getElementById('ipt-resolve-key');
    const errLbl = document.getElementById('lbl-resolve-error');

    if (inputId) inputId.value = id;
    if (labelName) labelName.textContent = name;
    if (inputKey) inputKey.value = '';
    if (errLbl) errLbl.style.display = 'none';

    if (resolveModal) openModal(resolveModal);
  }

  // --- Report Found Item Submission ---
  const reportForm = document.getElementById('frm-report-found');
  if (reportForm) {
    reportForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('ipt-item-name').value.trim();
      const category = document.getElementById('sel-item-category').value;
      const rawTags = document.getElementById('ipt-item-tags').value.trim();
      const location = document.getElementById('ipt-item-location').value.trim();
      const storage = document.getElementById('ipt-item-storage').value.trim();
      const reporter = document.getElementById('ipt-item-reporter').value.trim();
      const secret = document.getElementById('ipt-item-secret').value.trim();
      const desc = document.getElementById('ipt-item-desc').value.trim();

      // Format tags array (ensure # prefix, lowercase)
      const tagsArray = rawTags.split(/\s+/).map(t => {
        let tag = t.trim().toLowerCase();
        if (tag && !tag.startsWith('#')) {
          tag = '#' + tag;
        }
        return tag;
      }).filter(tag => tag.length > 1);

      const newItem = {
        id: 'item_' + Date.now(),
        name,
        category,
        tags: tagsArray,
        location,
        storage,
        reporter,
        secret,
        desc,
        status: 'active',
        date: new Date().toISOString()
      };

      // Add to state and save
      items.push(newItem);
      saveState();

      // Trigger re-render of galleries & stats
      renderFoundItems(document.querySelector('.filter-btn.active').getAttribute('data-filter'));
      updateStats();

      // Reset and close modal
      reportForm.reset();
      closeModal(reportModal);

      // Log report in console
      addPingLog('system', `New item listing registered: ${newItem.name} by finder ${newItem.reporter}.`);

      // Check Watcher correlations
      watchers.forEach(w => {
        const matchTag = w.tag.toLowerCase();
        if (newItem.tags.includes(matchTag)) {
          // Trigger match alerts!
          setTimeout(() => {
            showToast(w.name, newItem.name, w.tag);
            addPingLog('match', `Correlation found! Watcher ${w.name} (${w.tag}) matched with newly reported ${newItem.name}!`);
          }, 600);
        }
      });
    });
  }

  // --- Watcher Submission ---
  const watcherForm = document.getElementById('frm-register-watcher');
  if (watcherForm) {
    watcherForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('ipt-watcher-name').value.trim();
      const contact = document.getElementById('ipt-watcher-contact').value.trim();
      let tag = document.getElementById('ipt-watcher-tag').value.trim().toLowerCase();

      if (!tag.startsWith('#')) {
        tag = '#' + tag;
      }

      const newWatcher = {
        id: 'watch_' + Date.now(),
        name,
        contact,
        tag
      };

      watchers.push(newWatcher);
      saveState();
      renderWatchers();
      updateStats();

      watcherForm.reset();

      addPingLog('system', `Watcher alert hook set: ${newWatcher.name} listening for ${newWatcher.tag}.`);

      // Check current active items for matches immediately
      items.forEach(item => {
        if (item.status === 'active' && item.tags.includes(tag)) {
          setTimeout(() => {
            showToast(newWatcher.name, item.name, newWatcher.tag);
            addPingLog('match', `Instant match: Watcher ${newWatcher.name} matched with active listing ${item.name}!`);
          }, 400);
        }
      });
    });
  }

  // --- Secure Claim Resolution Confirmation ---
  const resolveForm = document.getElementById('frm-resolve-claim');
  if (resolveForm) {
    resolveForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const itemId = document.getElementById('ipt-resolve-item-id').value;
      const keyInput = document.getElementById('ipt-resolve-key').value.trim();
      const errLbl = document.getElementById('lbl-resolve-error');

      const item = items.find(i => i.id === itemId);

      if (!item) {
        closeModal(resolveModal);
        return;
      }

      // Password comparison check
      if (item.secret === keyInput) {
        // Correct key! Mark resolved
        item.status = 'resolved';
        saveState();

        // Close and update
        errLbl.style.display = 'none';
        closeModal(resolveModal);
        
        renderFoundItems(document.querySelector('.filter-btn.active').getAttribute('data-filter'));
        updateStats();

        // Log archive action in console
        addPingLog('archive', `Item claimed: "${item.name}" returned. Listing archived successfully.`);
      } else {
        // Wrong key! Display error message
        errLbl.style.display = 'block';
      }
    });
  }

  // --- Category Filter Button Binding ---
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.getAttribute('data-filter');
      renderFoundItems(filterVal);
    });
  });
});
