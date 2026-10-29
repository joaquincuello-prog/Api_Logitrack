import { IEncomiendaRepository } from './IEncomiendaRepository';
import { InMemoryEncomiendaRepository } from './InMemoryEncomiendaRepository';
import { MySqlEncomiendaRepository } from './MySqlEncomiendaRepository';
import { IUnitOfWork } from '../core/domain/ports/IUnitOfWork';
import { InMemoryUnitOfWork } from '../infrastructure/persistence/InMemoryUnitOfWork';
import { MySqlUnitOfWork } from '../infrastructure/persistence/MySqlUnitOfWork';

let repositoryInstance: IEncomiendaRepository | null = null;
let unitOfWorkInstance: IUnitOfWork | null = null;

export function getEncomiendaRepository(): IEncomiendaRepository {
  if (!repositoryInstance) {
    if (process.env.USE_IN_MEMORY_DB === 'true' || process.env.NODE_ENV === 'test') {
      repositoryInstance = new InMemoryEncomiendaRepository();
    } else {
      repositoryInstance = new MySqlEncomiendaRepository();
    }
  }
  return repositoryInstance;
}

export function setEncomiendaRepository(repo: IEncomiendaRepository): void {
  repositoryInstance = repo;
  if (repo instanceof InMemoryEncomiendaRepository) {
    unitOfWorkInstance = new InMemoryUnitOfWork(repo);
  }
}

export function getUnitOfWork(): IUnitOfWork {
  if (!unitOfWorkInstance) {
    const repo = getEncomiendaRepository();
    if (repo instanceof InMemoryEncomiendaRepository) {
      unitOfWorkInstance = new InMemoryUnitOfWork(repo);
    } else {
      unitOfWorkInstance = new MySqlUnitOfWork();
    }
  }
  return unitOfWorkInstance;
}

export function setUnitOfWork(uow: IUnitOfWork): void {
  unitOfWorkInstance = uow;
}
