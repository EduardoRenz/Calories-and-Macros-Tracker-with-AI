import { FoodAnalysisService, FoodAnalysisInput } from '../../domain/services/FoodAnalysisService';
import { FoodAnalysisReport } from '../../domain/entities/analysis';

/**
 * Mock implementation of FoodAnalysisService with pre-filled sample data.
 * Used for testing and development without making actual AI API calls.
 */
export class MockFoodAnalysisService implements FoodAnalysisService {
    async generateAnalysis(input: FoodAnalysisInput): Promise<FoodAnalysisReport> {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        const { language } = input;
        const dateRange = this.getDateRange(input.dashboardData);

        // Return mock data based on language
        const isPortuguese = language === 'pt';
        const isSpanish = language === 'es';

        return {
            generatedAt: new Date().toISOString(),
            dateRange,
            commonFoods: {
                breakfast: {
                    foods: isPortuguese
                        ? ['Aveia', 'Café', 'Ovos']
                        : isSpanish
                            ? ['Avena', 'Café', 'Huevos']
                            : ['Oatmeal', 'Coffee', 'Eggs'],
                    consistency: 85
                },
                lunch: {
                    foods: isPortuguese
                        ? ['Frango Grelhado', 'Arroz']
                        : isSpanish
                            ? ['Pollo a la Parrilla', 'Arroz']
                            : ['Chicken Breast', 'Rice'],
                    consistency: 65
                },
                dinner: {
                    foods: isPortuguese
                        ? ['Salmão', 'Brócolis']
                        : isSpanish
                            ? ['Salmón', 'Brócoli']
                            : ['Salmon', 'Broccoli'],
                    consistency: 90
                },
                snacks: {
                    foods: isPortuguese
                        ? ['Amêndoas', 'Maçã']
                        : isSpanish
                            ? ['Almendras', 'Manzana']
                            : ['Almonds', 'Apple'],
                    consistency: 40
                }
            },
            vitamins: [
                {
                    name: 'Vit A',
                    status: 'good',
                    emoji: '🥕',
                    positiveReason: isPortuguese
                        ? 'Você consome com frequência alimentos ricos em carotenoides (ex.: cenoura e folhas verdes).'
                        : isSpanish
                            ? 'Consumes con frecuencia alimentos ricos en carotenoides (p. ej., zanahoria y hojas verdes).'
                            : 'You frequently eat carotenoid-rich foods (e.g., carrots and leafy greens).'
                },
                {
                    name: 'Vit C',
                    status: 'good',
                    emoji: '🍊',
                    positiveReason: isPortuguese
                        ? 'Suas escolhas incluem frutas e vegetais com boa presença de vitamina C, o que ajuda a manter níveis adequados.'
                        : isSpanish
                            ? 'Tus elecciones incluyen frutas y verduras con buena presencia de vitamina C, ayudando a mantener niveles adecuados.'
                            : 'Your choices include vitamin C-rich fruits and vegetables, helping keep adequate levels.'
                },
                {
                    name: isPortuguese ? 'Vitamina D' : isSpanish ? 'Vitamina D' : 'Vitamin D',
                    status: 'deficient',
                    emoji: '☀️',
                    recommendations: isPortuguese
                        ? ['Exponha-se ao sol (15min)', 'Consuma mais peixes gordurosos']
                        : isSpanish
                            ? ['Exponerse al sol (15min)', 'Consumir más pescado graso']
                            : ['Spend time in sun (15m)', 'Eat more fatty fish']
                },
                {
                    name: 'Iron',
                    status: 'low',
                    emoji: '🍎',
                    recommendations: isPortuguese
                        ? ['Inclua feijões e lentilhas', 'Combine com fonte de vitamina C para melhor absorção']
                        : isSpanish
                            ? ['Incluye frijoles y lentejas', 'Combínalo con vitamina C para mejor absorción']
                            : ['Add beans and lentils', 'Pair with vitamin C to improve absorption'],
                    positiveReason: isPortuguese
                        ? 'Seu nível está aceitável, mas há espaço para otimizar com fontes melhores e mais consistentes.'
                        : isSpanish
                            ? 'Tu nivel es aceptable, pero puedes optimizarlo con fuentes mejores y más constantes.'
                            : 'Your level is acceptable, but you can optimize it with better and more consistent sources.'
                },
                {
                    name: 'Calc',
                    status: 'good',
                    emoji: '🥛',
                    positiveReason: isPortuguese
                        ? 'Você costuma incluir fontes de cálcio (laticínios ou alternativas fortificadas), o que sustenta bons níveis.'
                        : isSpanish
                            ? 'Sueles incluir fuentes de calcio (lácteos o alternativas fortificadas), lo que sostiene buenos niveles.'
                            : 'You often include calcium sources (dairy or fortified alternatives), supporting good levels.'
                },
                {
                    name: 'B12',
                    status: 'good',
                    emoji: '🫐',
                    positiveReason: isPortuguese
                        ? 'Sua ingestão tem boa presença de fontes de B12 (origem animal ou alimentos fortificados).'
                        : isSpanish
                            ? 'Tu ingesta incluye buenas fuentes de B12 (origen animal o alimentos fortificados).'
                            : 'Your intake includes good B12 sources (animal products or fortified foods).'
                }
            ],
            attentionPoints: [
                {
                    severity: 'warning',
                    title: isPortuguese
                        ? 'Alto Consumo de Sódio'
                        : isSpanish
                            ? 'Alto Consumo de Sodio'
                            : 'High Sodium Intake',
                    description: isPortuguese
                        ? 'Detectado em 4 de 7 dias. Considere reduzir alimentos processados e adicionar menos sal às refeições.'
                        : isSpanish
                            ? 'Detectado en 4 de 7 días. Considera reducir alimentos procesados y agregar menos sal a las comidas.'
                            : 'Detected on 4 out of 7 days. Consider reducing processed foods and adding less salt to meals.'
                },
                {
                    severity: 'alert',
                    title: isPortuguese
                        ? 'Baixa Fibra'
                        : isSpanish
                            ? 'Bajo Contenido de Fibra'
                            : 'Low Fiber',
                    description: isPortuguese
                        ? 'Sua média diária de fibras é de 12g. A recomendação é de 25-30g. Tente adicionar mais folhas verdes.'
                        : isSpanish
                            ? 'Tu promedio diario de fibra es 12g. Lo recomendado es 25-30g. Intenta agregar más verduras de hoja.'
                            : 'Your daily fiber average is 12g. The recommended amount is 25-30g. Try adding more leafy greens.'
                }
            ],
            macroSuggestions: [
                {
                    macro: isPortuguese ? 'Proteína' : isSpanish ? 'Proteína' : 'Protein',
                    macroType: 'protein',
                    current: 80,
                    goal: 140,
                    recommendations: [
                        {
                            meal: isPortuguese ? 'Café da manhã' : isSpanish ? 'Desayuno' : 'Breakfast',
                            mealType: 'breakfast',
                            food: isPortuguese ? 'Iogurte Grego' : isSpanish ? 'Yogur Griego' : 'Greek Yogurt',
                            benefit: '+10g Protein'
                        },
                        {
                            meal: isPortuguese ? 'Jantar' : isSpanish ? 'Cena' : 'Dinner',
                            mealType: 'dinner',
                            food: isPortuguese ? 'Carne Magra' : isSpanish ? 'Carne Magra' : 'Lean Beef',
                            benefit: '+28g Protein'
                        },
                        {
                            meal: isPortuguese ? 'Lanche' : isSpanish ? 'Merienda' : 'Snack',
                            mealType: 'snacks',
                            food: isPortuguese ? 'Whey Protein' : isSpanish ? 'Proteína de Suero' : 'Whey Protein',
                            benefit: '+24g Protein'
                        }
                    ]
                },
                {
                    macro: isPortuguese ? 'Gorduras' : isSpanish ? 'Grasas' : 'Fat Intake',
                    macroType: 'fats',
                    current: 78,
                    goal: 65,
                    recommendations: [
                        {
                            meal: isPortuguese ? 'Almoço' : isSpanish ? 'Almuerzo' : 'Lunch',
                            mealType: 'lunch',
                            food: isPortuguese ? 'Reduzir Carnes Processadas' : isSpanish ? 'Reducir Carnes Procesadas' : 'Reduce Processed Meats',
                            benefit: isPortuguese ? 'Salame/Bacon' : isSpanish ? 'Salami/Tocino' : 'Salami/Bacon',
                            type: 'reduce' as const
                        },
                        {
                            meal: isPortuguese ? 'Jantar' : isSpanish ? 'Cena' : 'Dinner',
                            mealType: 'dinner',
                            food: isPortuguese ? 'Substituir com Proteína Magra' : isSpanish ? 'Sustituir con Proteína Magra' : 'Substitute with Lean Protein',
                            benefit: isPortuguese ? 'Frango/Peixe' : isSpanish ? 'Pollo/Pescado' : 'Chicken Breast',
                            type: 'substitute' as const
                        }
                    ]
                }
            ]
        };
    }

    private getDateRange(dashboardData: import("../../domain/entities/dashboard").DashboardData[]): { start: string; end: string } {
        if (dashboardData.length === 0) {
            const today = new Date();
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return {
                start: weekAgo.toISOString().split('T')[0],
                end: today.toISOString().split('T')[0]
            };
        }

        const dates = dashboardData.map(d => d.date).sort();
        return {
            start: dates[0],
            end: dates[dates.length - 1]
        };
    }
}
