import { useState } from 'react';

interface DateSetterProps {
    onDateSet: () => Promise<void>;
    currentDate: string | null;
}

const DateSetter = ({ onDateSet, currentDate }: DateSetterProps) => {
    const [dateInput, setDateInput] = useState(currentDate || '');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSetDate = async () => {
        if (!dateInput) return;

        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            // Set the date - the backend will now handle streak resets automatically
            const response = await fetch(`https://habit-tracker-backend-0576.onrender.com/api/habits/set-date?date=${dateInput}`, {
                method: 'POST'
            });

            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
            }

            const responseText = await response.text();
            console.log('Date set response:', responseText);
            setSuccess(responseText);

            // Refresh frontend data
            await onDateSet();
        } catch (err) {
            console.error('Error setting date:', err);
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-800 p-3 rounded-lg">
        <div className="text-white font-medium mb-2">Testing Tools</div>

    <div className="flex items-center space-x-2">
    <input
        type="date"
    value={dateInput}
    onChange={(e) => setDateInput(e.target.value)}
    className="bg-gray-700 text-white p-2 rounded cursor-pointer"
    />

    <button
        onClick={handleSetDate}
    disabled={isLoading || !dateInput}
    className={`px-3 py-2 rounded font-medium 
            ${isLoading ? 'bg-gray-600 text-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700'} 
            ${!dateInput ? 'opacity-50 cursor-not-allowed' : ''}`}
>
    {isLoading ? 'Setting...' : 'Set Test Date'}
    </button>
    </div>

    {error && (
        <div className="mt-2 text-red-400 text-sm bg-red-900 bg-opacity-30 p-2 rounded">
            Error: {error}
        </div>
    )}

    {success && (
        <div className="mt-2 text-green-400 text-sm bg-green-900 bg-opacity-30 p-2 rounded">
            {success}
            </div>
    )}
    </div>
);
};

export default DateSetter;