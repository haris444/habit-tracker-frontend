import { useEffect, useState, useCallback } from "react";
import HabitCard from "./components/HabitCard";
import DateSetter from "./components/DateSetter";
import ThemeToggle from "./theme/ThemeToggle";
import { Habit, createHabit, deleteHabit, getCompletionCounts, getCurrentDate, getHabits } from "./services/apiService";
import { User, getUser, isAuthenticated, login, logout, register } from "./services/authService";
import LoadingSpinner from "./components/LoadingSpinner";
import WhyThisAppIsCool from "./components/WhyThisAppIsCool"

function App() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabit, setNewHabit] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [completionCounts, setCompletionCounts] = useState<Record<string, number>>({});
  const [currentDate, setCurrentDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // For initial data fetch (Render spin-up)
  const [isAuthLoading, setIsAuthLoading] = useState(false); // For login/register only
  const [isAddingHabit, setIsAddingHabit] = useState(false); // New state for Add button loading

  // Set document title dynamically
  useEffect(() => {
    if (user) {
      document.title = `Habit Tracker - ${user.username}`;
    } else {
      document.title = "Habit Tracker by Theo";
    }
  }, [user]);

  // Check if user is already authenticated
  useEffect(() => {
    const loggedInUser = getUser();
    if (loggedInUser) {
      setUser(loggedInUser);
    }
  }, []);

  const handleLogin = async () => {
    setIsAuthLoading(true); // Show spinner during login
    try {
      const loggedInUser = await login(username, password);
      setUser(loggedInUser);
      setUsername("");
      setPassword("");
      await initializeData();
    } catch (error) {
      console.error("Login failed:", error);
      alert("Invalid credentials");
    } finally {
      setIsAuthLoading(false); // Hide spinner
    }
  };

  const handleRegister = async () => {
    setIsAuthLoading(true); // Show spinner during register
    try {
      const newUser = await register(username, password);
      setUser(newUser);
      setUsername("");
      setPassword("");
      await initializeData();
    } catch (error) {
      console.error("Registration failed:", error);
      alert("Username taken or error");
    } finally {
      setIsAuthLoading(false); // Hide spinner
    }
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setHabits([]);
    setCompletionCounts({});
    setCurrentDate(null);
  };

  const fetchCurrentDate = useCallback(async () => {
    try {
      const date = await getCurrentDate();
      setCurrentDate(date);
      console.log("Backend date:", date);
      return date;
    } catch (error) {
      console.error("Failed to fetch current date:", error);
      return null;
    }
  }, []);

  const fetchHabits = useCallback(async () => {
    try {
      const fetchedHabits = await getHabits();
      console.log("Fetched habits with streaks:", fetchedHabits.map(h => `${h.name}: ${h.streak}`));
      setHabits([...fetchedHabits]);
      return fetchedHabits;
    } catch (error) {
      console.error("Failed to fetch habits:", error);
      return [];
    }
  }, []);

  const fetchCompletionCounts = useCallback(async (date: string) => {
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
  }, []);

  const initializeData = useCallback(async () => {
    if (!isAuthenticated()) return;

    try {
      const date = await fetchCurrentDate();
      if (!date) return;

      await fetchHabits();
      await fetchCompletionCounts(date);
    } catch (error) {
      console.error("Data initialization failed:", error);
    }
  }, [fetchCurrentDate, fetchHabits, fetchCompletionCounts]);

  useEffect(() => {
    if (user) {
      setIsLoading(true); // Show spinner for initial fetch (Render spin-up)
      initializeData().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [user, initializeData]);

  const addHabit = async () => {
    if (!newHabit || !isAuthenticated()) return;
    
    setIsAddingHabit(true); // Show spinner while adding
    try {
      const habit = await createHabit(newHabit);
      setHabits([...habits, habit]);
      setNewHabit("");
      if (currentDate) await fetchCompletionCounts(currentDate);
    } catch (error) {
      console.error("Failed to add habit:", error);
      alert("Failed to add habit: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsAddingHabit(false); // Hide spinner
    }
  };

  const removeHabit = async (id: number) => {
    try {
      await deleteHabit(id);
      setHabits(habits.filter((habit) => habit.id !== id));
      if (currentDate) await fetchCompletionCounts(currentDate);
    } catch (error) {
      console.error("Failed to delete habit:", error);
    }
  };

  const updateHabit = async (updatedHabit: Habit) => {
    try {
      setHabits(habits.map((habit) => (habit.id === updatedHabit.id ? updatedHabit : habit)));
      const date = await fetchCurrentDate();
      if (date) await fetchCompletionCounts(date);
    } catch (error) {
      console.error("Failed to update habit:", error);
    }
  };

  const now = currentDate ? new Date(currentDate) : new Date();
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
      background: `linear-gradient(to right,var(--calendar-color-green) ${percent}%,  var(--calendar-color-yellow) ${percent}%, var(--calendar-color-red) )`,
    };
  };
  const monthName = now.toLocaleString("default", { month: "long" });

  if (isLoading || isAuthLoading) {
    return <LoadingSpinner />;
  }

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
              disabled={isAuthLoading}
            >
              {isAuthLoading ? "Logging in..." : "Login"}
            </button>
            <button
              onClick={handleRegister}
              className="px-4 py-2 rounded hover:opacity-90"
              style={{ backgroundColor: 'var(--button-primary)', color: 'white' }}
              disabled={isAuthLoading}
            >
              {isAuthLoading ? "Registering..." : "Register"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 sm:p-8" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-10 gap-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Habit Tracker</h1>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg hover:opacity-90 text-sm sm:text-base w-full sm:w-auto"
              style={{ backgroundColor: 'var(--button-delete)', color: 'white' }}
            >
              Logout
            </button>
          </div>
        </div>
        <div className="flex mb-8 sm:mb-10">
          <input
            type="text"
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newHabit.trim() && !isAddingHabit) {
                addHabit();
              }
            }}
            placeholder="New habit..."
            className="flex-1 p-3 rounded-l-lg text-sm sm:text-base"
            style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }}
            disabled={isAddingHabit}
          />
          <button
            onClick={addHabit}
            className="px-4 py-3 rounded-r-lg hover:opacity-90 text-sm sm:text-base flex items-center justify-center min-w-[80px]"
            style={{ backgroundColor: 'var(--button-primary)', color: 'white' }}
            disabled={isAddingHabit || !newHabit.trim()}
          >
            {isAddingHabit ? (
              <div className="inline-block w-4 h-4 border-2 border-t-transparent border-[#4ade80] rounded-full animate-spin"></div>
            ) : (
              "Add"
            )}
          </button>
        </div>
        <div className="space-y-6 sm:space-y-8">
          {habits.map((habit) => (
            <HabitCard key={habit.id} habit={habit} onUpdate={updateHabit} onDelete={removeHabit} />
          ))}
        </div>
        {/* Calendar */}
        <div className="mt-10 sm:mt-12">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
            {monthName} {now.getFullYear()}
          </h2>
          <div className="grid grid-cols-7 gap-2 sm:gap-3 text-center text-xs sm:text-sm">
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
                <div key={day} className="relative flex items-center justify-center h-8 sm:h-10">
                  {isPast ? (
                    <div
                      className="w-5 h-5 sm:w-6 sm:h-6 rounded-full"
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
        <div className="mt-12 sm:mt-16 pt-6" style={{ borderTop: `1px solid var(--bg-tertiary)` }}>
          <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Testing Tools</h2>
          <DateSetter onDateSet={initializeData} currentDate={currentDate} />
        </div>
        <WhyThisAppIsCool />
      </div>
    </div>
  );
}

export default App;