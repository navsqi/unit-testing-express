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

    return kodeRole;
  },
};
