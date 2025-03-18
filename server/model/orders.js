import { SchemaFieldTypes } from 'redis';

export const ordersNamespace = 'orders';

export const ordersSchema = {
    id: SchemaFieldTypes.NUMERIC,
    date: SchemaFieldTypes.TEXT,
    workplaceId: SchemaFieldTypes.NUMERIC,
    transportCompanyId: SchemaFieldTypes.NUMERIC,
    vehicleId: SchemaFieldTypes.NUMERIC,
    quantity: SchemaFieldTypes.NUMERIC,
    payment: SchemaFieldTypes.NUMERIC,
};
  
  export const ordersInitialValues = [
    { id: 0, date: "Понедельник", workplaceId: 1, transportCompanyId: 3, vehicleId: 7, quantity: 1, payment: 100000 },
    { id: 1, date: "Понедельник", workplaceId: 1, transportCompanyId: 5, vehicleId: 7, quantity: 2, payment: 200000 },
    { id: 2, date: "Понедельник", workplaceId: 3, transportCompanyId: 2, vehicleId: 7, quantity: 1, payment: 100000 },
    { id: 3, date: "Понедельник", workplaceId: 4, transportCompanyId: 3, vehicleId: 7, quantity: 1, payment: 100000 },
    { id: 4, date: "Вторник", workplaceId: 5, transportCompanyId: 4, vehicleId: 2, quantity: 2, payment: 400000 },
    { id: 5, date: "Среда", workplaceId: 1, transportCompanyId: 6, vehicleId: 4, quantity: 1, payment: 160000 },
    { id: 6, date: "Среда", workplaceId: 1, transportCompanyId: 4, vehicleId: 4, quantity: 1, payment: 160000 },
    { id: 7, date: "Среда", workplaceId: 4, transportCompanyId: 1, vehicleId: 4, quantity: 1, payment: 160000 },
    { id: 8, date: "Четверг", workplaceId: 2, transportCompanyId: 4, vehicleId: 3, quantity: 1, payment: 110000 },
    { id: 9, date: "Четверг", workplaceId: 2, transportCompanyId: 5, vehicleId: 2, quantity: 1, payment: 200000 },
    { id: 10, date: "Четверг", workplaceId: 4, transportCompanyId: 1, vehicleId: 6, quantity: 2, payment: 200000 },
    { id: 11, date: "Четверг", workplaceId: 5, transportCompanyId: 3, vehicleId: 5, quantity: 1, payment: 200000 },
    { id: 12, date: "Пятница", workplaceId: 4, transportCompanyId: 2, vehicleId: 1, quantity: 4, payment: 400000 },
    { id: 13, date: "Пятница", workplaceId: 4, transportCompanyId: 5, vehicleId: 1, quantity: 1, payment: 100000 },
    { id: 14, date: "Пятница", workplaceId: 4, transportCompanyId: 4, vehicleId: 1, quantity: 3, payment: 300000 },
    { id: 15, date: "Пятница", workplaceId: 5, transportCompanyId: 6, vehicleId: 6, quantity: 2, payment: 200000 },
    { id: 16, date: "Суббота", workplaceId: 2, transportCompanyId: 1, vehicleId: 1, quantity: 4, payment: 400000 },
  ];