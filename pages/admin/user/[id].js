import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useReducer, useState } from 'react';
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
  const [isAdmin, setIsAdmin] = useState(false);
  const { query } = useRouter();
  const [loaded, setLoaded] = useState(false);
  const userId = query.id;
  const [{ loading, error, loadingUpdate }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });
  

 const defaultValues = useMemo(() => ({
  name: '',
  email: '',
  companyName: '',
  companyEinCode: '',
  isAdmin: false,
  active: false,
  approved: false,
}), []);

const { register, handleSubmit, formState: { errors }, reset } = useForm({ defaultValues });
  useEffect(() => {
    if (!userId || loaded) return;  // Avoid loading data more than once  
  
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/admin/users/${userId}`);
        console.log('Datos recibidos:', data); 
  
        reset({
          name: data.name || '',
          email: data.email || '',
          companyName: data.companyName || '',
          companyEinCode: data.companyEinCode || '',
          isAdmin: data.isAdmin || false,
          active: data.active ?? false,
          approved: data.approved ?? false,
        });
  
        setIsAdmin(data.isAdmin || false);
        setLoaded(true); //  Mark as charged to avoid unnecessary reloads 
        dispatch({ type: 'FETCH_SUCCESS' });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
  
    fetchData();
  }, [userId, reset]);

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
            <form
              className="mx-auto max-w-screen-md"
              onSubmit={handleSubmit(submitHandler)}
            >
              <h1 className="mb-4 text-xl">{`Edit User ${userId
                .substring(userId.length - 8)
                .toUpperCase()}`}</h1>
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

              <div className="mb-4">
                <label htmlFor="isAdmin">Is Admin?</label>
                &nbsp;
                <input
                  type="checkbox"
                  id="isAdmin"
                  {...register('isAdmin')}
                />
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
    </Layout>
  );
}

AdminUserEditScreen.auth = { adminOnly: true };