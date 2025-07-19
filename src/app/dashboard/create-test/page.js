'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';

export default function CreateTestPage() {
  const { register, handleSubmit, setValue, watch } = useForm();
  const [quizzes, setQuizzes] = useState([]);
  const [questions, setQuestions] = useState([]);
  const selectedQuizId = watch('quizId');

  // Fetch quizzes
  useEffect(() => {
    axios.get('/api/admin/quizzes')
      .then(res => setQuizzes(res.data.quizzes || []))
      .catch(err => console.error('Error fetching quizzes', err));
  }, []);

  // Fetch questions when quiz changes
  useEffect(() => {
    if (!selectedQuizId) return;
    axios.get(`/api/admin/quizzes/${selectedQuizId}/questions`)
      .then(res => setQuestions(res.data.questions || []))
      .catch(err => console.error('Error fetching questions', err));
  }, [selectedQuizId]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        name: data.name,
        date: data.date,
        duration: parseInt(data.duration),
        quizId: data.quizId,
        questionIds: data.questionIds || [],
      };

      const res = await axios.post('/api/admin/tests', payload);
      alert('Test created successfully!');
    } catch (err) {
      console.error('Error creating test', err);
      alert(err.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Create Test</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Test Name */}
        <div>
          <label className="block font-medium">Test Name</label>
          <input
            {...register('name', { required: true })}
            className="w-full p-2 border rounded"
            placeholder="e.g. Frontend Intern Final Test"
          />
        </div>

        {/* Test Date */}
        <div>
          <label className="block font-medium">Date</label>
          <input
            {...register('date', { required: true })}
            type="date"
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Duration */}
        <div>
          <label className="block font-medium">Duration (in minutes)</label>
          <input
            {...register('duration', { required: true })}
            type="number"
            className="w-full p-2 border rounded"
            placeholder="e.g. 60"
          />
        </div>

        {/* Select Quiz */}
        <div>
          <label className="block font-medium">Select Quiz</label>
          <select
            {...register('quizId', { required: true })}
            className="w-full p-2 border rounded"
          >
            <option value="">-- Select Quiz --</option>
            {quizzes.map((quiz) => (
              <option key={quiz.id} value={quiz.id}>
                {quiz.title}
              </option>
            ))}
          </select>
        </div>

        {/* Select Questions */}
        {questions.length > 0 && (
          <div>
            <label className="block font-medium mb-1">Select Questions</label>
            <div className="space-y-2 max-h-64 overflow-y-auto border p-3 rounded">
              {questions.map((q) => (
                <div key={q.id} className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    {...register('questionIds')}
                    value={q.id}
                    className="mt-1"
                  />
                  <span>{q.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Create Test
        </button>
      </form>
    </div>
  );
}
