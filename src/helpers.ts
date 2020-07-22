import { getMetadataStorage } from './MetadataStorage';
import { BaseFirestoreRepository } from './BaseFirestoreRepository';
import { IEntity, Constructor } from './types';
import { FirestoreTransaction } from './Transaction/FirestoreTransaction';
import { FirestoreBatch } from './Batch/FirestoreBatch';

type RepositoryType = 'default' | 'base' | 'custom';

function _getRepository<T extends IEntity>(
  entity: Constructor<T>,
  repositoryType: RepositoryType,
  documentPath?: string
): BaseFirestoreRepository<T> {
  const metadataStorage = getMetadataStorage();

  if (!metadataStorage.firestoreRef) {
    throw new Error('Firestore must be initialized first');
  }

  const repository = metadataStorage.getRepository(entity);

  if (repositoryType === 'custom' && !repository) {
    throw new Error(`'${entity.name}' does not have a custom repository.`);
  }

  const collection = metadataStorage.getCollection(entity);

  if (!collection) {
    throw new Error(`'${entity.name}' is not a valid collection`);
  }

  // If the collection has a parent, check that we have registered the parent
  if (collection.parentEntityConstructor) {
    const parentCollection = metadataStorage.getCollection(collection.parentEntityConstructor);

    if (!parentCollection) {
      throw new Error(`'${entity.name}' does not have a valid parent collection.`);
    }
  }

  if (repositoryType === 'custom' || (repositoryType === 'default' && repository)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new (repository.target as any)(collection.entityConstructor, documentPath);
  } else {
    return new BaseFirestoreRepository<T>(collection.entityConstructor, documentPath);
  }
}

export function getRepository<T extends IEntity>(entity: Constructor<T>, documentPath?: string) {
  return _getRepository(entity, 'default', documentPath);
}

/**
 * @deprecated Use getRepository. This will be removed in a future version.
 */
export const GetRepository = getRepository;

export function getCustomRepository<T extends IEntity>(
  entity: Constructor<T>,
  documentPath?: string
) {
  return _getRepository(entity, 'custom', documentPath);
}

/**
 * @deprecated Use getCustomRepository. This will be removed in a future version.
 */
export const GetCustomRepository = getCustomRepository;

export function getBaseRepository<T extends IEntity>(
  entity: Constructor<T>,
  collectionPath?: string
) {
  return _getRepository(entity, 'base', collectionPath);
}

/**
 * @deprecated Use getBaseRepository. This will be removed in a future version.
 */
export const GetBaseRepository = getBaseRepository;

export const runTransaction = <T>(executor: (tran: FirestoreTransaction) => Promise<T>) => {
  const metadataStorage = getMetadataStorage();

  if (!metadataStorage.firestoreRef) {
    throw new Error('Firestore must be initialized first');
  }

  return metadataStorage.firestoreRef.runTransaction(async t => {
    return executor(new FirestoreTransaction(t));
  });
};

export const createBatch = () => {
  const metadataStorage = getMetadataStorage();

  if (!metadataStorage.firestoreRef) {
    throw new Error('Firestore must be initialized first');
  }

  return new FirestoreBatch(metadataStorage.firestoreRef);
};
