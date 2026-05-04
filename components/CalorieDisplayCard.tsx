interface CalorieDisplayCardProps {
    caloriesRemaining: number;
    isOverLimit: boolean;
    t: (key: string) => string;
}

export default function CalorieDisplayCard({ caloriesRemaining, isOverLimit, t }: CalorieDisplayCardProps) {
    return (
        <div data-testid="calorie-display-card" className="bg-neutral-card p-6 rounded-2xl flex flex-col justify-center items-center text-center h-full order-last lg:order-first">
            <h3 className="text-neutral-text-secondary font-medium">
                {isOverLimit ? t('dashboard.calories_over') : t('dashboard.calories_remaining')}
            </h3>
            <p className={`text-6xl font-bold my-2 ${isOverLimit ? 'text-red-500' : 'text-brand-green'}`}>
                <span data-testid="calorie-goal">{Math.abs(caloriesRemaining)}</span>
            </p>
            <p className="text-neutral-text-secondary text-sm">
                {isOverLimit ? t('dashboard.limit_exceeded') : t('dashboard.doing_great')}
            </p>
        </div>
    );
}
