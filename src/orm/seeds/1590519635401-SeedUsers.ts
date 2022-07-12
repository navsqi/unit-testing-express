/* eslint-disable @typescript-eslint/no-unused-vars */
import { MigrationInterface, QueryRunner, getRepository } from 'typeorm';

import User from '../entities/User';

export class SeedUsers1590519635401 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    let user = new User();
    const userRepo = getRepository(User);

    user.email = 'nauval@admin.com';
    user.password = 'pass1';
    user.hashPassword();
    user.role = 'ADMINISTRATOR';
    await userRepo.save(user);

    user = new User();
    user.email = 'standard@standard.com';
    user.password = 'pass1';
    user.hashPassword();
    user.role = 'STANDARD';
    await userRepo.save(user);

    user = new User();
    user.email = 'skyler.white@test.com';
    user.password = 'pass1';
    user.hashPassword();
    await userRepo.save(user);

    user = new User();
    user.email = 'hank.schrader@test.com';
    user.password = 'pass1';
    user.hashPassword();
    await userRepo.save(user);

    user = new User();
    user.email = 'marie.schrader@test.com';
    user.password = 'pass1';
    user.hashPassword();
    await userRepo.save(user);

    user = new User();
    user.email = 'saul.goodman@test.com';
    user.password = 'pass1';
    user.hashPassword();
    await userRepo.save(user);

    user = new User();
    user.email = 'gustavo.fring@test.com';
    user.password = 'pass1';
    user.hashPassword();
    await userRepo.save(user);

    user = new User();
    user.email = 'michael.ehrmantraut@test.com';
    user.password = 'pass1';
    user.hashPassword();
    await userRepo.save(user);

    user = new User();
    user.email = 'hector.salamanca@test.com';
    user.password = 'pass1';
    user.hashPassword();
    await userRepo.save(user);

    user = new User();
    user.email = 'alberto.salamanca@test.com';
    user.password = 'pass1';
    user.hashPassword();
    await userRepo.save(user);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`
            DELETE FROM migrations WHERE name ~* 'seed'
        `);
  }
}
