"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useForm, useFieldArray } from "react-hook-form";

export default function QuizSetup() {
  const [positions, setPositions] = useState([]);
  const [selectedPositionId, setSelectedPositionId] = useState("");
  const [quizzes, setQuizzes] = useState([]);

  const { register, handleSubmit, control, reset } = useForm({
    defaultValues: {
      quizTitle: "",
      groups: [
        {
          name: "",
          questions: [
            {
              text: "",
              type: "text",
              options: ["", ""],
              correctAnswers: [],
            },
          ],
        },
      ],
    },
  });

  const { fields: groupFields, append: appendGroup } = useFieldArray({
    control,
    name: "groups",
  });

  const fetchPositions = async () => {
    await axios
      .get("/api/admin/positions")
      .then((res) => setPositions(res.data));
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  const onPositionSelect = async (e) => {
    const id = e.target.value;
    setSelectedPositionId(id);
    const res = await axios.get(`/api/admin/quizzes?positionId=${id}`);
    setQuizzes(res.data);
  };

  const onSubmit = async (data) => {
    const quizRes = await axios.post("/api/admin/quizzes", {
      positionId: selectedPositionId,
      title: data.quizTitle,
    });

    for (const group of data.groups) {
      const groupRes = await axios.post("/api/admin/groups", {
        quizId: quizRes.data.id,
        name: group.name,
      });

      for (const q of group.questions) {
        await axios.post("/api/admin/questions", {
          groupId: groupRes.data.id,
          text: q.text,
          type: q.type,
          options: q.options,
          correctAnswers: q.correctAnswers,
        });
      }
    }

    reset();
    alert("Quiz Created Successfully!");
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Quiz Setup</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block font-medium mb-2">Select Position</label>
          <select
            className="w-full border p-2"
            onChange={onPositionSelect}
            required
          >
            <option value="">-- Select Position --</option>
            {positions.map((pos) => (
              <option key={pos.id} value={pos.id}>
                {pos.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-2">Quiz Title</label>
          <input
            type="text"
            className="w-full border p-2"
            {...register("quizTitle", { required: true })}
          />
        </div>

        {groupFields.map((group, groupIndex) => (
          <div key={group.id} className="border rounded-lg p-4 bg-gray-50">
            <h2 className="font-semibold mb-2">Group {groupIndex + 1}</h2>
            <input
              className="w-full border p-2 mb-4"
              placeholder="Group Name"
              {...register(`groups.${groupIndex}.name`, { required: true })}
            />

            <div className="space-y-4">
              <div className="font-medium">Questions:</div>
              <div className="space-y-4">
                <input
                  className="w-full border p-2"
                  placeholder="Question Text"
                  {...register(`groups.${groupIndex}.questions.0.text`, {
                    required: true,
                  })}
                />
                <select
                  className="w-full border p-2"
                  {...register(`groups.${groupIndex}.questions.0.type`)}
                >
                  <option value="text">Open Text</option>
                  <option value="mcq">Multiple Choice</option>
                </select>

                <div className="grid grid-cols-2 gap-2">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i}>
                      <input
                        className="w-full border p-2"
                        placeholder={`Option ${i + 1}`}
                        {...register(
                          `groups.${groupIndex}.questions.0.options.${i}`
                        )}
                      />
                      <input
                        type="checkbox"
                        {...register(
                          `groups.${groupIndex}.questions.0.correctAnswers`
                        )}
                        value={i}
                      />{" "}
                      Correct
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() =>
              appendGroup({
                name: "",
                questions: [
                  { text: "", type: "text", options: [], correctAnswers: [] },
                ],
              })
            }
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Add Group
          </button>

          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded"
          >
            Create Quiz
          </button>
        </div>
      </form>
    </div>
  );
}
