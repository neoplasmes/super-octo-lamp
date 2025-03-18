import { SchemaFieldTypes } from 'redis';

export const vehiclesNamespace = 'vehicles';

export const vehiclesSchema = {
    id: SchemaFieldTypes.NUMERIC,
    type: SchemaFieldTypes.TEXT,
    address: SchemaFieldTypes.TEXT,
    maxCount: SchemaFieldTypes.NUMERIC,
    orderCost: SchemaFieldTypes.NUMERIC,
};
  
export const vehiclesInitialValues = [
  { id: 1, type: "Грузовая машина", address: "Н.Новгород", maxCount: 10, orderCost: 100000 },
  { id: 2, type: "Автобус", address: "Н.Новгород", maxCount: 5, orderCost: 200000 },
  { id: 3, type: "Цистерна", address: "Ильино", maxCount: 4, orderCost: 110000 },
  { id: 4, type: "Автокран", address: "Бор", maxCount: 3, orderCost: 160000 },
  { id: 5, type: "Бетономешалка", address: "Бор", maxCount: 3, orderCost: 130000 },
  { id: 6, type: "Самосвал", address: "Кстово", maxCount: 5, orderCost: 100000 },
  { id: 7, type: "Автофургон", address: "Джержинск", maxCount: 15, orderCost: 100000 },
];