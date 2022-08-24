export default {
  setRole: (kode_role?: string, nama_role?: string) => {
    const namaRole = nama_role ? nama_role.toUpperCase() : null;
    const kodeRole = kode_role ? kode_role.toUpperCase() : null;

    if (kodeRole && kodeRole.includes('PNC')) {
      return 'PNCA';
    }

    if (kodeRole && kodeRole.includes('MAX')) {
      return 'MKTO';
    }

    if (kodeRole && kodeRole.includes('ADM')) {
      return 'ADMN';
    }

    if (kodeRole && kodeRole.includes('MSP')) {
      return 'MSPG';
    }

    if (kodeRole && kodeRole.includes('DPT')) {
      return 'DPTA';
    }

    if (kodeRole && kodeRole.includes('KAB')) {
      return 'KABG';
    }

    if (kodeRole && kodeRole.includes('PNW')) {
      return 'PNWA';
    }

    if (kodeRole && kodeRole.includes('PNT')) {
      return 'PNTA';
    }

    if (kodeRole && kodeRole.includes('KAD')) {
      return 'KADP';
    }

    if (kodeRole && kodeRole.includes('KDI')) {
      return 'KDIV';
    }

    if (kodeRole && kodeRole.includes('PF')) {
      return 'ADMN';
    }

    return null;
  },
  setOutlet: (kode_outlet: string) => {
    const kodeOutlet = kode_outlet;

    if (kodeOutlet && kodeOutlet.startsWith('000')) {
      return '00002';
    }

    return kodeOutlet;
  },
};
