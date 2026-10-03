// Author: Mateo Garcia Carreno

// external imports
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';

// internal imports
import { AppModule } from '../app.module.js';
import { Project } from '../projects/entities/project.entity.js';
import { Sprint } from '../sprints/entities/sprint.entity.js';
import { Task } from '../tasks/entities/task.entity.js';
import { User } from '../users/entities/user.entity.js';
import { projectSeeder } from './project.seeder.js';
import { sprintSeeder } from './sprint.seeder.js';
import { taskSeeder } from './task.seeder.js';
import { userSeeder } from './user.seeder.js';

const app = await NestFactory.createApplicationContext(AppModule, {
  logger: ['error', 'warn'],
});
const dataSource = app.get(DataSource);

// Refusing by default keeps a stray `npm run seed` from wiping data you were
// testing with; --fresh is the explicit request to start over.
if (process.argv.includes('--fresh')) {
  await dataSource.synchronize(true);
} else if ((await dataSource.getRepository(User).count()) > 0) {
  console.error(
    'The database already has data. Run `npm run seed -- --fresh` to wipe and reseed it.',
  );
  await app.close();
  process.exit(1);
}

// Parents before children, so every foreign key points at a row that exists.
// One transaction, so a failure halfway leaves the database empty rather than
// half-seeded.
await dataSource.transaction(async (manager) => {
  await manager.save(User, userSeeder);
  await manager.save(Project, projectSeeder);
  await manager.save(Sprint, sprintSeeder);
  await manager.save(Task, taskSeeder);
});

console.log(
  `Seeded ${userSeeder.length} users, ${projectSeeder.length} projects, ` +
    `${sprintSeeder.length} sprints and ${taskSeeder.length} tasks.`,
);
await app.close();
