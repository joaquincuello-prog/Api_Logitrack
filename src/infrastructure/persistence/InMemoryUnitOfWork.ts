import { IUnitOfWork } from '../../core/domain/ports/IUnitOfWork';
import { InMemoryEncomiendaRepository } from '../../repositories/InMemoryEncomiendaRepository';

export class InMemoryUnitOfWork implements IUnitOfWork {
  constructor(private readonly repository: InMemoryEncomiendaRepository) {}

  async runInTransaction<T>(work: () => Promise<T>): Promise<T> {
    const snapshot = this.repository.createSnapshot();
    try {
      const result = await work();
      return result;
    } catch (error) {
      this.repository.restoreSnapshot(snapshot);
      throw error;
    }
  }
}
