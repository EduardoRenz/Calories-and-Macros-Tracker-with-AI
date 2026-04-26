
export default {
  "navbar": {
    "dashboard": "Panel",
    "history": "Historial",
    "food_diary": "Diario de Comida",
    "food_analysis": "Análisis de Alimentación",
    "reports": "Informes",
    "profile": "Perfil",
    "settings": "Ajustes",
    "logout": "Cerrar Sesión",
    "quick_meal": "Comida Rápida"
  },
  "history": {
    "title": "Historial",
    "subtitle": "Tu resumen día a día.",
    "loading": "Cargando historial...",
    "table_title": "Últimos 30 días",
    "filter_start": "Fecha inicial",
    "filter_end": "Fecha final",
    "apply": "Aplicar",
    "prev_page": "Anterior",
    "next_page": "Siguiente",
    "columns": {
      "date": "Fecha",
      "protein": "Proteínas",
      "carbs": "Carbohidratos",
      "fats": "Grasas",
      "fiber": "Fibra",
      "calories": "Calorías"
    },
    "calendar_prev": "Mes anterior",
    "calendar_next": "Mes siguiente",
    "averages_title": "Promedios",
    "averages_subtitle": "Días con registros:"
  },
  "dashboard": {
    "title": "Panel",
    "today": "Hoy",
    "loading": "Cargando panel...",
    "add_food": "Añadir Comida",
    "calories": "Calorías",
    "protein": "Proteína",
    "carbs": "Carbohidratos",
    "fats": "Grasas",
    "calories_remaining": "Calorías Restantes",
    "calories_over": "Calorías Excedidas",
    "limit_exceeded": "Has superado tu límite.",
    "doing_great": "¡Lo estás haciendo genial!",
    "macro_split": "División de Macros"
  },
  "meals": {
    "summary_title": "Resumen de Comidas",
    "breakfast": "Desayuno",
    "lunch": "Almuerzo",
    "dinner": "Cena",
    "snacks": "Snacks",
    "protein": "Proteína",
    "protein_short": "Prot.",
    "carbs": "Carbs",
    "carbs_short": "Carbs",
    "fats": "Grasas",
    "fats_short": "Grasas",
    "fiber_short": "Fibra",
    "calories_short": "kcal",
    "no_items_logged": "No hay alimentos registrados",
    "ingredient": "Ingrediente",
    "quantity": "Cantidad",
    "total_macros": "Macros Totales",
    "add_ingredient": "Añadir Ingrediente",
    "edit_quantity": "Haga clic para editar la cantidad"
  },
  "add_ingredient_modal": {
    "title": "Añadir Ingrediente a",
    "name": "Nombre del Ingrediente",
    "quantity": "Cantidad",
    "quantity_placeholder": "ej: 1 taza, 100g",
    "calories": "Calorías (kcal)",
    "fiber": "Fibra (g)",
    "protein": "Proteína (g)",
    "carbs": "Carbohidratos (g)",
    "fats": "Grasas (g)",
    "cancel": "Cancelar",
    "save": "Añadir Ingrediente",
    "analysis_error": "No se pudo obtener la información nutricional. Por favor, complete los macros manualmente.",
    "analyze_button_aria": "Analizar ingrediente con IA"
  },
  "quick_meal_modal": {
    "title": "Registrar Comida Rápida con IA",
    "log_as": "Registrar comida como",
    "upload_prompt": "Sube una foto de tu comida",
    "upload_button": "Elige una imagen",
    "take_photo_button": "Tomar Foto",
    "capture_photo": "Capturar Foto",
    "cancel_camera": "Cancelar",
    "camera_error": "Acceso a la cámara denegado o no disponible",
    "change_image_button": "Cambiar Imagen",
    "analyzing_button": "Analizando...",
    "analyze_image": "Analizar Imagen",
    "add_to_diary_button": "Añadir al Diario",
    "analysis_error": "Lo siento, no pude analizar esa imagen. Por favor, intenta con otra.",
    "add_error": "Error al añadir los alimentos. Por favor, inténtalo de nuevo.",
    "gemini_results": "Análisis de Gemini",
    "review_prompt": "Revisa los ingredientes a continuación antes de añadirlos a tu diario.",
    "prompt_label": "Contexto adicional",
    "prompt_optional": "opcional",
    "prompt_placeholder": "ej: 'Este es un almuerzo vegetariano con quinoa y verduras a la parrilla' o 'Enfócate en identificar el método de cocción y los tamaños de las porciones'"
  },
  "profile": {
    "title": "Mi Perfil",
    "tabs": {
      "settings": "Ajustes de Perfil",
      "progress": "Progreso",
      "food_analysis": "Análisis de Alimentación",
      "health_conditions": {
        "title": "Condiciones de Salud",
        "subtitle": "Selecciona las condiciones que apliquen para recibir recomendaciones alimentarias más seguras.",
        "importance": "Esta información es importante: el Análisis de Alimentación usará estas condiciones para evitar sugerencias inseguras y priorizar alternativas más seguras.",
        "options": {
          "diabetes": "Diabetes",
          "lactose_intolerance": "Intolerancia a la lactosa",
          "gluten_intolerance": "Intolerancia al gluten",
          "celiac_disease": "Enfermedad celíaca",
          "hypertension": "Hipertensión",
          "high_cholesterol": "Colesterol alto",
          "kidney_disease": "Enfermedad renal",
          "gout": "Gota",
          "ibs": "Síndrome del intestino irritable (SII)",
          "gerd": "Reflujo / Acidez"
        }
      },
    },
    "upload_picture": "Subir nueva foto",
    "personal_info": {
      "title": "Información Personal",
      "age": "Edad",
      "height": "Altura (cm)",
      "weight": "Peso (kg)",
      "gender": "Género",
      "female": "Femenino",
      "male": "Masculino",
      "other": "Otro",
      "diet_type": "Tipo de Dieta",
      "diet_types": {
        "omnivore": "Omnívoro",
        "vegetarian": "Vegetariano",
        "vegan": "Vegano",
        "pescatarian": "Pescetariano",
        "carnivore": "Carnívoro",
        "flexitarian": "Flexitariano"
      }
    },
    "fitness_goals": {
      "title": "Metas de Fitness",
      "primary_goal": "Meta Principal",
      "lose_weight": "Perder Peso",
      "maintain_weight": "Mantener Peso",
      "gain_muscle": "Ganar Músculo",
      "target_weight": "Peso Objetivo (kg)",
      "activity_level": "Nivel de Actividad",
      "sedentary": "Sedentario",
      "lightly_active": "Ligeramente Activo",
      "moderately_active": "Moderadamente Activo",
      "very_active": "Muy Activo"
    },
    "update_profile": "Actualizar Perfil",
    "saving": "Guardando...",
    "update_success": "¡Perfil actualizado con éxito!",
    "cancel": "Cancelar",
    "loading": "Cargando perfil...",
    "load_error": "No se pudieron cargar los datos del perfil.",
    "progress_summary": {
      "title": "Resumen de Progreso",
      "current_weight": "Peso Actual",
      "weight_to_go": "Peso Restante",
      "daily_calorie_target": "Objetivo Diario de Calorías"
    },
    "weight_progress": "Progreso de Peso",
    "goal_progress": "Progreso de Meta",
    "complete": "Completado"
  },
  "food_analysis": {
    "title": "Análisis de Alimentación",
    "subtitle": "Informes e información completos sobre tu dieta y salud.",
    "back_to_profile": "Volver al Perfil",
    "last_7_days": "Últimos 7 Días",
    "this_month": "Este Mes",
    "last_3_months": "Últimos 3 Meses",
    "generate_prompt": "Haz clic abajo para generar un análisis completo de tus hábitos alimenticios.",
    "generate_button": "Generar Informe",
    "generating": "Generando tu informe personalizado...",
    "error_generating": "Ocurrió un error al generar el informe. Reintentando...",
    "retry": "Intentar de nuevo",
    "regenerate": "Limpiar caché y regenerar informe",
    "common_foods": {
      "title": "Alimentos Más Comunes",
      "subtitle": "Un resumen de lo que comes con más frecuencia en diferentes momentos del día.",
      "consistency": "Consistencia"
    },
    "vitamins": {
      "title": "Resumen de Vitaminas",
      "subtitle": "Análisis de micronutrientes clave basado en tus registros.",
      "sufficient_moderate": "Suficiente & Moderado",
      "deficient_action": "Deficiente - Necesita Acción",
      "recommendations": "Recomendaciones",
      "positive_reason": "Por qué vas bien",
      "status": {
        "good": "Bien",
        "low": "Medio",
        "deficient": "Bajo"
      }
    },
    "attention": {
      "title": "Puntos de Atención",
      "subtitle": "Áreas donde podrías ajustar tu ingesta para mejores resultados.",
      "no_issues": "No se detectaron puntos de atención. ¡Sigue así!"
    },
    "suggestions": {
      "title": "Sugerencias",
      "subtitle": "Pasos prácticos para alcanzar tus metas de macros.",
      "goal": "Meta",
      "recommended": "Adiciones Recomendadas",
      "adjustments_required": "Ajustes Requeridos"
    }
  },
  "settings": {
    "title": "Ajustes de App y Gestión de API",
    "subtitle": "Gestiona las preferencias de tu aplicación y las integraciones de servicios de IA.",
    "sidebar": {
      "general": "General",
      "api_tokens": "Tokens de API de IA",
      "logout": "Cerrar Sesión",
      "help": "Ayuda",
      "settings": "Ajustes"
    },
    "general": {
      "title": "Ajustes Generales",
      "language": "Idioma"
    },
    "tokens": {
      "title": "Tokens de API de IA",
      "add_token": "Añadir Token API",
      "remove": "Eliminar",
      "no_tokens": "Todavía no has añadido ningún token de API de IA."
    }
  },
  "assistant": {
    "title": "Asistente HealthPal",
    "status_online": "EN LÍNEA",
    "close": "Cerrar chat",
    "input_placeholder": "Pregunta a HealthPal...",
    "send": "Enviar",
    "confirm_action": "Acción pendiente de confirmación",
    "confirm": "Confirmar",
    "cancel": "Cancelar",
    "thinking": "Pensando...",
    "action_success": "¡Acción ejecutada con éxito!",
    "action_error": "Error al ejecutar la acción. Por favor, inténtelo de nuevo.",
    "action_cancelled": "Acción cancelada.",
    "prepared_action": "He preparado la acción para ti.",
    "errors": {
      "api_key": "Estoy teniendo problemas de autenticación. Por favor, verifica mi configuración.",
      "quota_exceeded": "He alcanzado mi límite de uso. Por favor, intenta nuevamente en un momento.",
      "model_error": "Estoy teniendo problemas con mi modelo de IA. Por favor, intenta nuevamente más tarde.",
      "network_error": "Estoy teniendo problemas de conexión. Por favor, verifica tu internet e intenta nuevamente.",
      "safety_error": "No pude procesar esa solicitud debido a las pautas de seguridad.",
      "invalid_request": "Recibí un formato de solicitud inválido. Por favor, intenta nuevamente.",
      "unknown_error": "Lo siento, estoy teniendo problemas para conectar con mi cerebro ahora. Por favor, intenta nuevamente más tarde."
    }
  }
}