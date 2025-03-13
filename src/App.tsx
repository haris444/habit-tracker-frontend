import { useEffect, useState } from "react";
import HabitCard from "./components/HabitCard";
import DateSetter from "./components/DateSetter";
import ThemeToggle from "./theme/ThemeToggle";
import { Habit, createHabit, deleteHabit, getCompletionCounts, getCurrentDate, getHabits } from "./services/apiService";
import { User, getUser, isAuthenticated, login, logout, register } from "./services/authService";

function App() {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [newHabit, setNewHabit] = useState("");
    const [user, setUser] = useState<User | null>(null);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [completionCounts, setCompletionCounts] = useState<Record<string, number>>({});
    const [currentDate, setCurrentDate] = useState<string | null>(null); // Backend date

    // Check if user is already authenticated
    useEffect(() => {
        const loggedInUser = getUser();
        if (loggedInUser) {
            setUser(loggedInUser);
        }
    }, []);

    const handleLogin = async () => {
        try {
            const loggedInUser = await login(username, password);
            setUser(loggedInUser);
            setUsername(""); // Clear input fields
            setPassword("");
        } catch (error) {
            console.error("Login failed:", error);
            alert("Invalid credentials");
        }
    };

    const handleRegister = async () => {
        try {
            const newUser = await register(username, password);
            setUser(newUser);
            setUsername(""); // Clear input fields
            setPassword("");
        } catch (error) {
            console.error("Registration failed:", error);
            alert("Username taken or error");
        }
    };

    const handleLogout = () => {
        logout();
        setUser(null);
        setHabits([]);
        setCompletionCounts({});
        setCurrentDate(null);
    };

    const fetchCurrentDate = async () => {
        try {
            const date = await getCurrentDate();
            setCurrentDate(date); // "2025-03-13"
            console.log("Backend date:", date);
            return date;
        } catch (error) {
            console.error("Failed to fetch current date:", error);
            return null;
        }
    };

    const fetchHabits = async () => {
        try {
            const fetchedHabits = await getHabits();
            console.log("Fetched habits with streaks:", fetchedHabits.map(h => `${h.name}: ${h.streak}`));

            // Completely replace the habits state with new array
            setHabits([...fetchedHabits]);
            return fetchedHabits;
        } catch (error) {
            console.error("Failed to fetch habits:", error);
            return [];
        }
    };

    const fetchCompletionCounts = async (date: string) => {
        try {
            const now = new Date(date);
            const start = new Date(now.getFullYear(), now.getMonth(), 1);
            const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

            const counts = await getCompletionCounts(
                start.toISOString().split("T")[0],
                end.toISOString().split("T")[0]
            );
            console.log("Completion counts fetched:", counts);
            setCompletionCounts(counts);
            return counts;
        } catch (error) {
            console.error("Failed to fetch completion counts:", error);
            return {};
        }
    };

    // Main data initialization function
    const initializeData = async () => {
        if (!isAuthenticated()) return;

        try {
            // First get current date
            const date = await fetchCurrentDate();
            if (!date) return;

            // Then get habits
            await fetchHabits();

            // Then get completion counts with the fetched date
            await fetchCompletionCounts(date);
        } catch (error) {
            console.error("Data initialization failed:", error);
        }
    };
/*
    // Refresh data when needed (separate from initialization)
    const refreshData = async () => {
        if (!isAuthenticated() || !currentDate) return;
        await fetchHabits();
        await fetchCompletionCounts(currentDate);
    };*/

    // Run initialization when user changes (on login/register)
    useEffect(() => {
        if (user) {
            initializeData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const addHabit = async () => {
        if (!newHabit || !isAuthenticated()) return;
        try {
            const habit = await createHabit(newHabit);
            setHabits([...habits, habit]);
            setNewHabit("");

            // Refresh completion counts after adding habit
            if (currentDate) {
                await fetchCompletionCounts(currentDate);
            }
        } catch (error) {
            console.error("Failed to add habit:", error);
        }
    };

    const removeHabit = async (id: number) => {
        try {
            await deleteHabit(id);
            setHabits(habits.filter((habit) => habit.id !== id));

            // Refresh completion counts after deleting habit
            if (currentDate) {
                await fetchCompletionCounts(currentDate);
            }
        } catch (error) {
            console.error("Failed to delete habit:", error);
        }
    };

    const updateHabit = async (updatedHabit: Habit) => {
        try {
            setHabits(habits.map((habit) => (habit.id === updatedHabit.id ? updatedHabit : habit)));

            // Refresh data after updating a habit
            const date = await fetchCurrentDate();
            if (date) {
                await fetchCompletionCounts(date);
            }
        } catch (error) {
            console.error("Failed to update habit:", error);
        }
    };

    // Calendar Logic
    const now = currentDate ? new Date(currentDate) : new Date(); // Use backend date or fallback
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const daysInMonth = monthEnd.getDate();
    const firstDay = monthStart.getDay();
    const totalHabits = habits.length;
    const getColor = (count: number) => {
        if (totalHabits === 0) return { backgroundColor: "var(--bg-tertiary)" };
        const ratio = count / totalHabits;
        if (ratio === 0) return { backgroundColor: "var(--calendar-color-red)" };
        if (ratio >= 1) return { backgroundColor: "var(--calendar-color-green)" };
        const percent = ratio * 100;
        return {
            background: `linear-gradient(to right, var(--calendar-color-red), var(--calendar-color-yellow) ${percent}%, var(--calendar-color-green) ${percent}%)`,
        };
    };
    const monthName = now.toLocaleString("default", { month: "long" });

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
                <div className="p-6 rounded-lg flex flex-col" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                    <div className="flex justify-end mb-2">
                        <ThemeToggle />
                    </div>
                    <h1 className="text-2xl mb-4">Login or Register</h1>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                        className="w-full p-2 mb-2 rounded"
                        style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }}
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full p-2 mb-4 rounded"
                        style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }}
                    />
                    <div className="flex gap-4">
                        <button
                            onClick={handleLogin}
                            className="px-4 py-2 rounded hover:opacity-90"
                            style={{ backgroundColor: 'var(--button-primary)', color: 'white' }}
                        >
                            Login
                        </button>
                        <button
                            onClick={handleRegister}
                            className="px-4 py-2 rounded hover:opacity-90"
                            style={{ backgroundColor: 'var(--button-primary)', color: 'white' }}
                        >
                            Register
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
            <div className="max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Habit Tracker (User: {user.username})</h1>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 rounded hover:opacity-90"
                            style={{ backgroundColor: 'var(--button-delete)', color: 'white' }}
                        >
                            Logout
                        </button>
                    </div>
                </div>
                <div className="flex mb-6">
                    <input
                        type="text"
                        value={newHabit}
                        onChange={(e) => setNewHabit(e.target.value)}
                        placeholder="New habit..."
                        className="flex-1 p-2 rounded-l-lg"
                        style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }}
                    />
                    <button
                        onClick={addHabit}
                        className="px-4 py-2 rounded-r-lg hover:opacity-90"
                        style={{ backgroundColor: 'var(--button-primary)', color: 'white' }}
                    >
                        Add
                    </button>
                </div>
                <div className="space-y-4">
                    {habits.map((habit) => (
                        <div key={habit.id} className="flex items-center gap-4">
                            <HabitCard
                                habit={habit}
                                onUpdate={updateHabit}
                            />
                            <button
                                onClick={() => removeHabit(habit.id)}
                                className="hover:opacity-90"
                                style={{ color: 'var(--button-delete)' }}
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
                {/* Calendar */}
                <div className="mt-8">
                    <h2 className="text-2xl font-bold mb-4">
                        {monthName} {now.getFullYear()}
                    </h2>
                    <div className="grid grid-cols-7 gap-2 text-center">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                            <div key={day} className="font-bold">{day}</div>
                        ))}
                        {Array(firstDay).fill(null).map((_, i) => (
                            <div key={`empty-${i}`} />
                        ))}
                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                            const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                            const count = completionCounts[dateStr] || 0;
                            const isPast = day <= now.getDate();
                            return (
                                <div key={day} className="relative flex items-center justify-center h-10">
                                    {isPast ? (
                                        <div
                                            className="w-6 h-6 rounded-full"
                                            style={getColor(count)}
                                            title={`${count}/${totalHabits} completions`}
                                        />
                                    ) : null}
                                    <span className="absolute z-10">{day}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="mt-12 pt-6" style={{ borderTop: `1px solid var(--bg-tertiary)` }}>
                    <h2 className="text-xl font-bold mb-4">Testing Tools</h2>
                    <DateSetter
                        onDateSet={initializeData}
                        currentDate={currentDate}
                    />
                </div>
            </div>
        </div>
    );
}

export default App;