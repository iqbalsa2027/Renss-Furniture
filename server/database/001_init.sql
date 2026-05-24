CREATE TABLE IF NOT EXISTS user_admin (
  id_admin INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  kata_sandi_hash TEXT NOT NULL,
  nama_lengkap TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS kategori (
  id_kategori INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nama TEXT NOT NULL UNIQUE,
  deskripsi TEXT,
  urutan INTEGER NOT NULL DEFAULT 0,
  aktif BOOLEAN NOT NULL DEFAULT TRUE,
  dibuat_oleh INTEGER REFERENCES user_admin(id_admin) ON DELETE SET NULL,
  diubah_oleh INTEGER REFERENCES user_admin(id_admin) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS produk (
  id_produk INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_kategori INTEGER REFERENCES kategori(id_kategori) ON DELETE SET NULL,
  nama TEXT NOT NULL UNIQUE,
  deskripsi TEXT,
  harga NUMERIC(12, 2) NOT NULL DEFAULT 0,
  kode_mata_uang TEXT NOT NULL DEFAULT 'IDR',
  gambar_produk JSONB NOT NULL DEFAULT '[]'::jsonb,
  publikasi BOOLEAN NOT NULL DEFAULT TRUE,
  best_seller BOOLEAN NOT NULL DEFAULT FALSE,
  status_stok TEXT NOT NULL DEFAULT 'available',
  urutan INTEGER NOT NULL DEFAULT 0,
  dibuat_oleh INTEGER REFERENCES user_admin(id_admin) ON DELETE SET NULL,
  diubah_oleh INTEGER REFERENCES user_admin(id_admin) ON DELETE SET NULL,
  create_add TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  update_add TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS testimoni (
  id_testimoni INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nama_pelanggan TEXT NOT NULL,
  kutipan TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  gambar VARCHAR(255),
  publikasi BOOLEAN NOT NULL DEFAULT TRUE,
  urutan INTEGER NOT NULL DEFAULT 0,
  dibuat_oleh INTEGER REFERENCES user_admin(id_admin) ON DELETE SET NULL,
  diubah_oleh INTEGER REFERENCES user_admin(id_admin) ON DELETE SET NULL,
  create_add TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  update_add TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO kategori (nama, deskripsi, urutan, aktif)
VALUES
  ('Living Room', 'Furniture for living areas and lounges.', 1, TRUE),
  ('Bedroom', 'Beds, wardrobes, and bedroom storage.', 2, TRUE),
  ('Dining Room', 'Dining tables, chairs, and buffets.', 3, TRUE)
ON CONFLICT (nama) DO NOTHING;

-- Catatan:
-- Untuk sistem upload gambar yang sekarang, kolom `gambar_produk` menyimpan array JSON,
-- misalnya: ["/uploads/1716060000000-sofa-jepara.jpg", "/uploads/1716060000001-sofa-jepara-2.jpg"]
-- File fisiknya akan tersimpan di folder: server/uploads

-- Contoh insert produk:
-- INSERT INTO produk (
--   id_kategori,
--   nama,
--   deskripsi,
--   harga,
--   kode_mata_uang,
--   gambar_produk,
--   publikasi,
--   status_stok,
--   urutan
-- )
-- SELECT
--   kategori.id_kategori,
--   'Jepara Lounge Sofa',
--   'Sofa handcrafted dengan sentuhan kayu Jepara dan bantalan nyaman untuk ruang tamu modern.',
--   18500000,
--   'IDR',
--   '["/uploads/1716060000000-jepara-lounge-sofa.jpg","/uploads/1716060000001-jepara-lounge-sofa-2.jpg"]'::jsonb,
--   TRUE,
--   'available',
--   1
-- FROM kategori
-- WHERE kategori.nama = 'Living Room';

-- Contoh insert testimoni:
-- INSERT INTO testimoni (
--   nama_pelanggan,
--   kutipan,
--   rating,
--   gambar,
--   publikasi,
--   urutan
-- )
-- VALUES (
--   'Nadya Putri',
--   'Hasil furniturenya rapi, elegan, dan kualitas kayunya terasa premium sejak pertama kali datang.',
--   5,
--   '/uploads/1716060000001-nadya-putri.jpg',
--   TRUE,
--   1
-- );
