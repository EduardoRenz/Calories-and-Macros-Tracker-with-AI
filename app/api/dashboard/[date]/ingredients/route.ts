import { NextRequest, NextResponse } from 'next/server';
import { Ingredient, MealSummary } from '@/domain/entities/dashboard';

/**
 * POST /api/dashboard/[date]/ingredients
 * Adds ingredient(s) to a meal
 */
export async function POST(
    req: NextRequest,
    { params }: { params: { date: string } }
) {
    try {
        const { verifyAuth } = await import('../../../auth-middleware');
        await verifyAuth(req.headers.get('Authorization'));

        const body = await req.json();
        const { mealType, ingredient, ingredients } = body as {
            mealType: keyof MealSummary;
            ingredient?: Omit<Ingredient, 'id'>;
            ingredients?: Omit<Ingredient, 'id'>[];
        };

        if (!mealType) {
            return NextResponse.json({ error: 'mealType is required' }, { status: 400 });
        }

        const { RepositoryFactory } = await import('@/data/RepositoryFactory');
        const dashboardRepository = RepositoryFactory.getDashboardRepository();

        let data;
        if (ingredients && Array.isArray(ingredients)) {
            data = await dashboardRepository.addIngredients(params.date, mealType, ingredients);
        } else if (ingredient) {
            data = await dashboardRepository.addIngredient(params.date, mealType, ingredient);
        } else {
            return NextResponse.json(
                { error: 'Either ingredient or ingredients must be provided' },
                { status: 400 }
            );
        }

        return NextResponse.json(data);
    } catch (error: unknown) {
        console.error('[API] Dashboard POST ingredients error:', error);

        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json({ error: error.message }, { status: 401 });
        }

        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal Server Error' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/dashboard/[date]/ingredients
 * Removes an ingredient from a meal
 */
export async function DELETE(
    req: NextRequest,
    { params }: { params: { date: string } }
) {
    try {
        const { verifyAuth } = await import('../../../auth-middleware');
        await verifyAuth(req.headers.get('Authorization'));

        const body = await req.json();
        const { mealType, ingredientId } = body as {
            mealType: keyof MealSummary;
            ingredientId: string;
        };

        if (!mealType || !ingredientId) {
            return NextResponse.json(
                { error: 'mealType and ingredientId are required' },
                { status: 400 }
            );
        }

        const { RepositoryFactory } = await import('@/data/RepositoryFactory');
        const dashboardRepository = RepositoryFactory.getDashboardRepository();

        const data = await dashboardRepository.removeIngredient(params.date, mealType, ingredientId);

        return NextResponse.json(data);
    } catch (error: unknown) {
        console.error('[API] Dashboard DELETE ingredient error:', error);

        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json({ error: error.message }, { status: 401 });
        }

        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal Server Error' },
            { status: 500 }
        );
    }
}
