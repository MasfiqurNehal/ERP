'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Users, Plus, UserPlus, FileSpreadsheet, CalendarDays, Wallet } from 'lucide-react';

export default function HRPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'employees' | 'attendance' | 'leaves' | 'payroll'>('employees');
  const [employees, setEmployees] = useState<any[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    firstName: '', lastName: '', email: '', phone: '', department: '', position: '', hireDate: '', salary: ''
  });

  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [newLeave, setNewLeave] = useState({ employeeId: '', startDate: '', endDate: '', type: 'CASUAL', reason: '' });

  const [showPayrollModal, setShowPayrollModal] = useState(false);
  const [newPayroll, setNewPayroll] = useState({ employeeId: '', month: '', year: '', allowances: '0', deductions: '0' });

  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [newAttendance, setNewAttendance] = useState({ employeeId: '', date: '', checkIn: '09:00', checkOut: '17:00', status: 'PRESENT' });

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (['ADMIN', 'MANAGER', 'HR_STAFF'].includes(user?.role || '')) {
        const empData = await api.get('/hr/employees');
        setEmployees(empData.employees || []);

        const attData = await api.get('/hr/attendance');
        setAttendanceLogs(attData.attendanceLogs || []);

        const leaveData = await api.get('/hr/leaves');
        setLeaves(leaveData.leaves || []);
      }

      if (['ADMIN', 'MANAGER', 'HR_STAFF', 'FINANCE_STAFF'].includes(user?.role || '')) {
        const prData = await api.get('/hr/payroll');
        setPayrolls(prData.payrolls || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch HR data records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/hr/employees', newEmployee);
      setSuccess('Employee record added successfully!');
      setNewEmployee({
        firstName: '', lastName: '', email: '', phone: '', department: '', position: '', hireDate: '', salary: ''
      });
      setShowEmployeeModal(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to create employee');
    }
  };

  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/hr/leaves/request', newLeave);
      setSuccess('Leave request submitted!');
      setNewLeave({ employeeId: '', startDate: '', endDate: '', type: 'CASUAL', reason: '' });
      setShowLeaveModal(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to request leave');
    }
  };

  const handleLeaveAction = async (leaveId: string, status: 'APPROVED' | 'REJECTED') => {
    setError('');
    setSuccess('');
    try {
      await api.put(`/hr/leaves/${leaveId}/status`, { status });
      setSuccess(`Leave request ${status.toLowerCase()}!`);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to update leave status');
    }
  };

  const handlePayrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/hr/payroll/generate', newPayroll);
      setSuccess('Payroll generated successfully!');
      setNewPayroll({ employeeId: '', month: '', year: '', allowances: '0', deductions: '0' });
      setShowPayrollModal(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to generate payroll');
    }
  };

  const handlePayPayroll = async (payrollId: string) => {
    setError('');
    setSuccess('');
    try {
      await api.post(`/hr/payroll/${payrollId}/pay`);
      setSuccess('Salary processed! Transaction logged in Accounting.');
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to process salary payment');
    }
  };

  const handleAttendanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/hr/attendance', newAttendance);
      setSuccess('Attendance logged successfully!');
      setNewAttendance({ employeeId: '', date: '', checkIn: '09:00', checkOut: '17:00', status: 'PRESENT' });
      setShowAttendanceModal(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to log attendance');
    }
  };

  const isHREditor = user && ['ADMIN', 'MANAGER', 'HR_STAFF'].includes(user.role);
  const isFinancePayer = user && ['ADMIN', 'MANAGER', 'FINANCE_STAFF'].includes(user.role);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            HR & Operational Payroll
          </h2>
          <p className="text-slate-400 text-xs mt-0.5">
            Administer employees directory, check attendance logs, log leaves, and process monthly salaries.
          </p>
        </div>
        {isHREditor && (
          <div className="flex gap-2">
            {activeTab === 'employees' && (
              <button
                onClick={() => setShowEmployeeModal(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2 px-3 rounded-lg flex items-center gap-1.5 shadow-lg shadow-blue-500/10 transition-colors"
              >
                <UserPlus className="w-4 h-4" /> Add Employee
              </button>
            )}
            {activeTab === 'attendance' && (
              <button
                onClick={() => setShowAttendanceModal(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2 px-3 rounded-lg flex items-center gap-1.5 shadow-lg shadow-blue-500/10 transition-colors"
              >
                <CalendarDays className="w-4 h-4" /> Log Attendance
              </button>
            )}
            {activeTab === 'leaves' && (
              <button
                onClick={() => setShowLeaveModal(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2 px-3 rounded-lg flex items-center gap-1.5 shadow-lg shadow-blue-500/10 transition-colors"
              >
                <CalendarDays className="w-4 h-4" /> Request Leave
              </button>
            )}
            {activeTab === 'payroll' && (
              <button
                onClick={() => setShowPayrollModal(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2 px-3 rounded-lg flex items-center gap-1.5 shadow-lg shadow-blue-500/10 transition-colors"
              >
                <Wallet className="w-4 h-4" /> Generate Payroll
              </button>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg p-3">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-lg p-3">
          {success}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        {['ADMIN', 'MANAGER', 'HR_STAFF'].includes(user?.role || '') && (
          <>
            <button
              onClick={() => setActiveTab('employees')}
              className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'employees' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              👥 Directory ({employees.length})
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'attendance' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              📅 Attendance Logs ({attendanceLogs.length})
            </button>
            <button
              onClick={() => setActiveTab('leaves')}
              className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'leaves' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              🌴 Leave Applications ({leaves.length})
            </button>
          </>
        )}
        {['ADMIN', 'MANAGER', 'HR_STAFF', 'FINANCE_STAFF'].includes(user?.role || '') && (
          <button
            onClick={() => setActiveTab('payroll')}
            className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'payroll' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            💰 Payroll Registry ({payrolls.length})
          </button>
        )}
      </div>

      {loading ? (
        <div className="h-48 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden">
          {/* TAB 1: EMPLOYEES */}
          {activeTab === 'employees' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs uppercase bg-slate-950/40 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Employee</th>
                    <th className="py-3.5 px-4">Department / Role</th>
                    <th className="py-3.5 px-4">Contact</th>
                    <th className="py-3.5 px-4">Monthly Salary</th>
                    <th className="py-3.5 px-4">Hire Date</th>
                    <th className="py-3.5 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-800/20">
                      <td className="py-3 px-4 font-bold text-slate-200">{emp.firstName} {emp.lastName}</td>
                      <td className="py-3 px-4 text-slate-400">
                        <div>{emp.position}</div>
                        <span className="text-[10px] text-slate-500">{emp.department}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        <div>{emp.email}</div>
                        <span className="text-[10px] text-slate-500">{emp.phone || 'No phone'}</span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-200">${emp.salary}</td>
                      <td className="py-3 px-4 text-slate-400">{new Date(emp.hireDate).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold px-2 py-0.5 rounded-full">
                          {emp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {employees.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-500">No employees registered.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: ATTENDANCE */}
          {activeTab === 'attendance' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs uppercase bg-slate-950/40 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Employee</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Clock In</th>
                    <th className="py-3.5 px-4">Clock Out</th>
                    <th className="py-3.5 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {attendanceLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/20">
                      <td className="py-3 px-4 font-bold text-slate-200">{log.employee?.firstName} {log.employee?.lastName}</td>
                      <td className="py-3 px-4 text-slate-400">{new Date(log.date).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-slate-300">{log.checkIn || '--:--'}</td>
                      <td className="py-3 px-4 text-slate-300">{log.checkOut || '--:--'}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                          log.status === 'PRESENT'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : log.status === 'LEAVE'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {attendanceLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-500">No attendance logged today.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: LEAVES */}
          {activeTab === 'leaves' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs uppercase bg-slate-950/40 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Employee</th>
                    <th className="py-3.5 px-4">Dates</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Reason</th>
                    <th className="py-3.5 px-4">Approval Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {leaves.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-800/20">
                      <td className="py-3 px-4 font-bold text-slate-200">{l.employee?.firstName} {l.employee?.lastName}</td>
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(l.startDate).toLocaleDateString()} to {new Date(l.endDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-slate-300">{l.type}</td>
                      <td className="py-3 px-4 text-slate-400 max-w-xs truncate">{l.reason || 'No reason'}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                          l.status === 'APPROVED'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : l.status === 'PENDING'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {l.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {l.status === 'PENDING' && (
                          <div className="flex gap-1.5 justify-end">
                            <button
                              onClick={() => handleLeaveAction(l.id, 'APPROVED')}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white text-[9px] font-bold py-1 px-2 rounded"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleLeaveAction(l.id, 'REJECTED')}
                              className="bg-red-600 hover:bg-red-500 text-white text-[9px] font-bold py-1 px-2 rounded"
                            >
                              Deny
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {leaves.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-500">No leave applications registered.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 4: PAYROLL */}
          {activeTab === 'payroll' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs uppercase bg-slate-950/40 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Employee</th>
                    <th className="py-3.5 px-4">Month/Year</th>
                    <th className="py-3.5 px-4">Base Salary</th>
                    <th className="py-3.5 px-4">Allowances</th>
                    <th className="py-3.5 px-4">Deductions</th>
                    <th className="py-3.5 px-4">Net Salary</th>
                    <th className="py-3.5 px-4">Status</th>
                    {isFinancePayer && <th className="py-3.5 px-4 text-right">Payment</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {payrolls.map((pr) => (
                    <tr key={pr.id} className="hover:bg-slate-800/20">
                      <td className="py-3 px-4 font-bold text-slate-200">{pr.employee?.firstName} {pr.employee?.lastName}</td>
                      <td className="py-3 px-4 text-slate-400">{pr.month}/{pr.year}</td>
                      <td className="py-3 px-4 text-slate-400">${pr.basicSalary}</td>
                      <td className="py-3 px-4 text-emerald-400">+${pr.allowances}</td>
                      <td className="py-3 px-4 text-red-400">-${pr.deductions}</td>
                      <td className="py-3 px-4 font-bold text-slate-200">${pr.netSalary}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                          pr.status === 'PAID'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {pr.status}
                        </span>
                      </td>
                      {isFinancePayer && (
                        <td className="py-3 px-4 text-right">
                          {pr.status !== 'PAID' && (
                            <button
                              onClick={() => handlePayPayroll(pr.id)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold py-1 px-2.5 rounded-lg ml-auto transition-colors"
                            >
                              💸 Process Pay
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                  {payrolls.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-slate-500">No payroll cycles created. Click 'Generate Payroll' to start.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Employee Modal */}
      {showEmployeeModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-400" /> Register Employee
            </h3>
            <form onSubmit={handleEmployeeSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">First Name</label>
                  <input
                    type="text" required
                    value={newEmployee.firstName}
                    onChange={(e) => setNewEmployee({ ...newEmployee, firstName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Last Name</label>
                  <input
                    type="text" required
                    value={newEmployee.lastName}
                    onChange={(e) => setNewEmployee({ ...newEmployee, lastName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Corporate Email</label>
                  <input
                    type="email" required
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Phone</label>
                  <input
                    type="text"
                    value={newEmployee.phone}
                    onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Department</label>
                  <input
                    type="text" required placeholder="e.g. Sales, HR, Engineering"
                    value={newEmployee.department}
                    onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Position Title</label>
                  <input
                    type="text" required placeholder="e.g. Lead, Associate"
                    value={newEmployee.position}
                    onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Hire Date</label>
                  <input
                    type="date" required
                    value={newEmployee.hireDate}
                    onChange={(e) => setNewEmployee({ ...newEmployee, hireDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Monthly Salary ($)</label>
                  <input
                    type="number" required
                    value={newEmployee.salary}
                    onChange={(e) => setNewEmployee({ ...newEmployee, salary: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEmployeeModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2 px-4 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2 px-4 rounded-lg shadow-lg shadow-blue-500/10"
                >
                  Register Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attendance Modal */}
      {showAttendanceModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-blue-400" /> Log Attendance
            </h3>
            <form onSubmit={handleAttendanceSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Employee</label>
                <select
                  required
                  value={newAttendance.employeeId}
                  onChange={(e) => setNewAttendance({ ...newAttendance, employeeId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                >
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Date</label>
                <input
                  type="date" required
                  value={newAttendance.date}
                  onChange={(e) => setNewAttendance({ ...newAttendance, date: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Check In Time</label>
                  <input
                    type="text" required placeholder="09:00"
                    value={newAttendance.checkIn}
                    onChange={(e) => setNewAttendance({ ...newAttendance, checkIn: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Check Out Time</label>
                  <input
                    type="text" placeholder="17:00"
                    value={newAttendance.checkOut}
                    onChange={(e) => setNewAttendance({ ...newAttendance, checkOut: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Status</label>
                <select
                  value={newAttendance.status}
                  onChange={(e) => setNewAttendance({ ...newAttendance, status: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                >
                  <option value="PRESENT">PRESENT</option>
                  <option value="ABSENT">ABSENT</option>
                  <option value="LATE">LATE</option>
                  <option value="LEAVE">LEAVE</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAttendanceModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2 px-4 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2 px-4 rounded-lg shadow-lg shadow-blue-500/10"
                >
                  Log Attendance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Leave Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-blue-400" /> Apply for Leave
            </h3>
            <form onSubmit={handleLeaveSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Employee</label>
                <select
                  required
                  value={newLeave.employeeId}
                  onChange={(e) => setNewLeave({ ...newLeave, employeeId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                >
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Start Date</label>
                  <input
                    type="date" required
                    value={newLeave.startDate}
                    onChange={(e) => setNewLeave({ ...newLeave, startDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">End Date</label>
                  <input
                    type="date" required
                    value={newLeave.endDate}
                    onChange={(e) => setNewLeave({ ...newLeave, endDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Leave Type</label>
                <select
                  value={newLeave.type}
                  onChange={(e) => setNewLeave({ ...newLeave, type: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                >
                  <option value="CASUAL">CASUAL</option>
                  <option value="SICK">SICK</option>
                  <option value="MATERNITY">MATERNITY</option>
                  <option value="UNPAID">UNPAID</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Reason</label>
                <textarea
                  value={newLeave.reason}
                  onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none h-16 resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2 px-4 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2 px-4 rounded-lg shadow-lg shadow-blue-500/10"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payroll Modal */}
      {showPayrollModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-blue-400" />
              Generate Monthly Payroll
            </h3>
            <form onSubmit={handlePayrollSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Employee</label>
                <select
                  required
                  value={newPayroll.employeeId}
                  onChange={(e) => setNewPayroll({ ...newPayroll, employeeId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                >
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} (${emp.salary}/mo)</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Month (1-12)</label>
                  <input
                    type="number" min="1" max="12" required placeholder="e.g. 7"
                    value={newPayroll.month}
                    onChange={(e) => setNewPayroll({ ...newPayroll, month: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Year</label>
                  <input
                    type="number" min="2020" max="2035" required placeholder="e.g. 2026"
                    value={newPayroll.year}
                    onChange={(e) => setNewPayroll({ ...newPayroll, year: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Allowances ($)</label>
                  <input
                    type="number" step="0.01" required
                    value={newPayroll.allowances}
                    onChange={(e) => setNewPayroll({ ...newPayroll, allowances: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Deductions ($)</label>
                  <input
                    type="number" step="0.01" required
                    value={newPayroll.deductions}
                    onChange={(e) => setNewPayroll({ ...newPayroll, deductions: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPayrollModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2 px-4 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2 px-4 rounded-lg shadow-lg shadow-blue-500/10"
                >
                  Generate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
