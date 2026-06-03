
const es = {
  "navbar": {
    "dashboard": "Panel",
    "history": "Historial",
    "food_diary": "Diario de Comida",
    "food_analysis": "Análisis de Alimentación",
    "reports": "Informes",
    "profile": "Perfil",
    "settings": "Ajustes",
    "logout": "Cerrar Sesión",
    "quick_meal": "Comida Rápida",
    "back_to_home": "Volver al Inicio"
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
    "macro_split": "División de Macros",
    "today_meals": "COMIDAS DE HOY",
    "api_keys_required_title": "Claves de API Requeridas",
    "api_keys_required_desc": "Para continuar usando las funciones de IA, configure sus propias claves de API en la configuración.",
    "go_to_settings": "Ir a Configuración",
    "first_time": {
      "title": "¡Bienvenido a LeveMente!",
      "description": "Para calcular tus objetivos personalizados de calorías y macros, necesitamos saber un poco sobre ti. Por favor, completa tu información personal y objetivos de fitness a continuación.",
      "dietary_restrictions_title": "Restricciones Alimentarias (Opcional)",
      "dietary_restrictions_desc": "Si tienes alguna condición de salud o preferencia alimentaria, puedes agregarlas más tarde en la configuración de tu perfil para obtener recomendaciones personalizadas.",
      "go_to_profile": "Ir a Configuración del Perfil →",
      "save_and_continue": "Guardar y Continuar",
      "saving": "Guardando...",
      "error_incomplete": "Por favor, completa todos los campos requeridos para continuar.",
      "error_saving": "Error al guardar el perfil. Por favor, inténtalo de nuevo."
    }
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
    "remove_error": "Error al eliminar el ingrediente. Por favor, inténtelo de nuevo.",
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
    "analysis_error": "Servicio temporalmente no disponible. Por favor, inténtelo de nuevo en un momento o complete los macros manualmente.",
    "analyze_button_aria": "Analizar ingrediente con IA",
    "macros_required": "Por favor, complete proteína, carbohidratos y grasas",
    "name_required": "Por favor, complete el nombre del ingrediente"
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
    "ai_analysis": "Análisis de IA",
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
      "select_gender": "Selecciona género",
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
      "very_active": "Muy Activo",
      "select_activity": "Selecciona nivel de actividad"
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
  "plans": {
    "title": "Elige tu plan",
    "subtitle": "Selecciona el plan que se adapte a tu viaje de fitness. Actualiza en cualquier momento para desbloquear funciones avanzadas.",
    "monthly": "Mensual",
    "annual": "Anual",
    "loading": "Cargando planes...",
    "features": {
      "free": [
        { "text": "Registro manual de alimentos", "included": true },
        { "text": "Soporte para claves de API propias (OpenAI/Gemini)", "included": true },
        { "text": "Historial básico de 7 dias", "included": true },
        { "text": "7 días de prueba gratis con funciones premium", "included": true },
        { "text": "Análisis nutricional por foto", "included": false },
        { "text": "Informes de salud avanzados", "included": false },
        { "text": "Lumi 24/7", "included": false }
      ],
      "member_monthly": [
        { "text": "IA Integrada (Sin necesidad de claves propias)", "included": true },
        { "text": "Análisis nutricional completo por foto", "included": true },
        { "text": "Historial ilimitado", "included": true },
        { "text": "Informes de micronutrientes y salud", "included": true },
        { "text": "Lumi disponible 24/7", "included": true },
      ],
      "member_annual": {
        "discount_message": "Ahorra {{percentage}}%",
        "features": [
          { "text": "IA Integrada (Sin necesidad de claves próprias)", "included": true },
          { "text": "Análisis nutricional completo por foto", "included": true },
          { "text": "Historial ilimitado", "included": true },
          { "text": "Informes de micronutrientes y salud", "included": true },
          { "text": "Asistente LeveMente disponible 24/7", "included": true },
        ]
      }
    }
  },
  "checkout": {
    "title": "Checkout",
    "subtitle": "Completa tu pago seguro para actualizar",
    "back": "Volver",
    "contact_information": "Información de Contacto",
    "email_address": "Dirección de correo",
    "payment_method": "Método de Pago",
    "order_summary": "Resumen del Pedido",
    "cardholder_name": "Nombre del Titular",
    "cardholder_name_placeholder": "Nombre como en la tarjeta",
    "card_number": "Número de Tarjeta",
    "card_number_placeholder": "0000 0000 0000 0000",
    "expiry_date": "Fecha de Vencimiento",
    "expiry_date_placeholder": "MM / AA",
    "cvc": "CVC",
    "cvc_placeholder": "123",
    "subtotal": "Subtotal",
    "annual_discount": "Descuento Anual",
    "tax": "Impuesto",
    "total_due": "Total a Pagar",
    "confirm_purchase": "Confirmar Compra",
    "confirm_and_pay": "Confirmar y Pagar →",
    "secure_payments": "Los pagos son seguros y están encriptados",
    "processing_payment": "Procesando Checkout...",
    "processing_message": "Redirigiendo a la página de pago seguro...",
    "payment_failed": "El pago falló. Por favor, inténtalo de nuevo.",
    "redirect_failed": "No se pudo iniciar el pago. Por favor, inténtalo de nuevo.",
    "hosted_redirect_notice": "Serás redirigido a una página de pago segura proporcionada por {{provider}} para completar tu suscripción.",
    "verification_pending": "Pago completado. Estamos confirmando tu suscripción...",
    "verification_processing": "Pago recibido. Tu suscripción aún se está procesando; actualiza en unos instantes.",
    "verification_confirmed": "Suscripción confirmada con éxito.",
    "verification_failed": "Se recibió el pago, pero no pudimos completar la activación de la suscripción. Nuestro equipo puede investigarlo con los registros del checkout.",
    "verification_unavailable": "No pudimos confirmar el estado de tu suscripción ahora. Actualiza la página en unos instantes.",
    "payment_methods": {
      "card": "Tarjeta",
      "paypal": "PayPal",
      "pix": "Pix",
      "crypto": "Cripto"
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
    "theme": "Tema",
    "subscription": {
      "title": "Suscripción",
      "description": "Gestiona tu plan y detalles de facturación",
      "manage": "Gestionar Suscripción",
      "upgrade": "Mejorar a Premium",
      "cancel": "Cancelar Suscripción",
      "plan_free": "Gratis",
      "plan_premium": "Premium",
      "plan_trial": "Período de prueba",
      "premium_description": "Tienes acceso total a todas las funciones de IA y análisis avanzados.",
      "trial_description": "Tienes acceso total a todas las funciones de IA y análisis avanzados gratis por {{days}} días.",
      "free_description": "Mejora para desbloquear el análisis de salud con IA y funciones exclusivas.",
      "history_title": "Historial Financiero",
      "ends_on": "Vence el {{date}}",
      "renews_on": "Se renueva el {{date}}",
      "cancel_modal": {
        "title": "Cancelar Suscripción",
        "warning": "¿Estás seguro de que deseas cancelar tu suscripción? Continuarás teniendo acceso hasta el final de tu período de facturación actual.",
        "keep": "Mantener Suscripción",
        "confirm": "Sí, Cancelar",
        "cancelling": "Cancelando...",
        "error": "Error al cancelar la suscripción. Por favor, inténtalo de nuevo."
      },
      "transaction_types": {
        "subscription.completed": "Suscripción Iniciada",
        "subscription.renewed": "Suscripción Renovada",
        "subscription.cancelled": "Suscripción Cancelada",
        "subscription.refunded": "Reembolso",
        "subscription.chargeback": "Contracargo",
        "payment": "Pago"
      },
      "transaction_status": {
        "completed": "Completado",
        "paid": "Pagado",
        "failed": "Fallido",
        "expired": "Expirado",
        "refunded": "Reembolsado",
        "pending": "Pendiente"
      }
    },
    "tokens": {
      "title": "Tokens de API de IA",
      "add_token": "Añadir Token API",
      "remove": "Eliminar",
      "no_tokens": "Todavía no has añadido ningún token de API de IA."
    },
    "cookies": {
      "title": "Preferencias de Cookies",
      "status": "Estado Actual",
      "accepted": "Aceptado",
      "declined": "Rechazado",
      "none": "No Establecido",
      "clear": "Limpiar Preferencia"
    }
  },
  "assistant": {
    "title": "Lumi",
    "status_online": "EN LÍNEA",
    "status_absent": "AUSENTE",
    "close": "Cerrar chat",
    "input_placeholder": "Pregunta a Lumi...",
    "send": "Enviar",
    "confirm_action": "Acción pendiente de confirmación",
    "confirm": "Confirmar",
    "cancel": "Cancelar",
    "thinking": "Pensando...",
    "action_success": "¡Acción ejecutada con éxito!",
    "action_error": "Error al ejecutar la acción. Por favor, inténtelo de nuevo.",
    "action_cancelled": "Acción cancelada.",
    "prepared_action": "He preparado la acción para ti.",
    "welcome_message": "¡Saluda a tu asistente personal de salud!",
    "disclaimer": "Lumi puede proporcionar información inexacta.",
    "open_assistant": "Abrir Asistente",
    "action_undone_warning": "Esta acción no se puede deshacer fácilmente.",
    "protein": "Proteína",
    "carbs": "Carbohidratos",
    "fats": "Grasas",
    "fiber": "Fibra",
    "calories": "Calorías",
    "new_quantity": "Nueva Cantidad",
    "errors": {
      "api_key": "Estoy teniendo problemas de autenticación. Por favor, verifica mi configuración.",
      "api_error": "Lo siento, estoy teniendo dificultades para proporcionar una respuesta ahora.",
      "quota_exceeded": "He alcanzado mi límite de uso. Por favor, intenta nuevamente en un momento.",
      "model_error": "Estoy teniendo problemas con mi modelo de IA. Por favor, intenta nuevamente más tarde.",
      "network_error": "Estoy teniendo problemas de conexión. Por favor, verifica tu internet e intenta nuevamente.",
      "safety_error": "No pude procesar esa solicitud debido a las pautas de seguridad.",
      "invalid_request": "Recibí un formato de solicitud inválido. Por favor, intenta nuevamente.",
      "unknown_error": "Lo siento, estoy teniendo problemas para conectar con mi cerebro ahora. Por favor, intenta nuevamente más tarde."
    }
  },
  "model_image_warning": {
    "title": "{{model}} no soporta imágenes",
    "message": "El modelo {{model}} no soporta análisis de imágenes. Por favor, configure otro proveedor de IA (OpenAI, Gemini o OpenRouter) en Configuración para usar esta función.",
    "go_to_settings": "Ir a Configuración",
    "close": "Cerrar"
  },
  "ai_errors": {
    "disabled": "Las funciones de IA están desactivadas actualmente.",
    "premium_required": "Esta función es exclusiva para miembros Premium. ¿Qué tal mejorar tu plan para desbloquear todas las funciones? Consulta nuestros [planes aquí](/plans).",
    "chatbot_premium_required": "Esta función es exclusiva para miembros Premium. ¿Qué tal mejorar tu plan para desbloquear todo el potencial de Lumi? Consulta nuestros [planes aquí](/plans).",
    "api_keys_required": "Esta función requiere una suscripción [Premium](/plans) o que configures tus propias [claves de API en la configuración](/settings).",
    "feature_premium_only": "Esta función es exclusiva para suscriptores Premium. Visita nuestra [página de planes](/plans) para obtener más información."
  },
  "cookies": {
    "title": "Uso de Cookies",
    "message": "Utilizamos cookies para mejorar su experiencia y garantizar la seguridad de sus datos. No almacenamos información sensible sin su consentimiento.",
    "accept": "Aceptar Todo",
    "decline": "Rechazar Todo",
    "privacy_policy": "Política de Privacidad",
    "consent_required_to_save": "Se requiere el consentimiento de cookies para guardar las claves de API. Por favor, revise sus preferencias en el banner de abajo.",
    "save_error": "No se pudo guardar su preferencia de cookies. Por favor, verifique la configuración de su navegador."
  },
}

export default es;
