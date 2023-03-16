import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

beforeAll(async () => {
  // sebelum dieksekusi akan melakukan koneksi ke mongodb
  // setupFilesAfterEnv => beforeAll dijalankan ketika env sudah di-load, dan isi NODE_ENV=test
  const mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  // setelah selesai dieksekusi semua koneksi akan ditutup
  await mongoose.disconnect();
  await mongoose.connection.close();
});
