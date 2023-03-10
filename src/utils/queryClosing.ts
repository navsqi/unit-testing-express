// AND (tmpk.kode_outlet = l.kode_unit_kerja OR tmpk.kode_cabang = l.kode_unit_kerja)
// kode outlet => upc, kode_cabang AS kode_outlet_pencairan => cp
// channel_syariah => cps
export const selectTmpKredit = `
SELECT
	l.id AS leads_id,
	tmpk.product_code,
	l.nik_ktp,
	tmpk.no_kontrak,
	tmpk.marketing_code,
	tmpk.tgl_fpk,
	cast(tmpk.tgl_cif as varchar) tgl_cif,
	tmpk.tgl_kredit,
	tmpk.kode_outlet,
	tmpk.kode_cabang AS kode_outlet_pencairan,
	tmpk.up,
	tmpk.outlet_syariah,
	tmpk.cif,
	tmpk.channel_id,
	tmpk.nama_channel,
	tmpk.osl,
	tmpk.channeling_syariah,
	l.kode_unit_kerja AS cabang_leads
FROM
	(
	SELECT
		*
	FROM
		tmp_kredit) tmpk,
	leads l
WHERE
	(md5(l.nik_ktp) = tmpk.nik_ktp OR l.cif = tmpk.cif)
   AND l.status = 1 
	AND CAST (l.created_at AS DATE) <= CAST ( tmpk.tgl_fpk AS DATE )
	AND tmpk.tgl_kredit IS NOT NULL
	AND (tmpk.no_kontrak IS NOT NULL OR tmpk.no_kontrak <> '')
	AND tmpk.up IS NOT NULL
`;

// AND (tmpk.kode_outlet = l.kode_unit_kerja OR tmpk.kode_cabang = l.kode_unit_kerja)
// kode outlet => upc, kode_cabang => cp
// channel_syariah => cps
export const selectTmpKreditTabemas = `
SELECT
	l.id AS leads_id,
	tmpk.product_code,
	l.nik_ktp,
	tmpk.no_rek AS no_kontrak,
	tmpk.marketing_code,
	tmpk.tgl_transaksi AS tgl_fpk,
	tmpk.tgl_transaksi AS tgl_kredit,
	tmpk.kode_outlet,
	tmpk.kode_cabang AS kode_outlet_pencairan,
	tmpk.omset_te,
	tmpk.amount,
	tmpk.cif,
	cast(tmpk.tgl_cif as varchar) tgl_cif,
	tmpk.channel_id,
	tmpk.nama_channel,
	tmpk.saldo,
	tmpk.jenis_transaksi,
	tmpk.channeling_syariah,
	l.kode_unit_kerja AS cabang_leads
FROM
	(
	SELECT
		*
	FROM
		tmp_kredit_tabemas) tmpk,
	leads l
WHERE
	(md5(l.nik_ktp) = tmpk.nik_ktp OR l.cif = tmpk.cif)
	AND l.status = 1
	AND tmpk.tgl_transaksi IS NOT NULL
	AND (tmpk.no_rek IS NOT NULL OR tmpk.no_rek <> '')
	AND CAST (l.created_at AS DATE) <= CAST ( tmpk.tgl_transaksi AS DATE )
	AND tmpk.jenis_transaksi IN ('SALE', 'OPEN')
	AND tmpk.omset_te IS NOT NULL
`;

export default {
  selectTmpKredit,
  selectTmpKreditTabemas,
};
