export default {
  setRole: (kode_role?: string, nama_role?: string) => {
    const namaRole = nama_role ? nama_role.toUpperCase() : null;
    const kodeRole = kode_role ? kode_role.toUpperCase() : null;

    if (kodeRole && kodeRole.includes('PNC')) {
      return 'PNCA';
    }

    if (kodeRole && (kodeRole.includes('MAX') || kodeRole.includes('MSP'))) {
      return 'MKTO';
    }

    if (kodeRole && kodeRole.includes('ADM')) {
      return 'ADMN';
    }

    return kodeRole;
  },
  setOutlet: (kode_outlet: string) => {
    const kodeOutlet = kode_outlet;

    if (kodeOutlet && kodeOutlet.startsWith('000')) {
      return '00002';
    }

    return kodeOutlet;
  },
};
