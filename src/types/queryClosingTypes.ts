export interface ITmpKreditQuery {
  leads_id?: number;
  product_code?: string;
  nik_ktp?: string;
  no_kontrak: string;
  marketing_code?: any;
  tgl_fpk: string;
  tgl_cif?: any;
  tgl_kredit: string;
  kode_outlet: string;
  kode_outlet_pencairan: string;
  up: number;
  outlet_syariah?: any;
  cif: string;
  channel_id?: any;
  nama_channel?: any;
  osl: number;
}

export interface ITmpKreditTabemasQuery {
  leads_id?: number;
  product_code?: string;
  nik_ktp?: string;
  no_kontrak?: string;
  marketing_code?: any;
  tgl_fpk?: string;
  tgl_kredit?: string;
  kode_outlet?: string;
  kode_outlet_pencairan?: string;
  omset_te?: number;
  amount?: number;
  cif?: string;
  channel_id?: string;
  nama_channel?: string;
  saldo?: number;
  jenis_transaksi?: 'OPEN' | 'SALE' | 'BUY' | 'PYMNTAIN' | 'ORDER';
}
