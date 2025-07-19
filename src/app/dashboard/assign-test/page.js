'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';

export default function AssignTestPage() {
  const { register, handleSubmit, reset } = useForm();
  const [tests, setTests] = useState([]);
  const [assignedUser, setAssignedUser] = useState(null);

  // Fetch all tests to populate the dropdown
  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await axios.get('/api/admin/tests'); // <-- You should have this endpoint
        setTests(res.data.tests || []);
      } catch (err) {
        console.error('Failed to load tests', err);
      }
    };
    fetchTests();
  }, []);

  const onSubmit = async (data) => {
    try {
      const res = await axios.post('/api/admin/assign-test', data);
      setAssignedUser(res.data.user);
      reset();
    } catch (err) {
      console.error('Assignment failed:', err);
      alert(err.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Assign Test</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block font-medium">Test</label>
          <select
            {...register('testId', { required: true })}
            className="w-full p-2 border rounded"
          >
            <option value="">Select a test</option>
            {tests.map((test) => (
              <option key={test.id} value={test.id}>
                {test.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium">Test Taker Name</label>
          <input
            {...register('name', { required: true })}
            className="w-full p-2 border rounded"
            placeholder="Enter full name"
          />
        </div>

        <div>
          <label className="block font-medium">Email</label>
          <input
            {...register('email', { required: true })}
            type="email"
            className="w-full p-2 border rounded"
            placeholder="Enter email"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Assign Test
        </button>
      </form>

      {assignedUser && (
        <div className="mt-6 p-4 border rounded bg-green-50">
          <h3 className="text-lg font-semibold mb-2 text-green-700">Test Assigned Successfully!</h3>
          <p>
            <strong>Email:</strong> {assignedUser.email}
          </p>
          <p>
            <strong>Password:</strong> {assignedUser.password}
          </p>
        </div>
      )}
    </div>
  );
}
