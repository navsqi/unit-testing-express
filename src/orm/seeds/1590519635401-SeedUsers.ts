/* eslint-disable @typescript-eslint/no-unused-vars */
import { MigrationInterface, QueryRunner, getRepository } from 'typeorm';

import User from '../entities/User';

export class SeedUsers1590519635401 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    const user = new User();
    const userRepository = getRepository(User);

    user.username = 'nauval';
    user.name = 'Nauval Shidqi';
    user.email = 'admin@admin.com';
    user.password = 'pass1';
    user.hashPassword();
    user.role = 'ADMINISTRATOR';
    await userRepository.save(user);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`
            DELETE FROM migrations WHERE name ~* 'seed'
        `);
  }
}
