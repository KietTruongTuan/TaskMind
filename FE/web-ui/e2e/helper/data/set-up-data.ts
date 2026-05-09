const API_BASE_URL = 'http://localhost:8000';

async function getAccessToken() {
  const res = await fetch(`${API_BASE_URL}/v1/accounts/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'example@gmail.com',
      password: 'ExamplePassword123'
    })
  });

  if (!res.ok) {
    throw new Error(`API Login failed: ${res.statusText}`);
  }

  const data = await res.json();
  return data.access;
}

export async function deleteAllGoals() {
  const token = await getAccessToken();

  const res = await fetch(`${API_BASE_URL}/v1/goals`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!res.ok) return;

  const data = await res.json();
  const goals = data.goals || [];

  for (const goal of goals) {
    await fetch(`${API_BASE_URL}/v1/goals/${goal.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }
}

export async function initializeGoalData() {
  const token = await getAccessToken();
  const goalData = [
    {
      name: 'Goal 1',
      description: 'Description 1',
      status: "ToDo",
      tag: ['Tag 1', 'Tag 2'],
      deadline: '2026-12-30',
      tasks: [
        { name: 'Task 11', status: 'ToDo', deadline: '2026-12-31' },
        { name: 'Task 12', status: 'InProgress', deadline: '2026-12-31' },
        { name: 'Task 13', status: 'Completed', deadline: '2026-12-31' },
        { name: 'Task 14', status: 'OnHold', deadline: '2026-12-31' },
        { name: 'Task 15', status: 'Cancelled', deadline: '2026-12-31' },
      ]
    },
    {
      name: 'Goal 2',
      description: 'Description 2',
      status: "InProgress",
      tag: ['Tag 3', 'Tag 4'],
      deadline: '2026-12-31',
      tasks: [
        { name: 'Task 21', status: 'ToDo', deadline: '2026-12-31' },
        { name: 'Task 22', status: 'InProgress', deadline: '2026-12-31' },
        { name: 'Task 23', status: 'Completed', deadline: '2026-12-31' },
        { name: 'Task 24', status: 'InProgress', deadline: '2026-12-31' },
        { name: 'Task 25', status: 'Completed', deadline: '2026-12-31' },
      ]
    },
    {
      name: 'Goal 3',
      description: 'Description 3',
      status: "Completed",
      tag: ['Tag 5', 'Tag 6'],
      deadline: '2026-12-31',
      tasks: [
        { name: 'Task 31', status: 'ToDo', deadline: '2026-12-31' },
        { name: 'Task 32', status: 'ToDo', deadline: '2026-12-31' },
        { name: 'Task 33', status: 'Completed', deadline: '2026-12-31' },
        { name: 'Task 34', status: 'OnHold', deadline: '2026-12-31' },
        { name: 'Task 35', status: 'Cancelled', deadline: '2026-12-31' },
      ]
    },
    {
      name: 'Goal 4',
      description: 'Description 4',
      status: "OnHold",
      tag: ['Tag 7', 'Tag 8'],
      deadline: '2026-12-31',
      tasks: [
        { name: 'Task 41', status: 'ToDo', deadline: '2026-12-31' },
        { name: 'Task 42', status: 'InProgress', deadline: '2026-12-31' },
        { name: 'Task 43', status: 'Completed', deadline: '2026-12-31' },
        { name: 'Task 44', status: 'OnHold', deadline: '2026-12-31' },
        { name: 'Task 45', status: 'Cancelled', deadline: '2026-12-31' },
      ]
    }
  ];
  for (const goal of goalData) {
    const res = await fetch(`${API_BASE_URL}/v1/goals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(goal)
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`Failed to create goal: ${JSON.stringify(error)}`);
    }
  }
}
