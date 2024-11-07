

import { useState } from 'react';
import { useAddCompanyMutation, useAllCompanyQuery, useUpdateCompanyMutation, useDeleteCompanyMutation } from '../../features/api/Company/company';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

const CompanyTable = () => {
    const { data: companies, isLoading, error, refetch } = useAllCompanyQuery();
    const [addCompany] = useAddCompanyMutation();
    const [updateCompany] = useUpdateCompanyMutation();
    const [deleteCompany] = useDeleteCompanyMutation(); // Add the delete mutation hook

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCompanyId, setCurrentCompanyId] = useState(null);
    const [existingLogo, setExistingLogo] = useState(null);
    const [newLogoPreview, setNewLogoPreview] = useState(null);

    const [formValues, setFormValues] = useState({
        name: '',
        email: '',
        website: '',
        imageUrl: [],
    });
    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues({ ...formValues, [name]: value });
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setFormValues({ ...formValues, imageUrl: files });

        if (files.length > 0) {
            const previewUrl = URL.createObjectURL(files[0]);
            setNewLogoPreview(previewUrl);
        }
    };

    const validateForm = () => {
        let formErrors = {};
        if (!formValues.name) formErrors.name = "Company name is required";
        if (!formValues.email) formErrors.email = "Email is required";
        if (!formValues.website) formErrors.website = "Website is required";
        if (formValues.imageUrl.length === 0 && !existingLogo) formErrors.imageUrl = "At least one image is required";

        setErrors(formErrors);
        return Object.keys(formErrors).length === 0;
    };

    const handleAddCompany = async () => {
        if (!validateForm()) return;

        const formData = new FormData();
        Object.keys(formValues).forEach((key) => {
            if (key === 'imageUrl') {
                formValues.imageUrl.forEach((file) => formData.append('imageUrl', file));
            } else {
                formData.append(key, formValues[key]);
            }
        });

        try {
            const response = await addCompany(formData);

            if (response.error) {
                const { status } = response.error;
                if (status === 400) {
                    return toast.error(response.error.data.message);
                } else {
                    return toast.error("An error occurred while adding the company.");
                }
            }

            toast.success('Company added successfully!');
            refetch();
            closeAndResetModal();
        } catch (error) {
            console.log("Unexpected error:", error);
            toast.error("Unexpected error occurred. Please try again.");
        }
    };

    const handleEditClick = (company) => {
        setIsEditing(true);
        setIsModalOpen(true);
        setCurrentCompanyId(company.id);
        setExistingLogo(company.logo);
        setNewLogoPreview(null);
        setFormValues({
            name: company.name,
            email: company.email,
            website: company.website,
            imageUrl: [],
        });
    };

    const handleUpdateCompany = async () => {
        if (!validateForm()) return;

        const formData = new FormData();
        Object.keys(formValues).forEach((key) => {
            if (key === 'imageUrl') {
                formValues.imageUrl.forEach((file) => formData.append('imageUrl', file));
            } else {
                formData.append(key, formValues[key]);
            }
        });

        try {
            const response = await updateCompany({ id: currentCompanyId, values: formData });

            if (response.error) {
                const { status } = response.error;
                if (status === 400) {
                    return toast.error(response.error.data.message);
                } else {
                    return toast.error("An error occurred while updating the company.");
                }
            }

            toast.success('Company updated successfully!');
            refetch();
            closeAndResetModal();
        } catch (error) {
            console.log("Unexpected error:", error);
            toast.error("Unexpected error occurred. Please try again.");
        }
    };

    // Function to handle delete company with SweetAlert2
    const handleDeleteCompany = (companyId) => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to delete this company?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
        }).then((result) => {
            if (result.isConfirmed) {
                deleteCompany(companyId)
                    .then(response => {
                        if (response.error) {
                            Swal.fire('Error', 'Failed to delete the company.', 'error');
                        } else {
                            Swal.fire('Deleted!', 'The company has been deleted.', 'success');
                            refetch();
                        }
                    })
                    .catch((error) => {
                        console.log("Delete error:", error);
                        Swal.fire('Error', 'An unexpected error occurred while deleting the company.', 'error');
                    });
            }
        });
    };

    const closeAndResetModal = () => {
        setIsModalOpen(false);
        setIsEditing(false);
        setCurrentCompanyId(null);
        setExistingLogo(null);
        setNewLogoPreview(null);
        setFormValues({
            name: '',
            email: '',
            website: '',
            imageUrl: [],
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
                    Add Company
                </button>
            </div>

            <div className="p-6 bg-gray-100 min-h-screen flex justify-center">
                <div className="w-full max-w-6xl">
                    <h2 className="text-2xl font-semibold mb-4 text-center">Company List</h2>
                    {isLoading ? (
                        <p className="text-center">Loading companies...</p>
                    ) : error ? (
                        <p className="text-red-500 text-center">Failed to load companies.</p>
                    ) : (
                        <table className="table-auto w-full border border-gray-300 shadow-lg rounded-lg overflow-hidden">
                            <thead className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                                <tr>
                                    <th className="py-3 px-4 text-left text-sm font-semibold">Sl No</th>
                                    <th className="py-3 px-4 text-left text-sm font-semibold">Company Name</th>
                                    <th className="py-3 px-4 text-left text-sm font-semibold">Email</th>
                                    <th className="py-3 px-4 text-left text-sm font-semibold">Website</th>
                                    <th className="py-3 px-4 text-left text-sm font-semibold">Logo</th>
                                    <th className="py-3 px-4 text-left text-sm font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {companies?.data?.map((company, index) => (
                                    <tr key={company.id} className="bg-white border-b border-gray-200 hover:bg-gray-100 transition duration-300">
                                        <td className="py-3 px-4">{index + 1}</td>
                                        <td className="py-3 px-4">{company.name}</td>
                                        <td className="py-3 px-4">{company.email}</td>
                                        <td className="py-3 px-4">{company.website}</td>
                                        <td className="py-3 px-4">
                                            <img style={{ width: '50px', height: '50px' }} src={company.logo} alt={company.name} />
                                        </td>
                                        <td className="py-3 px-4">
                                            <button onClick={() => handleEditClick(company)} className="text-blue-500 hover:underline">
                                                <FaEdit/>
                                            </button>
                                            <button onClick={() => handleDeleteCompany(company.id)} className="text-red-500 hover:underline ml-4">
                                                <MdDelete/>
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
                        <h3 className="text-xl font-semibold mb-4">{isEditing ? 'Edit Company' : 'Add New Company'}</h3>
                        <div className="space-y-4">
                            <input
                                type="text"
                                name="name"
                                placeholder="Company Name"
                                value={formValues.name}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded"
                            />
                            {errors.name && <p className="text-red-500">{errors.name}</p>}

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
                                name="website"
                                placeholder="Website"
                                value={formValues.website}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded"
                            />
                            {errors.website && <p className="text-red-500">{errors.website}</p>}

                            <input
                                type="file"
                                name="imageUrl"
                                multiple
                                onChange={handleImageChange}
                                className="w-full p-2 border border-gray-300 rounded"
                            />
                            {errors.imageUrl && <p className="text-red-500">{errors.imageUrl}</p>}

                            {/* Display existing or new logo when editing */}
                            <div>
                                <p className="text-gray-500">Logo:</p>
                                {newLogoPreview ? (
                                    <img src={newLogoPreview} alt="New Logo Preview" style={{ width: '100px', height: '100px' }} />
                                ) : (
                                    isEditing && existingLogo && (
                                        <img src={existingLogo} alt="Current Logo" style={{ width: '100px', height: '100px' }} />
                                    )
                                )}
                            </div>
                        </div>
                        <div className="flex justify-end space-x-4 mt-4">
                            <button
                                onClick={closeAndResetModal}
                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={isEditing ? handleUpdateCompany : handleAddCompany}
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

export default CompanyTable;