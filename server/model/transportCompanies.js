import { SchemaFieldTypes } from 'redis';

export const transportCompaniesNamespace = 'transportCompanies';

export const transportCompaniesSchema = {
  id: SchemaFieldTypes.NUMERIC,
  name: SchemaFieldTypes.TEXT,
  address: SchemaFieldTypes.TEXT,
  commission: SchemaFieldTypes.NUMERIC,
};

export const transportCompaniesInitialValues = [
    { id: 1, name: "АТП 12", address: "Н.Новгород", commission: 7 },
    { id: 2, name: "МП Авто", address: "Джержинск", commission: 6 },
    { id: 3, name: "АТП 9", address: "Ильино", commission: 6 },
    { id: 4, name: "АТП 7", address: "Кстово", commission: 4 },
    { id: 5, name: "АТП 3", address: "Н.Новгород", commission: 7 },
    { id: 6, name: "Борский автоотряд", address: "Бор", commission: 4 },
];