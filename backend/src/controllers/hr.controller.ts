import { Response } from 'express';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';

// EMPLOYEES
export const getEmployees = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        attendance: true,
        leaves: true,
        payrolls: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json({ employees });
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createEmployee = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { firstName, lastName, email, phone, department, position, hireDate, salary } = req.body;

    if (!firstName || !lastName || !email || !department || !position || !hireDate || !salary) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existingEmployee = await prisma.employee.findUnique({ where: { email } });
    if (existingEmployee) {
      return res.status(400).json({ message: 'Employee with this email already exists' });
    }

    const employee = await prisma.employee.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        department,
        position,
        hireDate: new Date(hireDate),
        salary: parseFloat(salary),
      },
    });

    return res.status(201).json({ employee });
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ATTENDANCE
export const getAttendance = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const logs = await prisma.attendance.findMany({
      include: { employee: true },
      orderBy: { date: 'desc' },
    });
    return res.status(200).json({ attendanceLogs: logs });
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const logAttendance = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { employeeId, date, checkIn, checkOut, status } = req.body;

    if (!employeeId || !date) {
      return res.status(400).json({ message: 'Employee ID and date are required' });
    }

    const recordDate = new Date(date);
    const existingRecord = await prisma.attendance.findFirst({
      where: {
        employeeId,
        date: recordDate,
      },
    });

    let attendance;
    if (existingRecord) {
      attendance = await prisma.attendance.update({
        where: { id: existingRecord.id },
        data: {
          checkIn: checkIn !== undefined ? checkIn : existingRecord.checkIn,
          checkOut: checkOut !== undefined ? checkOut : existingRecord.checkOut,
          status: status !== undefined ? status : existingRecord.status,
        },
      });
    } else {
      attendance = await prisma.attendance.create({
        data: {
          employeeId,
          date: recordDate,
          checkIn,
          checkOut,
          status: status || 'PRESENT',
        },
      });
    }

    return res.status(200).json({ attendance });
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// LEAVES
export const getLeaves = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const leaves = await prisma.leave.findMany({
      include: { employee: true },
      orderBy: { startDate: 'desc' },
    });
    return res.status(200).json({ leaves });
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const requestLeave = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { employeeId, startDate, endDate, type, reason } = req.body;

    if (!employeeId || !startDate || !endDate || !type) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const leave = await prisma.leave.create({
      data: {
        employeeId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        type,
        reason,
        status: 'PENDING',
      },
    });

    return res.status(201).json({ leave });
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateLeaveStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // APPROVED, REJECTED

    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const leave = await prisma.leave.update({
      where: { id },
      data: { status },
    });

    return res.status(200).json({ leave });
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PAYROLL
export const getPayrolls = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const payrolls = await prisma.payroll.findMany({
      include: { employee: true },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
    return res.status(200).json({ payrolls });
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const generatePayroll = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { employeeId, month, year, allowances, deductions } = req.body;

    if (!employeeId || !month || !year) {
      return res.status(400).json({ message: 'Employee ID, month, and year are required' });
    }

    const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const existingPayroll = await prisma.payroll.findFirst({
      where: { employeeId, month: parseInt(month), year: parseInt(year) },
    });
    if (existingPayroll) {
      return res.status(400).json({ message: 'Payroll for this month already exists' });
    }

    const basicSalary = employee.salary;
    const computedAllowances = parseFloat(allowances) || 0.0;
    const computedDeductions = parseFloat(deductions) || 0.0;
    const netSalary = basicSalary + computedAllowances - computedDeductions;

    const payroll = await prisma.payroll.create({
      data: {
        employeeId,
        month: parseInt(month),
        year: parseInt(year),
        basicSalary,
        allowances: computedAllowances,
        deductions: computedDeductions,
        netSalary,
        status: 'PENDING',
      },
    });

    return res.status(201).json({ payroll });
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const payPayroll = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const payroll = await prisma.payroll.findUnique({
      where: { id },
      include: { employee: true },
    });

    if (!payroll) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }

    if (payroll.status === 'PAID') {
      return res.status(400).json({ message: 'Payroll already paid' });
    }

    const updatedPayroll = await prisma.$transaction(async (tx) => {
      const updated = await tx.payroll.update({
        where: { id },
        data: {
          status: 'PAID',
          paymentDate: new Date(),
        },
      });

      // Log expense in Finance
      await tx.transaction.create({
        data: {
          type: 'EXPENSE',
          amount: payroll.netSalary,
          category: 'Salaries',
          description: `Salary paid to ${payroll.employee.firstName} ${payroll.employee.lastName} for ${payroll.month}/${payroll.year}`,
          reference: `PAY-${payroll.id.slice(-6)}`,
        },
      });

      return updated;
    });

    return res.status(200).json({ payroll: updatedPayroll });
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
