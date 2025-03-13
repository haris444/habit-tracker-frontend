import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Habit, completeHabit } from "../services/apiService";
import { useTheme } from "../theme/ThemeContext";

interface HabitCardProps {
    habit: Habit;
    onUpdate: (updatedHabit: Habit) => void;
}

const HabitCard = ({ habit, onUpdate }: HabitCardProps) => {
    const { theme } = useTheme();
    const [streak, setStreak] = useState(habit.streak);

    // This useEffect ensures the local streak state updates when habit prop changes
    useEffect(() => {
        setStreak(habit.streak);
    }, [habit.streak]);

    console.log("HabitCard rendering habit:", habit.name, "with streak:", habit.streak);

    const handleCompleteHabit = async () => {
        console.log("Completing habit:", habit.id);
        try {
            const updatedHabit = await completeHabit(habit.id);
            console.log("Completion response:", updatedHabit);
            setStreak(updatedHabit.streak);
            onUpdate(updatedHabit);
        } catch (error) {
            console.error("Failed to complete habit:", error);
            alert("Failed to complete habit: " + (error instanceof Error ? error.message : String(error)));
        }
    };

    return (
        <motion.div
            className="p-6 rounded-xl shadow-lg w-full"
            style={{
                background: `linear-gradient(to bottom right, var(--card-from), var(--card-to))`,
                color: 'white'
            }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
        >
            <h3 className="text-xl font-bold">{habit.name}</h3>
            <p className="text-sm">Level {habit.level} ({habit.xp} XP)</p>
            <motion.p
                className="text-3xl mt-2"
                animate={{ scale: streak > 0 ? [1, 1.2, 1] : 1 }}
                transition={{ duration: 0.4 }}
            >
                Streak: {streak}
            </motion.p>
            <div className="mt-2 flex gap-1">
                {Array.from({ length: streak }).map((_, idx) => (
                    <span key={idx} className="w-3 h-3 bg-green-400 rounded-full" />
                ))}
            </div>
            <button
                onClick={handleCompleteHabit}
                className="mt-4 px-4 py-2 rounded-full font-semibold hover:bg-opacity-90"
                style={{
                    backgroundColor: theme === 'dark' ? 'white' : '#f9fafb',
                    color: 'var(--card-from)'
                }}
            >
                Complete
            </button>
        </motion.div>
    );
};

export default HabitCard;