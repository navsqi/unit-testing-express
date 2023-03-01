Kamila DB:
ALTER TABLE public.leads_closing ADD nik_mo varchar(10) NULL;
ALTER TABLE public.leads_closing ADD nama_mo varchar(100) NULL;

CREATE TABLE public.event_history (
	id serial4 NOT NULL,
	nik_user varchar(10) NOT NULL,
	event_type varchar(50) NOT NULL,
	action_type varchar(50) NOT NULL,
	created_at timestamp NOT NULL DEFAULT now(),
	CONSTRAINT "PK_cdac290cc64352558c203d86f03" PRIMARY KEY (id)
);

CREATE TABLE public.leads_closing_osl (
	id serial4 NOT NULL,
	leads_id int4 NULL,
	nik_ktp varchar(16) NULL,
	cif varchar(11) NULL,
	no_kontrak varchar(40) NULL,
	marketing_code varchar(20) NULL,
	kode_unit_kerja varchar(10) NULL,
	kode_unit_kerja_pencairan varchar(10) NULL,
	outlet_syariah varchar(10) NULL,
	status_new_cif int2 NULL DEFAULT '0'::smallint,
	created_at timestamp(6) NOT NULL DEFAULT now(),
	osl float8 NULL,
	saldo_tabemas float8 NULL,
	channel varchar(100) NULL,
	kode_produk varchar(10) NULL,
	tgl_fpk date NULL,
	tgl_cif date NULL,
	tgl_kredit date NULL,
	updated_at timestamp(6) NOT NULL DEFAULT now(),
	channel_id varchar(100) NULL,
	nik_mo varchar(10) NULL,
	nama_mo varchar(100) NULL,
	CONSTRAINT "PK_c660eb13b43db3a6b6d1d111b4" PRIMARY KEY (id)
);
CREATE INDEX idx_leads_closing_osl_no_kontrak ON public.leads_closing USING btree (no_kontrak);
CREATE INDEX idx_leads_closong_osl_tgl_kredit ON public.leads_closing USING btree (tgl_kredit DESC);


-- public.leads_closing definition

-- Drop table

-- DROP TABLE public.leads_closing;

CREATE TABLE public.leads_closing_osl (
	id serial4 NOT NULL,
	leads_id int4 NULL,
	nik_ktp varchar(16) NULL,
	cif varchar(11) NULL,
	no_kontrak varchar(40) NULL,
	marketing_code varchar(20) NULL,
	kode_unit_kerja varchar(10) NULL,
	kode_unit_kerja_pencairan varchar(10) NULL,
	up float8 NULL,
	outlet_syariah varchar(10) NULL,
	status_new_cif int2 NULL DEFAULT '0'::smallint,
	created_at timestamp(6) NOT NULL DEFAULT now(),
	osl float8 NULL,
	saldo_tabemas float8 NULL,
	channel varchar(100) NULL,
	kode_produk varchar(10) NULL,
	tgl_fpk date NULL,
	tgl_cif date NULL,
	tgl_kredit date NULL,
	updated_at timestamp(6) NOT NULL DEFAULT now(),
	channel_id varchar(100) NULL,
	channeling_syariah varchar(10) NULL,
	nik_mo varchar(10) NULL,
	nama_mo varchar(100) NULL,
	CONSTRAINT "PK_c660eb13b43db3a6b6d1d111b83" PRIMARY KEY (id)
);
CREATE INDEX idx_osl_leads_closing_no_kontrak ON public.leads_closing USING btree (no_kontrak);
CREATE INDEX idx_osl_leads_closing_osl_no_kontrak ON public.leads_closing USING btree (no_kontrak);
CREATE INDEX idx_osl_leads_closong_osl_tgl_kredit ON public.leads_closing USING btree (tgl_kredit DESC);
CREATE INDEX idx_osl_leads_closong_tgl_kredit ON public.leads_closing USING btree (tgl_kredit DESC);