import { useState, useEffect } from 'react';
import { useAddEmployeeMutation, useAllEmployeeQuery, useDeleteEmployeeMutation, useUpdateEmployeeMutation } from '../../features/api/Employee/employee';
import { useAllCompanyQuery } from '../../features/api/Company/company';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

const EmployeeTable = () => {
    const { data: employees, isLoading, error, refetch } = useAllEmployeeQuery();
    const { data: companies, isLoading: companiesLoading, error: companiesError } = useAllCompanyQuery();
    const [addEmployee] = useAddEmployeeMutation();
    const [updateEmployee] = useUpdateEmployeeMutation();
    const [deleteEmployee] = useDeleteEmployeeMutation();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentEmployeeId, setCurrentEmployeeId] = useState(null);

    const [formValues, setFormValues] = useState({
        firstname: '',
        lastname: '',
        company_id: '',
        email: '',
        phone: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isEditing && currentEmployeeId) {
            // Fetch employee details if editing
            const employee = employees?.data?.find(emp => emp.id === currentEmployeeId);
            if (employee) {
                setFormValues({
                    firstname: employee.firstname,
                    lastname: employee.lastname,
                    email: employee.email,
                    phone: employee.phone,
                    company_id: employee.company_id,
                });
            }
        }
    }, [isEditing, currentEmployeeId, employees]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues({ ...formValues, [name]: value });
    };

    const validateForm = () => {
        let formErrors = {};
        if (!formValues.firstname) formErrors.firstname = "First name is required";
        if (!formValues.lastname) formErrors.lastname = "Last name is required";
        if (!formValues.email) formErrors.email = "Email is required";
        if (!formValues.phone) formErrors.phone = "Phone number is required";
        if (!formValues.company_id) formErrors.company_id = "Company is required";
        setErrors(formErrors);
        return Object.keys(formErrors).length === 0;
    };

    const handleAddEmployee = async () => {
        if (!validateForm()) return;

        const formData = new FormData();
        Object.keys(formValues).forEach((key) => {
            formData.append(key, formValues[key]);
        });

        try {
            const response = await addEmployee(formData);

            if (response.error) {
                const { status } = response.error;
                if (status === 400) {
                    return toast.error(response.error.data.message);
                } else {
                    return toast.error("An error occurred while adding the employee.");
                }
            }

            toast.success('Employee added successfully!');
            refetch();
            closeAndResetModal();
        } catch (error) {
            console.log("Unexpected error:", error);
            toast.error("Unexpected error occurred. Please try again.");
        }
    };

    const handleEditClick = (employee) => {
        setIsEditing(true);
        setIsModalOpen(true);
        setCurrentEmployeeId(employee.id);
    };

    const handleUpdateEmployee = async () => {
        if (!validateForm()) return;

        const formData = new FormData();
        Object.keys(formValues).forEach((key) => {
            formData.append(key, formValues[key]);
        });

        try {
            const response = await updateEmployee({ id: currentEmployeeId, values: formData });

            if (response.error) {
                const { status } = response.error;
                if (status === 400) {
                    return toast.error(response.error.data.message);
                } else {
                    return toast.error("An error occurred while updating the employee.");
                }
            }

            toast.success('Employee updated successfully!');
            refetch();
            closeAndResetModal();
        } catch (error) {
            console.log("Unexpected error:", error);
            toast.error("Unexpected error occurred. Please try again.");
        }
    };

    const handleDeleteEmployee = (employeeId) => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to delete this employee?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
        }).then((result) => {
            if (result.isConfirmed) {
                deleteEmployee(employeeId)
                    .then(response => {
                        if (response.error) {
                            Swal.fire('Error', 'Failed to delete the employee.', 'error');
                        } else {
                            Swal.fire('Deleted!', 'The employee has been deleted.', 'success');
                            refetch();
                        }
                    })
                    .catch((error) => {
                        console.log("Delete error:", error);
                        Swal.fire('Error', 'An unexpected error occurred while deleting the employee.', 'error');
                    });
            }
        });
    };

    const closeAndResetModal = () => {
        setIsModalOpen(false);
        setIsEditing(false);
        setCurrentEmployeeId(null);
        setFormValues({
            firstname: '',
            lastname: '',
            company_id: '',
            email: '',
            phone: ''
        });
        setErrors({});
    };

    return (
        <>
            <ToastContainer />
            <div className="flex justify-end p-4">
                <button
                    onClick={() => { setIsModalOpen(true); setIsEditing(false); }}
                    className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition"
                >
                    Add Employee
                </button>
            </div>

            <div className="p-6 bg-gray-100 min-h-screen flex justify-center">
                <div className="w-full max-w-6xl">
                    <h2 className="text-2xl font-semibold mb-4 text-center">Employee List</h2>
                    {isLoading ? (
                        <p className="text-center">Loading employees...</p>
                    ) : error ? (
                        <p className="text-red-500 text-center">Failed to load employees.</p>
                    ) : (
                        <table className="table-auto w-full border border-gray-300 shadow-lg rounded-lg overflow-hidden">
                            <thead className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                                <tr>
                                    <th className="py-3 px-4 text-left text-sm font-semibold">Sl No</th>
                                    <th className="py-3 px-4 text-left text-sm font-semibold">First Name</th>
                                    <th className="py-3 px-4 text-left text-sm font-semibold">Last Name</th>
                                    <th className="py-3 px-4 text-left text-sm font-semibold">Email</th>
                                    <th className="py-3 px-4 text-left text-sm font-semibold">Phone</th>
                                    <th className="py-3 px-4 text-left text-sm font-semibold">Company</th>
                                    <th className="py-3 px-4 text-left text-sm font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees?.data?.map((employee, index) => (
                                    <tr key={employee.id} className="bg-white border-b border-gray-200 hover:bg-gray-100 transition duration-300">
                                        <td className="py-3 px-4">{index + 1}</td>
                                        <td className="py-3 px-4">{employee?.firstname}</td>
                                        <td className="py-3 px-4">{employee?.lastname}</td>
                                        <td className="py-3 px-4">{employee?.email}</td>
                                        <td className="py-3 px-4">{employee?.phone}</td>
                                        <td className="py-3 px-4">{employee?.company_name}</td>
                                        <td className="py-3 px-4">
                                            <button onClick={() => handleEditClick(employee)} className="text-blue-500 hover:underline">
                                                <FaEdit />
                                            </button>
                                            <button onClick={() => handleDeleteEmployee(employee.id)} className="text-red-500 hover:underline ml-4">
                                                <MdDelete />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full">
                        <h3 className="text-xl font-semibold mb-4">{isEditing ? 'Edit Employee' : 'Add New Employee'}</h3>
                        <div className="space-y-4">
                            <input
                                type="text"
                                name="firstname"
                                placeholder="First Name"
                                value={formValues.firstname}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded"
                            />
                            {errors.firstname && <p className="text-red-500">{errors.firstname}</p>}

                            <input
                                type="text"
                                name="lastname"
                                placeholder="Last Name"
                                value={formValues.lastname}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded"
                            />
                            {errors.lastname && <p className="text-red-500">{errors.lastname}</p>}

                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formValues.email}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded"
                            />
                            {errors.email && <p className="text-red-500">{errors.email}</p>}

                            <input
                                type="text"
                                name="phone"
                                placeholder="Phone Number"
                                value={formValues.phone}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded"
                            />
                            {errors.phone && <p className="text-red-500">{errors.phone}</p>}

                            <select
                                name="company_id"
                                value={formValues.company_id}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded"
                            >
                                <option value="">Select Company</option>
                                {!companiesLoading && !companiesError && companies?.data?.map(company => (
                                    <option key={company.id} value={company.id}>{company.name}</option>
                                ))}
                            </select>
                            {errors.company_id && <p className="text-red-500">{errors.company_id}</p>}
                        </div>
                        <div className="flex justify-end space-x-4 mt-4">
                            <button
                                onClick={closeAndResetModal}
                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={isEditing ? handleUpdateEmployee : handleAddEmployee}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                {isEditing ? 'Update' : 'Submit'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default EmployeeTable;
