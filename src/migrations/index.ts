import * as migration_20261020_032502_initial from './20261020_032502_initial';

export const migrations = [
  {
    up: migration_20261020_032502_initial.up,
    down: migration_20261020_032502_initial.down,
    name: '20261020_032502_initial'
  },
];
