// frontend/scripts/store.js
// Centralised in-memory state. All modules read/write through here.

export const store = {
  user:  null,   // { id, email, name }
  token: null,

  // schedule
  tasks:   [],
  archive: {},

  // notes
  topics:  [],

  // files
  fileCategories: ['General'],
  files: [],           // current category's metadata list
  activeFileCat: 'General',

  // session tracking
  session: null,       // { date, started_at, ended_at, events[] }

  // settings
  settings: {
    theme: 'dark',          // 'dark' | 'light' | 'system'
    accent: '#6ee7b7',
    fontSize: 'md',         // 'sm' | 'md' | 'lg'
    density: 'normal',      // 'compact' | 'normal' | 'relaxed'
    quickLinks: [],         // [{ label, url }]
    modules: {
      schedule: true,
      notes:    true,
      timer:    true,
      files:    true,
    },
  },

  // per-topic notes (lazy loaded)
  notesByTopic: {},  // { topicName: [{ id, title, body, updated }] }
};
