import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useReducer, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import Layout from '../../../components/main/Layout';
import { getError } from '../../../utils/error';
import CustomAlertModal from '../../../components/main/CustomAlertModal';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, error: '' };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };

    case 'UPDATE_REQUEST':
      return { ...state, loadingUpdate: true, errorUpdate: '' };
    case 'UPDATE_SUCCESS':
      return { ...state, loadingUpdate: false, errorUpdate: '' };
    case 'UPDATE_FAIL':
      return { ...state, loadingUpdate: false, errorUpdate: action.payload };

    case 'UPLOAD_REQUEST':
      return { ...state, loadingUpload: true, errorUpload: '' };
    case 'UPLOAD_SUCCESS':
      return {
        ...state,
        loadingUpload: false,
        errorUpload: '',
      };
    case 'UPLOAD_FAIL':
      return { ...state, loadingUpload: false, errorUpload: action.payload };

    default:
      return state;
  }
}
export default function AdminUserEditScreen() {
  const [isAdmin, setEsAdmin] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [ showModal, setShowModal ] = useState(false);
  const { query } = useRouter();
  const userId = query.id;
  const [{ loading, error, loadingUpdate }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const response = await axios.get(`/api/admin/users/${userId}`);
        const data = response.data.user;
        dispatch({ type: 'FETCH_SUCCESS' });
        setValue('name', data.name);
        setValue('email', data.email);
        setValue('companyName', data.companyName);
        setValue('companyEinCode', data.companyEinCode);
        setValue('isAdmin', data.isAdmin);
        setValue('active', data.active);
        setValue('approved', data.approved);
        setEsAdmin(data.isAdmin);
        setIsActive(data.active);
        setIsApproved(data.approved);
      } catch (error) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(error) });
      }
    };

    fetchData();
  }, [userId, setValue]);

  const router = useRouter();

  const submitHandler = async ({ name, email, password, companyName, companyEinCode }) => {
    try {
      dispatch({ type: 'UPDATE_REQUEST' });
      await axios.put(`/api/admin/users/${userId}`, {
        name,
        email,
        password,
        companyName: companyName || '',
        companyEinCode: companyEinCode || '',
        isAdmin,
        active: isActive,
        approved: isApproved,
      });
      dispatch({ type: 'UPDATE_SUCCESS' }); 
      setShowModal(true);
    } catch (error) {
      dispatch({ type: 'UPDATE_FAIL', payload: getError(error) });
      toast.error(getError(error));
    }
  };

  const handleAlertConfirm = () => {
    setShowModal(false);
    router.push('/admin/users');
  };

  return (
    <Layout title={`Editar Usuario ${userId}`}>
      <div className="grid md:grid-cols-4 md:gap-5">
        <div>
          <ul>
            <li>
              <Link href="/admin/dashboard">Dashboard</Link>
            </li>
            <li>
              <Link href="/admin/orders">Orders</Link>
            </li>
            <li>
              <Link href="/admin/products">Products</Link>
            </li>
            <li>
              <Link href="/admin/users" className="font-bold">
                Usuarios
              </Link>
            </li>
          </ul>
        </div>
        <div className="md:col-span-3">
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="alert-error">{error}</div>
          ) : (
            <form
              className="mx-auto max-w-screen-md"
              onSubmit={handleSubmit(submitHandler)}
            >
              <h1 className="mb-4 text-xl">{`Edit User ${userId
                .substring(userId.length - 8)
                .toUpperCase()}`}</h1>
                <div className="flex gap-4 my-4">
                  <label htmlFor="isAdmin">
                    &nbsp;
                    <input
                      type="checkbox"
                      id="esAdmin"
                      {...register('isAdmin')}
                      checked={isAdmin}
                      onChange={(e) => {
                        setValue('isAdmin', e.target.checked);
                        setEsAdmin(e.target.checked);
                      }}
                    />
                     &nbsp;
                    <span>Is Admin?</span>
                  </label>
                  <label htmlFor="active">
                    &nbsp;
                    <input
                      type="checkbox"
                      id="active"
                     {...register('active')}
                      checked={isActive}
                      onChange={(e) => {
                        setValue('active', e.target.checked);
                        setIsActive(e.target.checked);
                      }}
                    />
                     &nbsp;
                    <span>Is Active?</span>
                  </label>

                  <label htmlFor="approved">
                    &nbsp;
                    <input
                      type="checkbox"
                      id="approved"
                      {...register('approved')}
                      checked={isApproved}
                      onChange={(e) => {
                        setValue('approved', e.target.checked);
                        setIsApproved(e.target.checked);
                      }}
                    />
                     &nbsp;
                    <span>Is Approved?</span>
                  </label>
                </div>

              <div className="mb-4">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                  id="name"
                  autoFocus
                  {...register('name', {
                    required: 'Please insert name',
                  })}
                />
                {errors.name && (
                  <div className="text-red-500">{errors.name.message}</div>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                  id="email"
                  {...register('email', {
                    required: 'Please insert email',
                  })}
                />
                {errors.email && (
                  <div className="text-red-500">{errors.email.message}</div>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="companyName">Company Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                  id="companyName"
                  autoFocus
                  {...register('companyName', {
                    required: 'Please insert companyName',
                  })}
                />
                {errors.companyName && (
                  <div className="text-red-500">{errors.companyName.message}</div>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="companyEinCode">company Ein Code</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                  id="companyEinCode"
                  autoFocus
                  {...register('companyEinCode', {
                    required: 'Please insert companyEinCode',
                  })}
                />
                {errors.companyEinCode && (
                  <div className="text-red-500">{errors.companyEinCode.message}</div>
                )}
              </div>

              <div className="flex flex-row">
                <div className="mb-4">
                  <button
                    disabled={loadingUpdate}
                    className="primary-button mr-2"
                  >
                    {loadingUpdate ? 'Loading' : 'Update'}
                  </button>
                </div>
                <div className="mb-4">
                  <button
                    onClick={() => router.push(`/`)}
                    className="primary-button"
                  >
                    Back
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
      <CustomAlertModal 
        isOpen={showModal}
        message={{
          title: 'User Updated Successfully',
          body: 'The changes have been saved correctly.',
          warning: 'This action can be modified later.',
        }}
        onConfirm={handleAlertConfirm}
      />
    </Layout>
  );
}

AdminUserEditScreen.auth = { adminOnly: true };