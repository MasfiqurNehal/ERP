import { PrismaClient, Role, LeaveType, LeaveStatus, AttendanceStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Create Demo Users for each role
  const users = [
    { email: 'admin@erp.com', name: 'System Admin', role: Role.ADMIN },
    { email: 'manager@erp.com', name: 'General Manager', role: Role.MANAGER },
    { email: 'inventory@erp.com', name: 'Inventory Specialist', role: Role.INVENTORY_STAFF },
    { email: 'sales@erp.com', name: 'Sales Agent', role: Role.SALES_STAFF },
    { email: 'hr@erp.com', name: 'HR Manager', role: Role.HR_STAFF },
    { email: 'finance@erp.com', name: 'Chief Accountant', role: Role.FINANCE_STAFF },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        name: u.name,
        password: hashedPassword,
        role: u.role,
      },
    });
  }
  console.log('Users seeded.');

  // 2. Create Categories
  const categoriesData = [
    { name: 'Electronics', description: 'Computers, accessories, and gadgets' },
    { name: 'Furniture', description: 'Office desks, chairs, and cabinets' },
    { name: 'Office Supplies', description: 'Stationery, paper, and pens' },
  ];

  const categories = [];
  for (const cat of categoriesData) {
    const c = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
    categories.push(c);
  }
  console.log('Categories seeded.');

  // 3. Create Suppliers
  const suppliersData = [
    { name: 'Global Tech Dist', email: 'sales@globaltech.com', phone: '123-456-7890', address: 'Silicon Valley, CA' },
    { name: 'Modern Office Co', email: 'orders@modernoffice.com', phone: '098-765-4321', address: 'Chicago, IL' },
  ];

  const suppliers = [];
  for (const sup of suppliersData) {
    const s = await prisma.supplier.create({
      data: sup,
    });
    suppliers.push(s);
  }
  console.log('Suppliers seeded.');

  // 4. Create Products
  const productsData = [
    {
      name: 'ThinkPad X1 Carbon',
      sku: 'TP-X1-CARB',
      description: 'Lenovo high-end business laptop',
      price: 1500.0,
      cost: 1100.0,
      quantity: 15,
      minStockLevel: 5,
      categoryId: categories[0].id,
      supplierId: suppliers[0].id,
    },
    {
      name: 'Ergonomic Desk Chair',
      sku: 'CHAIR-ERG-01',
      description: 'Mesh office chair with lumbar support',
      price: 250.0,
      cost: 150.0,
      quantity: 20,
      minStockLevel: 8,
      categoryId: categories[1].id,
      supplierId: suppliers[1].id,
    },
    {
      name: 'Wireless Mouse',
      sku: 'MS-WRLSS',
      description: '2.4GHz optical wireless mouse',
      price: 30.0,
      cost: 12.0,
      quantity: 4, // Trigger low stock!
      minStockLevel: 10,
      categoryId: categories[0].id,
      supplierId: suppliers[0].id,
    },
  ];

  for (const prod of productsData) {
    await prisma.product.upsert({
      where: { sku: prod.sku },
      update: {},
      create: prod,
    });
  }
  console.log('Products seeded.');

  // 5. Create Customers
  const customersData = [
    { name: 'Acme Corporation', email: 'procurement@acme.com', phone: '555-1234', address: 'New York, NY' },
    { name: 'Stark Industries', email: 'billing@stark.com', phone: '555-9876', address: 'Los Angeles, CA' },
  ];

  for (const cust of customersData) {
    await prisma.customer.create({
      data: cust,
    });
  }
  console.log('Customers seeded.');

  // 6. Create Employees
  const employeesData = [
    {
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice.smith@erp.com',
      phone: '444-1111',
      department: 'HR',
      position: 'HR Associate',
      hireDate: new Date('2024-01-15'),
      salary: 4000.0,
    },
    {
      firstName: 'Bob',
      lastName: 'Johnson',
      email: 'bob.johnson@erp.com',
      phone: '444-2222',
      department: 'Sales',
      position: 'Sales Lead',
      hireDate: new Date('2023-06-10'),
      salary: 5000.0,
    },
  ];

  for (const emp of employeesData) {
    await prisma.employee.upsert({
      where: { email: emp.email },
      update: {},
      create: emp,
    });
  }
  console.log('Employees seeded.');

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
