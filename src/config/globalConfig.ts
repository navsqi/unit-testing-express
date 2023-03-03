const globalConfig = {
  leads: {
    status: {
      0: 'MENUNGGU PERSETUJUAN',
      1: 'DISETUJUI',
      2: 'DITOLAK',
      3: 'DIHAPUS',
    },
  },
  events: {
    limiter: {
      eventType: 'EVENTS',
      count: 10,
    },
  },
};

export default globalConfig;
