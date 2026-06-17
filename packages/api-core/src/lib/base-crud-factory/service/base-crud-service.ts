import { Model, Types, AnyObject } from 'mongoose';

export interface CrudService<T> {
  readonly createOne: (data: AnyObject | Partial<T>) => Promise<T>;
  readonly readOne: (id: string) => Promise<T | null>;
  readonly readAll: () => Promise<readonly T[]>;
  readonly readMany: (ids: readonly string[]) => Promise<readonly T[]>;
  readonly updateOne: (id: string, data: Partial<T>) => Promise<T | null>;
  readonly deleteOne: (id: string) => Promise<T | null>;
  readonly deleteMany: (ids: readonly string[]) => Promise<{ readonly deletedCount: number }>;
}

export const createCrudService = <T>(model: Model<any>): CrudService<T> => {
  const toObjectId = (id: string): Types.ObjectId => new Types.ObjectId(id);

  return {
    createOne: async (data) => {
      const ArrayResult = await model.create([data]);
      return ArrayResult[0].toObject() as T;
    },

    readOne: async (id) =>
      model.findById(toObjectId(id)).lean<T>().exec(),

    readAll: async () =>
      model.find().lean<T[]>().exec(),

    readMany: async (ids) =>
      model.find({ _id: { $in: ids.map(toObjectId) } }).lean<T[]>().exec(),

    updateOne: async (id, data) =>
      model.findByIdAndUpdate(
        toObjectId(id),
        { $set: data as any },
        { new: true }
      ).lean<T>().exec(),

    deleteOne: async (id) =>
      model.findByIdAndDelete(toObjectId(id)).lean<T>().exec(),

    deleteMany: async (ids) => {
      const result = await model.deleteMany({ _id: { $in: ids.map(toObjectId) } }).exec();
      return { deletedCount: result.deletedCount ?? 0 };
    }
  };
};