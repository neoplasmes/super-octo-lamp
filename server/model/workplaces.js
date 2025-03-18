import { SchemaFieldTypes } from 'redis';

export const workplacesNamespace = 'workplaces';

export const workplacesSchema = {
  id: SchemaFieldTypes.NUMERIC,
  name: SchemaFieldTypes.TEXT,
  address: SchemaFieldTypes.TEXT,
  benefit: SchemaFieldTypes.NUMERIC,
};

export const workplacesInitialValues = [
  { id: 1, name: "Песочный карьер", address: "Бор", benefit: 0 },
  { id: 2, name: "Овощная база", address: "Ильино", benefit: 5 },
  { id: 3, name: "ТЭЦ", address: "Джержинск", benefit: 5 },
  { id: 4, name: "Детский сад", address: "Н.Новгород", benefit: 10 },
  { id: 5, name: "Стройплощадка", address: "Н.Новгород", benefit: 0 }
];
