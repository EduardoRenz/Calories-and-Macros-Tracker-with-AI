

import { useState } from 'react';
import Head from 'next/head';
// FIX: Use canonical DashboardData type from domain entities to resolve type conflicts.
import type { DashboardData } from '../domain/entities/dashboard';
import { initialData } from '../constants';
import { HealthPalLogo, UserIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon } from '../components/icons';
import MacroProgressCard from '../components/MacroProgressCard';
import MealSummaryCard from '../components/MealSummaryCard';
import MacroSplitChart from '../components/MacroSplitChart';

const HomePage = () => {
  const [data] = useState<DashboardData>(initialData);

  const caloriesRemaining = data.macros.calories.goal - data.macros.calories.current;

  return (
    <>
      <Head>
        <title>HealthPal Macro Tracker</title>
        <meta name="description" content="A modern, visually appealing dashboard for tracking daily calories and macronutrients. It provides a comprehensive overview of nutritional intake with progress bars, a meal summary, and a detailed macro split chart." />
        <link rel="icon" type="image/svg+xml" href="/vite.svg" />
      </Head>
      <div className="text-healthpal-text-primary font-sans p-4 lg:p-8 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-7xl bg-healthpal-panel rounded-2xl shadow-2xl p-6 lg:p-8 border border-healthpal-border">
          {/* Header */}
          <header className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <HealthPalLogo className="h-8 w-8 text-healthpal-green" />
              <h1 className="text-2xl font-bold">HealthPal</h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-sm font-medium text-healthpal-text-secondary hover:text-healthpal-text-primary transition-colors">
                Settings
              </button>
              <div className="w-9 h-9 bg-healthpal-card rounded-full flex items-center justify-center border border-healthpal-border">
                <UserIcon className="h-5 w-5 text-healthpal-text-secondary" />
              </div>
            </div>
          </header>

          {/* Dashboard Header */}
          <section className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-bold">Today's Dashboard</h2>
              <p className="text-healthpal-text-secondary mt-1">October 26, 2023</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 bg-healthpal-card rounded-md hover:bg-healthpal-border transition-colors">
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <button className="p-2 bg-healthpal-card rounded-md hover:bg-healthpal-border transition-colors">
                <ChevronRightIcon className="h-5 w-5" />
              </button>
              <button className="flex items-center gap-2 bg-healthpal-green text-black font-bold py-2 px-4 rounded-lg hover:brightness-110 transition-all">
                <PlusIcon className="h-5 w-5" />
                <span>Add Food</span>
              </button>
            </div>
          </section>

          {/* Main Grid */}
          <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <MacroProgressCard
                title="Calories"
                unit="kcal"
                current={data.macros.calories.current}
                goal={data.macros.calories.goal}
                color="bg-healthpal-green"
              />
              <MacroProgressCard
                title="Protein"
                unit="g"
                current={data.macros.protein.current}
                goal={data.macros.protein.goal}
                color="bg-healthpal-protein"
              />
              <MacroProgressCard
                title="Carbs"
                unit="g"
                current={data.macros.carbs.current}
                goal={data.macros.carbs.goal}
                color="bg-healthpal-carbs"
              />
              <MacroProgressCard
                title="Fats"
                unit="g"
                current={data.macros.fats.current}
                goal={data.macros.fats.goal}
                color="bg-healthpal-fats"
              />
              <div className="md:col-span-2">
                {/* FIX: Add required onRemoveIngredient prop to satisfy the component's interface. */}
                <MealSummaryCard meals={data.meals} onAddIngredient={() => { /* Not implemented on this static page */ }} onRemoveIngredient={() => { /* Not implemented on this static page */ }} />
              </div>
            </div>

            <div className="lg:col-span-1 grid grid-cols-1 gap-6">
              <div className="bg-healthpal-card p-6 rounded-2xl flex flex-col justify-center items-center text-center h-full">
                  <h3 className="text-healthpal-text-secondary font-medium">Calories Remaining</h3>
                  <p className="text-6xl font-bold text-healthpal-green my-2">{caloriesRemaining}</p>
                  <p className="text-healthpal-text-secondary text-sm">You're doing great!</p>
              </div>
               <div className="bg-healthpal-card p-6 rounded-2xl h-full flex flex-col">
                   <h3 className="text-xl font-bold mb-4">Macro Split</h3>
                   <div className="flex-grow">
                       <MacroSplitChart data={data} />
                   </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default HomePage;