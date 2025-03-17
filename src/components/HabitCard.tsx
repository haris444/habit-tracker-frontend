import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Habit, completeHabit } from "../services/apiService";
import { useTheme } from "../theme/ThemeContext";

interface HabitCardProps {
  habit: Habit;
  onUpdate: (updatedHabit: Habit) => void;
  onDelete: (id: number) => void;
}

const HabitCard = ({ habit, onUpdate, onDelete }: HabitCardProps) => {
  const { theme } = useTheme();
  const [streak, setStreak] = useState(habit.streak);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); // New state for delete loading

  useEffect(() => {
    setStreak(habit.streak);
  }, [habit.streak]);

  console.log("HabitCard rendering habit:", habit.name, "with streak:", habit.streak);

  const handleCompleteHabit = async () => {
    console.log("Completing habit:", habit.id);
    setIsUpdating(true);
    try {
      const updatedHabit = await completeHabit(habit.id);
      console.log("Completion response:", updatedHabit);
      setStreak(updatedHabit.streak);
      onUpdate(updatedHabit);
    } catch (error) {
      console.error("Failed to complete habit:", error);
      alert("Failed to complete habit: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteHabit = async () => {
    console.log("Deleting habit:", habit.id);
    setIsDeleting(true);
    try {
      await onDelete(habit.id); // Call the onDelete prop (which triggers removeHabit in App)
    } catch (error) {
      console.error("Failed to delete habit:", error);
      alert("Failed to delete habit: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      className="p-4 sm:p-6 rounded-xl shadow-lg w-full"
      style={{
        background: `linear-gradient(to bottom right, var(--card-from), var(--card-to))`,
        color: "white",
      }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-lg sm:text-xl font-bold">{habit.name}</h3>
          <p className="text-xs sm:text-sm">Level {habit.level} ({habit.xp} XP)</p>
          <motion.p
            className="text-2xl sm:text-3xl mt-2"
            animate={{ scale: streak > 0 ? [1, 1.2, 1] : 1 }}
            transition={{ duration: 0.4 }}
          >
            Streak: {streak}
          </motion.p>
          <div className="mt-2 flex gap-1">
            {Array.from({ length: streak }).map((_, idx) => (
              <span key={idx} className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full" />
            ))}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleCompleteHabit}
            className="px-4 py-2 rounded-full font-semibold hover:bg-opacity-90 flex items-center justify-center w-full sm:w-auto"
            style={{
              backgroundColor: theme === "dark" ? "white" : "#f9fafb",
              color: "var(--card-from)",
            }}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <div className="inline-block w-4 h-4 border-2 border-t-transparent border-[#4ade80] rounded-full animate-spin"></div>
            ) : (
              "Complete"
            )}
          </button>
          <button
            onClick={handleDeleteHabit}
            className="px-4 py-2 rounded-full font-semibold hover:bg-opacity-90 w-full sm:w-auto"
            style={{
              backgroundColor: "var(--button-delete)",
              color: "white",
            }}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <div className="inline-block w-4 h-4 border-2 border-t-transparent border-[#4ade80] rounded-full animate-spin"></div>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default HabitCard;