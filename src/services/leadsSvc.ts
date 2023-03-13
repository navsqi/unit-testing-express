import { getConnection } from 'typeorm';
import AssignmentInstansi from '~/orm/entities/AssignmentInstansi';
import { IPaging } from '~/utils/queryHelper';
import { dataSource } from '~/orm/dbCreateConnection';
import Leads from '~/orm/entities/Leads';
import { getRecursiveOutletQuery } from './konsolidasiSvc';

const findOrCreate = async (instansiId: number, paging: IPaging) => {
  const connection = getConnection();

  const assignedUser = await connection
    .createQueryBuilder()
    .select(['ai.id', 'user.nik', 'user.role', 'user.nama', 'assignor.nik', 'assignor.role', 'assignor.nama'])
    .from(AssignmentInstansi, 'ai')
    .leftJoin('ai.user', 'user')
    .leftJoin('ai.assignor', 'assignor')
    .where('ai.instansi_id = :instansiId', { instansiId })
    .take(paging.limit)
    .skip(paging.offset)
    .getManyAndCount();

  return assignedUser;
};

export interface ResponseListLeads {
  nama: string;
  nik_ktp: string;
  no_hp: string;
  is_ktp_valid: number;
  cif: string;
  status: number;
  is_karyawan: number;
  pic_selena: string;
  created_at: Date;
  approved_at: string;
  nik_mo: string;
  nama_produk: string;
  nama_event: string;
  nama_instansi: string;
  jenis_instansi: string;
  nama_master_instansi: string;
  nama_mo: string;
  cabang: string;
  area: string;
  kanwil: string;
  status_karyawan: string;
  status_leads: string;
  status_dukcapil: string;
}

export interface IFilterLeads {
  nama?: string;
  status?: string;
  kode_unit_kerja?: string;
  is_session?: number;
  is_badan_usaha?: number;
  instansi_id?: number;
  event_id?: number;
  pic_selena?: string;
  follow_up_pic_selena?: number;
  is_pusat?: boolean;
  nik_ktp?: string;
  start_date?: string;
  end_date?: string;
}

export const listLeadsV2 = async (paging: IPaging, filter?: IFilterLeads): Promise<[any[], number]> => {
  const leads = dataSource
    .createQueryBuilder(Leads, 'l')
    .select('l.nik_ktp', 'nik_ktp')
    .addSelect('l.kode_unit_kerja', 'kode_outlet')
    .addSelect('l.cif', 'cif')
    .addSelect('l.nama', 'nama')
    .addSelect('l.no_hp', 'no_hp')
    .addSelect('p.nama_produk', 'nama_produk')
    .addSelect('ev.nama_event', 'nama_event')
    .addSelect('l.is_karyawan', 'is_karyawan')
    .addSelect(
      `
      CASE 
        WHEN l.is_karyawan = 1 THEN 'KARYAWAN'
        ELSE 'BUKAN KARYAWAN'
      END
    `,
      'status_karyawan',
    )
    .addSelect(
      `
      CASE 
        WHEN l.is_badan_usaha = 1 THEN 'BADAN USAHA'
        ELSE 'PERORANGAN'
      END
    `,
      'jenis_nasabah',
    )
    .addSelect('mi.nama_instansi', 'nama_master_instansi')
    .addSelect('i.nama_instansi', 'nama_instansi')
    .addSelect('i.jenis_instansi', 'jenis_instansi')
    .addSelect('l.pic_selena', 'pic_selena')
    .addSelect('l.created_by', 'nik_mo')
    .addSelect('u.nama', 'nama_mo')
    .addSelect('outlet_p4.nama', 'cabang')
    .addSelect('outlet_p3.nama', 'area')
    .addSelect('outlet_p2.nama', 'kanwil')
    .addSelect('l.created_at', 'created_at')
    .addSelect('l.approved_at', 'approved_at')
    .addSelect(
      `
      CASE
        WHEN l.approved_at IS NOT NULL THEN l.updated_by
        ELSE NULL
      END
      `,
      'approved_by',
    )
    .addSelect('l.status', 'status')
    .addSelect(
      `
      CASE
        WHEN l.status = 0 THEN 'PENGAJUAN'
        WHEN l.status = 1 THEN 'DISETUJUI'
        WHEN l.status = 2 THEN 'DITOLAK'
        ELSE 'DIHAPUS'
      END
      `,
      'status_leads',
    )
    .addSelect('l.is_ktp_valid', 'is_ktp_valid')
    .addSelect(
      `
      CASE
        WHEN l.is_ktp_valid = 0 THEN 'TERVERIFIKASI'
        ELSE 'TIDAK TERVERIFIKASI'
      END
      `,
      'status_dukcapil',
    )
    .leftJoin('l.produk', 'p')
    .leftJoin('l.event', 'ev')
    .leftJoin('l.instansi', 'i')
    .leftJoin('i.master_instansi', 'mi')
    .leftJoin('l.user_created', 'u')
    .leftJoin('outlet', 'outlet_p4', 'outlet_p4.kode = l.kode_unit_kerja')
    .leftJoin('outlet', 'outlet_p3', 'outlet_p3.kode = outlet_p4.parent')
    .leftJoin('outlet', 'outlet_p2', 'outlet_p2.kode = outlet_p3.parent');

  leads.where('l.nama IS NOT NULL');

  if (filter.nama) {
    leads.andWhere('l.nama ~* :nama', { nama: filter.nama });
  }

  if (filter.instansi_id) {
    leads.andWhere('l.instansi_id = :instansi_id', { instansi_id: filter.instansi_id });
  }

  console.log(filter);
  if (filter.status) {
    leads.andWhere('l.status = :status', { status: filter.status });
  }

  if (filter.kode_unit_kerja && !filter.is_pusat) {
    leads.andWhere(`i.kode_unit_kerja IN (${getRecursiveOutletQuery(filter.kode_unit_kerja)})`);
  }

  if (filter.nik_ktp) {
    leads.andWhere(`l.nik_ktp ~* :nik_ktp`, { nik_ktp: filter.nik_ktp });
  }

  if (filter.is_badan_usaha) {
    leads.andWhere(`i.is_badan_usaha = :is_badan_usaha`, { is_badan_usaha: filter.is_badan_usaha });
  }

  if (filter.pic_selena) {
    leads.andWhere(`i.pic_selena ~* :pic_selena`, { pic_selena: filter.pic_selena });
  }

  if (filter.start_date && filter.end_date) {
    leads.andWhere(`CAST(l.created_at AS date) >= :start_date AND CAST(l.created_at AS date) <= :end_date`, {
      start_date: filter.start_date,
      end_date: filter.end_date,
    });
  }

  if (paging.limit && paging.offset) {
    leads.take(paging.limit).skip(paging.offset);
  }

  leads.orderBy('i.status', 'ASC').addOrderBy('i.created_at', 'DESC');
  leads.limit(paging.limit).skip(paging.offset);
  const count = await leads.getCount();
  const res = await leads.getRawMany<ResponseListLeads>();

  return [res, count];
};

const leadsSvc = {
  findOrCreate,
  listLeadsV2,
};

export default leadsSvc;
