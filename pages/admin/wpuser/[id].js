import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useReducer, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import Layout from '../../../components/main/Layout';
import { getError } from '../../../utils/error';

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
    default:
      return state;
  }
}

export default function AdminUserEditScreen() {
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
    reset, 
  } = useForm();

  const [isAdmin, setEsAdmin] = useState(false);
  const [isApproved, setEsApproved] = useState(false);
  const [isActive, setEsActive] = useState(true);

  useEffect(() => {
    if (!userId) return; 

    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/admin/users/${userId}`);
        dispatch({ type: 'FETCH_SUCCESS' });

        reset({
          name: data.name || '',
          email: data.email || '',
          companyName: data.companyName || '',
          companyEinCode: data.companyEinCode || '',
          isAdmin: data.isAdmin || false,
          isApproved: data.isApproved || false,
          isActive: data.isActive ?? true, 
        });

        setEsAdmin(data.isAdmin || false);
        setEsApproved(data.isApproved || false);
        setEsActive(data.isActive ?? true);
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };

    fetchData();
  }, [userId, reset]);

  const router = useRouter();

  const submitHandler = async (formData) => {
    try {
      dispatch({ type: 'UPDATE_REQUEST' });

      await axios.put(`/api/admin/users/${userId}`, {
        ...formData,
        isAdmin,
        isApproved,
        isActive,
      });

      dispatch({ type: 'UPDATE_SUCCESS' });
      toast.success('User updated successfully');
      router.push('/admin/users');
    } catch (err) {
      dispatch({ type: 'UPDATE_FAIL', payload: getError(err) });
      toast.error(getError(err));
    }
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
            <form className="mx-auto max-w-screen-md" onSubmit={handleSubmit(submitHandler)}>
              <h1 className="mb-4 text-xl">{`Edit User ${userId.substring(userId.length - 8).toUpperCase()}`}</h1>

              <div className="mb-4">
                <label htmlFor="name">Name</label>
                <input {...register('name', { required: 'Please insert name' })} className="w-full px-3 py-2 border rounded" />
                {errors.name && <div className="text-red-500">{errors.name.message}</div>}
              </div>

              <div className="mb-4">
                <label htmlFor="email">Email</label>
                <input {...register('email', { required: 'Please insert email' })} className="w-full px-3 py-2 border rounded" />
                {errors.email && <div className="text-red-500">{errors.email.message}</div>}
              </div>

              <div className="mb-4">
                <label htmlFor="companyName">Company Name</label>
                <input {...register('companyName')} className="w-full px-3 py-2 border rounded" />
              </div>

              <div className="mb-4">
                <label htmlFor="companyEinCode">Company EIN Code</label>
                <input {...register('companyEinCode')} className="w-full px-3 py-2 border rounded" />
              </div>

              {/* Checkboxes */}
              <div className="mb-4">
                <label htmlFor="isAdmin">Is Admin?</label>
                <input type="checkbox" {...register('isAdmin')} checked={isAdmin} onChange={(e) => setEsAdmin(e.target.checked)} />
              </div>

              <div className="mb-4">
                <label htmlFor="isApproved">Is Approved?</label>
                <input type="checkbox" {...register('isApproved')} checked={isApproved} onChange={(e) => setEsApproved(e.target.checked)} />
              </div>

              <div className="mb-4">
                <label htmlFor="isActive">Is Active?</label>
                <input type="checkbox" {...register('isActive')} checked={isActive} onChange={(e) => setEsActive(e.target.checked)} />
              </div>

              <button disabled={loadingUpdate} className="primary-button">
                {loadingUpdate ? 'Loading' : 'Update'}
              </button>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
}

AdminUserEditScreen.auth = { adminOnly: true };
