import * as migration_20261015_071406_initial from './20261015_071406_initial';

export const migrations = [
  {
    up: migration_20261015_071406_initial.up,
    down: migration_20261015_071406_initial.down,
    name: '20261015_071406_initial'
  },
];
